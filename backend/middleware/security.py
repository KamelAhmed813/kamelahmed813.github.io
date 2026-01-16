"""
Security middleware for request validation and security headers.
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse
import structlog

logger = structlog.get_logger()


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers and validate requests."""
    
    async def dispatch(self, request: Request, call_next):
        """Process request and add security headers."""
        # Validate request size (prevent DoS)
        if request.headers.get("content-length"):
            content_length = int(request.headers.get("content-length", 0))
            max_size = 10 * 1024 * 1024  # 10MB
            if content_length > max_size:
                logger.warning(
                    "request_too_large",
                    path=request.url.path,
                    size=content_length,
                )
                return StarletteResponse(
                    status_code=413,
                    content="Request entity too large",
                )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Only add HSTS in production
        if not request.url.scheme == "http" or "localhost" not in request.url.hostname:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

