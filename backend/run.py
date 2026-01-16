#!/usr/bin/env python
"""
Simple script to run the FastAPI application.
Can be used as an alternative to `python app.py`
"""
import uvicorn
from config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.host,
        port=settings.port,
        # reload=settings.debug,
        log_level=settings.log_level.lower(),
    )

