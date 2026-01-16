"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime


class ContactFormRequest(BaseModel):
    """Contact form submission request model."""
    name: str = Field(..., min_length=1, max_length=100, description="Sender's name")
    email: EmailStr = Field(..., description="Sender's email address")
    subject: str = Field(..., min_length=1, max_length=200, description="Message subject")
    message: str = Field(..., min_length=10, max_length=5000, description="Message content")
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Sanitize and validate name."""
        # Remove leading/trailing whitespace
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        # Basic XSS prevention
        if "<" in v or ">" in v:
            raise ValueError("Name contains invalid characters")
        return v
    
    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Sanitize and validate message."""
        v = v.strip()
        if len(v) < 10:
            raise ValueError("Message must be at least 10 characters long")
        return v


class ContactFormResponse(BaseModel):
    """Contact form submission response model."""
    success: bool
    message: str
    errors: Optional[List[str]] = None


class ChatMessageRequest(BaseModel):
    """Chat message request model."""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    language: Optional[str] = Field("en", pattern="^(en|ar)$", description="Language preference")
    
    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Sanitize and validate message."""
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        return v


class ChatMessageResponse(BaseModel):
    """Chat message response model."""
    message: str = Field(..., description="AI response message")
    session_id: str = Field(..., description="Session ID for conversation continuity")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")


class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = False
    message: str
    errors: Optional[List[str]] = None

