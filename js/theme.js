/**
 * Theme Management System
 * Handles theme switching, persistence, and UI updates
 */

const THEME_KEY = 'portfolio-theme';
const THEMES = {
  light: 'light',
  dark: 'dark'
};

/**
 * Initialize theme on page load
 */
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Use saved theme, or system preference, or default to light
  const initialTheme = savedTheme || (prefersDark ? THEMES.dark : THEMES.light);
  
  setTheme(initialTheme);
  updateThemeIcon(initialTheme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || THEMES.light;
  const newTheme = currentTheme === THEMES.dark ? THEMES.light : THEMES.dark;
  
  setTheme(newTheme);
  updateThemeIcon(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}

/**
 * Set the theme on the document
 * @param {string} theme - Theme name ('light' or 'dark')
 */
function setTheme(theme) {
  if (theme === THEMES.dark) {
    document.documentElement.setAttribute('data-theme', THEMES.dark);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  
  // Dispatch custom event for components that need to react to theme changes
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

/**
 * Update the theme toggle button icon
 * @param {string} theme - Current theme
 */
function updateThemeIcon(theme) {
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  
  themeButtons.forEach(button => {
    if (theme === THEMES.dark) {
      button.innerHTML = '<i class="fas fa-sun"></i>';
      button.setAttribute('aria-label', 'Switch to light theme');
    } else {
      button.innerHTML = '<i class="fas fa-moon"></i>';
      button.setAttribute('aria-label', 'Switch to dark theme');
    }
  });
}

/**
 * Get current theme
 * @returns {string} Current theme name
 */
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || THEMES.light;
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // Only auto-switch if user hasn't set a preference
  if (!localStorage.getItem(THEME_KEY)) {
    const newTheme = e.matches ? THEMES.dark : THEMES.light;
    setTheme(newTheme);
    updateThemeIcon(newTheme);
  }
});

