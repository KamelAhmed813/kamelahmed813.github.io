# Quick Start Guide

Get your portfolio backend up and running in minutes!

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

## Step 1: Setup Environment

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Step 2: Configure Environment Variables

1. Create `.env` file:
```bash
python setup_env.py
```

Or manually create `.env` from `.env.example`:
```bash
cp .env.example .env
```

2. Edit `.env` and configure:

**Required for Chat:**
```env
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
# Note: For gemini-2.5-flash, use the appropriate model name when available
# The system prompt is loaded from data/system_prompt.txt
```

Note: Contact form submissions are logged but email notifications are disabled.

**Optional:**
- Adjust `CORS_ORIGINS` to match your frontend URL
- Change `PORT` if 8000 is already in use
- Adjust rate limiting settings

## Step 3: Run the Server

```bash
python app.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## Step 4: Test the API

1. **Health Check:**
```bash
curl http://localhost:8000/api/health
```

2. **View API Documentation:**
Open `http://localhost:8000/api/docs` in your browser

3. **Test Contact Form:**
```bash
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message with enough characters."
  }'
```

4. **Test Chat:**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, tell me about yourself",
    "language": "en"
  }'
```

## Step 5: Connect Frontend

1. Update `js/api-config.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

2. Open your frontend in a browser and test the contact form and chat!

## Troubleshooting

### Port Already in Use
Change the port in `.env`:
```env
PORT=8001
```

### CORS Errors
Add your frontend URL to `CORS_ORIGINS` in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,file://
```

### Chat Not Working
- Verify `GEMINI_API_KEY` is set correctly
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check Google Gemini API quota/limits
- Review logs for error messages
- Try using `gemini-1.5-flash` or `gemini-1.5-pro` if the experimental model doesn't work

### Module Not Found Errors
Make sure you're in the virtual environment and dependencies are installed:
```bash
pip install -r requirements.txt
```

## Next Steps

- Review `README.md` for detailed documentation
- Set up production deployment
- Configure monitoring and logging
- Add database for persistent storage (optional)

## Development Tips

- Use `--reload` flag for auto-reload during development
- Check logs in console for debugging
- Use API docs at `/api/docs` to test endpoints
- Run tests: `pytest`

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Use strong `SECRET_KEY`
3. Configure proper CORS origins
4. Set up HTTPS/SSL
5. Use environment variables for all secrets
6. Consider using Redis for rate limiting
7. Set up monitoring and logging

Happy coding! 🚀

