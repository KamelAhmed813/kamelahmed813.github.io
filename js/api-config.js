/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

// API Base URL - Update this to match your backend server
// For development: http://localhost:8000
// For production: Update to your production API URL
// You can override this by setting window.API_BASE_URL before loading this script
const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) || 'http://localhost:8000';

// API Endpoints
const API_ENDPOINTS = {
  contact: `${API_BASE_URL}/api/contact`,
  chat: `${API_BASE_URL}/api/chat`,
  chatHistory: (sessionId) => `${API_BASE_URL}/api/chat/history/${sessionId}`,
  health: `${API_BASE_URL}/api/health`,
};

// Helper function to get API endpoint
function getApiEndpoint(endpoint, ...args) {
  if (typeof endpoint === 'function') {
    return endpoint(...args);
  }
  if (typeof endpoint === 'string' && API_ENDPOINTS[endpoint]) {
    return API_ENDPOINTS[endpoint];
  }
  return endpoint;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.API_BASE_URL = API_BASE_URL;
  window.API_ENDPOINTS = API_ENDPOINTS;
  window.getApiEndpoint = getApiEndpoint;
}

// Export for use in Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL, API_ENDPOINTS, getApiEndpoint };
}
