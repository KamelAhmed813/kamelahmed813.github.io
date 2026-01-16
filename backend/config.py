"""
Configuration management using Pydantic Settings.
Loads environment variables and provides type-safe configuration.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500,http://127.0.0.1:8080,file://"
    
    # AI/Google Gemini
    gemini_api_key: str = ""  # Can also be set via GEMINI_API_KEY env var
    gemini_model: str = "gemini-2.0-flash-exp"  # Use "gemini-2.0-flash-exp" or "gemini-1.5-flash" for stable models
    # Note: For gemini-2.5-flash, use "gemini-2.0-flash-exp" or check latest model names
    ai_temperature: float = 0.7
    ai_max_tokens: int = 500
    
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_per_minute: int = 10
    rate_limit_per_hour: int = 60
    
    # Database (Optional)
    database_url: str = ""
    
    # Security
    secret_key: str = "change-this-secret-key-in-production"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:5500"
    
    # Logging
    log_level: str = "INFO"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse allowed origins string into list."""
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()

