# Portfolio Website

A modern, responsive portfolio website with bilingual support (English/Arabic), dark mode, and interactive features.

## Features

- 🌐 **Bilingual Support**: English and Arabic with RTL support
- 🌙 **Dark Mode**: Theme switching with persistence
- 📱 **Responsive Design**: Mobile-first, works on all devices
- 🎨 **Modern UI**: Built with Tailwind CSS
- 💬 **Chat Interface**: AI-powered chat with digital persona
- 📧 **Contact Form**: Integrated contact form with validation
- 🚀 **Fast & Lightweight**: Vanilla JavaScript, no heavy frameworks

## Quick Start

### Option 1: Using Python HTTP Server (Recommended)

1. **Start the server:**
   ```bash
   # Windows
   python start-server.py
   # or double-click start-server.bat
   
   # Linux/Mac
   python3 start-server.py
   ```

2. **Open in browser:**
   - The server will automatically open `http://localhost:8080/index.html`
   - Or manually navigate to: `http://localhost:8080/index.html`

### Option 2: Using Python's Built-in Server

```bash
# Navigate to the project directory
cd "Digital version"

# Start server (Python 3)
python -m http.server 8080

# Or (Python 2)
python -m SimpleHTTPServer 8080
```

Then open: `http://localhost:8080/index.html`

### Option 3: Using Node.js http-server

```bash
# Install http-server globally (one time)
npm install -g http-server

# Start server
http-server -p 8080
```

## Backend Integration

The backend API is configured in `js/api-config.js`. By default, it points to:
- Development: `http://localhost:8000`
- Production: Update `API_BASE_URL` in `api-config.js`

### To use a different backend URL:

1. **Before loading the page**, set the API URL:
   ```html
   <script>
     window.API_BASE_URL = 'http://your-backend-url:8000';
   </script>
   <script src="js/api-config.js"></script>
   ```

2. **Or edit** `js/api-config.js` directly:
   ```javascript
   const API_BASE_URL = 'http://your-backend-url:8000';
   ```

## Project Structure

```
.
├── index.html          # Main portfolio page
├── chat.html           # Chat interface
|
├── assets/
│   ├── icons           # Custom icons
│   └── images/
│       ├── blog/          # Add blog images
│       ├── hero/          # Add the hero section image
│       ├── projects/      # Add the project images
│       └── testimonials/  # Add testimonials person images
|
├── backend/           # Directory for the backend project
|
├── css/
│   ├── style.css      # Custom styles and animations
│   └── themes.css     # Theme variables
├── js/
│   ├── app.js         # Rendering functions
│   ├── i18n.js        # Internationalization
│   ├── theme.js       # Theme management
│   └── api-config.js  # API configuration
├── data/
│   ├── content.en.json # English content
│   └── content.ar.json # Arabic content
└── start-server.py    # Local development server
```

## Development

### Adding Content

Edit the JSON files in `data/`:
- `content.en.json` - English content
- `content.ar.json` - Arabic content

### Customizing Styles

- `css/style.css` - Custom animations and utilities
- `css/themes.css` - Theme color variables
- Tailwind CSS classes in HTML files

### API Endpoints

The frontend expects these backend endpoints:
- `POST /api/contact` - Contact form submission
- `POST /api/chat` - Chat message handling
- `GET /api/chat/history/:sessionId` - Chat history (optional)
- `GET /api/health` - Health check (optional)

## Troubleshooting

### "Failed to load content" Error

**Problem**: Opening `index.html` directly from file system.

**Solution**: Use a web server (see Quick Start above). Browsers block local file fetches for security.

### CORS Errors

**Problem**: API calls blocked by CORS policy.

**Solution**: 
1. Ensure backend has CORS enabled for your frontend domain
2. Use the same origin for frontend and backend, or
3. Configure CORS headers in your backend

### Content Not Loading

1. Check browser console for errors
2. Verify JSON files exist in `data/` directory
3. Ensure server is running and accessible
4. Check file paths are correct

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use this for your own portfolio!

