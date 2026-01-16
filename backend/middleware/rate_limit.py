"""
Rate limiting middleware using in-memory storage.
For production, consider using Redis-based rate limiting.
"""
from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Tuple
import structlog
from config import settings

logger = structlog.get_logger()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent abuse."""
    
    def __init__(self, app):
        super().__init__(app)
        self.requests_per_minute = defaultdict(list)
        self.requests_per_hour = defaultdict(list)
        self.cleanup_interval = timedelta(minutes=5)
        self.last_cleanup = datetime.now()
    
    def get_client_id(self, request: Request) -> str:
        """Get unique identifier for client (IP address)."""
        # Try to get real IP from proxy headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def is_rate_limited(self, client_id: str) -> Tuple[bool, str]:
        """Check if client has exceeded rate limits."""
        now = datetime.now()
        
        # Cleanup old entries periodically
        if now - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_entries(now)
            self.last_cleanup = now
        
        # Check per-minute limit
        minute_ago = now - timedelta(minutes=1)
        recent_requests = [
            req_time for req_time in self.requests_per_minute[client_id]
            if req_time > minute_ago
        ]
        self.requests_per_minute[client_id] = recent_requests
        
        if len(recent_requests) >= settings.rate_limit_per_minute:
            return True, "Too many requests per minute. Please try again later."
        
        # Check per-hour limit
        hour_ago = now - timedelta(hours=1)
        recent_requests_hour = [
            req_time for req_time in self.requests_per_hour[client_id]
            if req_time > hour_ago
        ]
        self.requests_per_hour[client_id] = recent_requests_hour
        
        if len(recent_requests_hour) >= settings.rate_limit_per_hour:
            return True, "Too many requests per hour. Please try again later."
        
        # Record this request
        self.requests_per_minute[client_id].append(now)
        self.requests_per_hour[client_id].append(now)
        
        return False, ""
    
    def _cleanup_old_entries(self, now: datetime):
        """Remove old entries from rate limit tracking."""
        minute_ago = now - timedelta(minutes=1)
        hour_ago = now - timedelta(hours=1)
        
        # Cleanup per-minute tracking
        for client_id in list(self.requests_per_minute.keys()):
            self.requests_per_minute[client_id] = [
                req_time for req_time in self.requests_per_minute[client_id]
                if req_time > minute_ago
            ]
            if not self.requests_per_minute[client_id]:
                del self.requests_per_minute[client_id]
        
        # Cleanup per-hour tracking
        for client_id in list(self.requests_per_hour.keys()):
            self.requests_per_hour[client_id] = [
                req_time for req_time in self.requests_per_hour[client_id]
                if req_time > hour_ago
            ]
            if not self.requests_per_hour[client_id]:
                del self.requests_per_hour[client_id]
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/", "/api/health", "/api/docs", "/api/redoc", "/api/openapi.json"]:
            return await call_next(request)
        
        # Skip rate limiting in test mode or when test header is present
        if settings.environment == "test" or request.headers.get("X-Test-Mode") == "true":
            return await call_next(request)
        
        client_id = self.get_client_id(request)
        is_limited, message = self.is_rate_limited(client_id)
        
        if is_limited:
            logger.warning(
                "rate_limit_exceeded",
                client_id=client_id,
                path=request.url.path,
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "message": message,
                },
            )
        
        return await call_next(request)

