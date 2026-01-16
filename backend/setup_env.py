"""
Helper script to create .env file from .env.example
"""
import os
import shutil

def setup_env():
    """Create .env file from .env.example if it doesn't exist."""
    env_example = ".env.example"
    env_file = ".env"
    
    if os.path.exists(env_file):
        print(f"{env_file} already exists. Skipping creation.")
        return
    
    if os.path.exists(env_example):
        shutil.copy(env_example, env_file)
        print(f"Created {env_file} from {env_example}")
        print("Please edit .env and configure your settings.")
    else:
        print(f"{env_example} not found. Creating basic .env file...")
        # Create basic .env file
        with open(env_file, "w") as f:
            f.write("""# Environment Configuration
ENVIRONMENT=development
DEBUG=True

# Server Configuration
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,file://

# AI/Google Gemini Configuration
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash-exp
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500

# Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_HOUR=60

# Database (Optional)
DATABASE_URL=

# Security
SECRET_KEY=change-this-secret-key-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500

# Logging
LOG_LEVEL=INFO
""")
        print(f"Created basic {env_file} file.")
        print("Please edit .env and configure your settings.")

if __name__ == "__main__":
    setup_env()

