/**
 * Internationalization (i18n) System
 * Handles language switching and content loading
 */

let currentLang = localStorage.getItem('portfolio-lang') || "en";

// Make currentLang globally accessible
if (typeof window !== 'undefined') {
  window.currentLang = currentLang;
}

/**
 * Show loading state
 */
function showLoadingState() {
  const main = document.querySelector('main');
  if (main) {
    main.style.opacity = '0.5';
    main.style.pointerEvents = 'none';
  }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  const main = document.querySelector('main');
  if (main) {
    main.style.opacity = '1';
    main.style.pointerEvents = 'auto';
  }
}

/**
 * Load content from JSON file and render all sections
 */
async function loadContent() {
  // Check if we're on the chat page or blog page
  const isChatPage = window.location.pathname.includes('chat.html') || document.getElementById('chat-box');
  const isBlogPage = window.location.pathname.includes('blog.html');
  
  if (isChatPage) {
    // On chat page, load content and update chat-specific text
    try {
      const res = await fetch(`data/content.${currentLang}.json`);
      if (res.ok) {
        const data = await res.json();
        
        // Update document language and direction
        document.documentElement.lang = currentLang;
        document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
        
        // Update chat-specific text
        if (data.chat) {
          const chatTitle = document.getElementById("chat-title");
          const chatSubtitle = document.getElementById("chat-subtitle");
          const chatWelcomeMessage = document.getElementById("chat-welcome-message");
          const backToPortfolio = document.getElementById("back-to-portfolio");
          const userInput = document.getElementById("user-input");
          const connectionText = document.getElementById("connection-text");
          const typingText = document.getElementById("typing-text");
          
          if (chatTitle) chatTitle.textContent = data.chat.title;
          if (chatSubtitle) chatSubtitle.textContent = data.chat.subtitle;
          if (chatWelcomeMessage) chatWelcomeMessage.textContent = data.chat.welcomeMessage;
          if (backToPortfolio) backToPortfolio.textContent = data.chat.backToPortfolio;
          if (userInput) {
            userInput.placeholder = data.chat.placeholder;
          }
          if (connectionText) {
            connectionText.textContent = data.chat.connected;
          }
          if (typingText) {
            typingText.textContent = data.chat.typing;
          }
        }
        
        // Update language toggle button
        const langToggle = document.getElementById("lang-toggle");
        if (langToggle) {
          langToggle.textContent = currentLang === "en" ? "AR / EN" : "EN / AR";
        }
      }
    } catch (error) {
      console.warn("Could not load chat translations:", error);
    }
    
    // Update document language and direction (fallback)
    document.documentElement.lang = currentLang;
    document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
    
    // Store language preference
    localStorage.setItem('portfolio-lang', currentLang);
    return;
  }
  
  if (isBlogPage) {
    // On blog page, only update language-specific UI elements
    try {
      const res = await fetch(`data/content.${currentLang}.json`);
      if (res.ok) {
        const data = await res.json();
        
        // Update document language and direction
        document.documentElement.lang = currentLang;
        document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
        
        // Update UI text if blog.js function exists
        if (typeof updateLanguageText === 'function') {
          updateLanguageText();
        }
        
        // Update language toggle button
        const langToggle = document.getElementById("lang-toggle");
        if (langToggle) {
          langToggle.textContent = currentLang === "en" ? "AR / EN" : "EN / AR";
        }
        
        // Update back to portfolio link
        const backToPortfolio = document.getElementById("back-to-portfolio");
        if (backToPortfolio && data.chat) {
          backToPortfolio.textContent = data.chat.backToPortfolio || "Back to Portfolio";
        }
      }
    } catch (error) {
      console.warn("Could not load blog translations:", error);
    }
    
    // Update document language and direction (fallback)
    document.documentElement.lang = currentLang;
    document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
    
    // Store language preference
    localStorage.setItem('portfolio-lang', currentLang);
    return;
  }
  
  showLoadingState();
  
  try {
    // Use absolute path if opening from file://, otherwise use relative path
    let contentUrl = `data/content.${currentLang}.json`;
    
    // If opening from file:// protocol, we need to use a server
    if (window.location.protocol === 'file:') {
      // Try to detect if we're in a server environment
      console.warn('Opening from file:// protocol. JSON files require a web server.');
      console.warn('Please use: python -m http.server 8080 (or similar)');
    }
    
    const res = await fetch(contentUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();

    // Update document language and direction
    document.documentElement.lang = currentLang;
    document.body.dir = currentLang === "ar" ? "rtl" : "ltr";

    // Hero Section
    const heroName = document.getElementById("hero-name");
    const heroTitle = document.getElementById("hero-title");
    const heroSubtitle = document.getElementById("hero-subtitle");
    const heroCta = document.getElementById("hero-cta");
    
    if (heroName) heroName.textContent = data.hero.name;
    if (heroTitle) heroTitle.textContent = data.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = data.hero.subtitle;
    if (heroCta) heroCta.textContent = data.hero.cta;
    
    // Hero Image
    if (data.hero.image) {
      const heroImageContainer = document.getElementById("hero-image-container");
      if (heroImageContainer) {
        heroImageContainer.innerHTML = `<img src="${data.hero.image}" alt="${data.hero.name}" class="w-full h-full object-cover" />`;
      }
    }

    // About Section
    const aboutHeading = document.getElementById("about-heading");
    const aboutText = document.getElementById("about-text");
    const aboutStory = document.getElementById("about-story");
    const aboutStoryTitle = document.getElementById("about-story-title");
    const aboutSkillsTitle = document.getElementById("about-skills-title");
    const aboutSkillsSummary = document.getElementById("about-skills-summary");
    
    if (aboutHeading) aboutHeading.textContent = data.about.heading;
    if (aboutText) aboutText.textContent = data.about.text;
    if (aboutStory) aboutStory.textContent = data.about.story || "";
    if (aboutStoryTitle) aboutStoryTitle.textContent = data.about.storyTitle || "My Story";
    if (aboutSkillsTitle) aboutSkillsTitle.textContent = data.about.skillsTitle || "Key Skills";
    
    // Render skills summary
    if (aboutSkillsSummary && data.about.skillsSummary) {
      aboutSkillsSummary.innerHTML = data.about.skillsSummary.map(skill => 
        `<span class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">${skill}</span>`
      ).join("");
    }

    // Experience Section
    const experienceHeading = document.getElementById("experience-heading");
    if (experienceHeading) {
      experienceHeading.textContent = data.ui?.experienceHeading || "Experience";
    }
    if (data.experience && Array.isArray(data.experience)) {
      const experienceContainer = document.getElementById("experience-list");
      if (experienceContainer && typeof renderExperience === 'function') {
        renderExperience(data.experience);
      }
      
      // Render timeline (only if function exists and container exists)
      const timelineContainer = document.getElementById("timeline-container");
      if (timelineContainer && typeof renderTimeline === 'function') {
        const timelineTitle = data.ui?.timelineTitle || (currentLang === 'ar' ? "الخط الزمني المهني" : "Career Timeline");
        renderTimeline(data.experience, timelineTitle);
      }
    }

    // Projects Section
    const projectsHeading = document.getElementById("projects-heading");
    if (projectsHeading) {
      projectsHeading.textContent = data.ui?.projectsHeading || "Featured Projects";
    }
    if (data.projects && typeof renderProjects === 'function') {
      renderProjects(data.projects);
    }

    // Skills Section
    const skillsHeading = document.getElementById("skills-heading");
    if (skillsHeading) {
      skillsHeading.textContent = data.ui?.skillsHeading || "Technical Skills";
    }
    if (data.skills && typeof renderSkills === 'function') {
      renderSkills(data.skills);
    }

    // Testimonials Section
    const testimonialsHeading = document.getElementById("testimonials-heading");
    if (testimonialsHeading) {
      testimonialsHeading.textContent = data.ui?.testimonialsHeading || "Testimonials";
    }
    if (data.testimonials && typeof renderTestimonials === 'function') {
      renderTestimonials(data.testimonials);
    }

    // Blog Section
    const blogHeading = document.getElementById("blog-heading");
    if (blogHeading) {
      blogHeading.textContent = data.ui?.blogHeading || "Blog & Articles";
    }
    if (data.blog && typeof renderBlog === 'function') {
      renderBlog(data.blog);
    }

    // Contact Section
    const contactHeading = document.getElementById("contact-heading");
    const contactText = document.getElementById("contact-text");
    const contactSocialTitle = document.getElementById("contact-social-title");
    const contactCalendarTitle = document.getElementById("contact-calendar-title");
    const calendarLink = document.getElementById("calendar-link");
    const calendarLinkText = document.getElementById("calendar-link-text");
    const viewProjectsText = document.getElementById("view-projects-text");
    
    if (contactHeading) contactHeading.textContent = data.contact.heading;
    if (contactText) contactText.textContent = data.contact.text;
    if (contactSocialTitle) contactSocialTitle.textContent = data.contact.socialTitle || "Connect With Me";
    if (contactCalendarTitle) contactCalendarTitle.textContent = data.contact.calendarTitle || "Schedule a Meeting";
    if (calendarLink && data.contact.calendarLink) {
      calendarLink.href = data.contact.calendarLink;
    }
    if (calendarLinkText) calendarLinkText.textContent = data.contact.calendarLinkText || "Book a Call";
    if (viewProjectsText) viewProjectsText.textContent = data.ui?.viewProjects || "View Projects";

    // Contact Form Labels
    const contactForm = document.getElementById("contact-form");
    if (contactForm && data.contact.form) {
      const nameLabel = contactForm.querySelector('label[for="contact-name"]');
      const emailLabel = contactForm.querySelector('label[for="contact-email"]');
      const subjectLabel = contactForm.querySelector('label[for="contact-subject"]');
      const messageLabel = contactForm.querySelector('label[for="contact-message"]');
      const submitText = document.getElementById("contact-submit-text");
      
      if (nameLabel) nameLabel.textContent = data.contact.form.nameLabel || "Name";
      if (emailLabel) emailLabel.textContent = data.contact.form.emailLabel || "Email";
      if (subjectLabel) subjectLabel.textContent = data.contact.form.subjectLabel || "Subject";
      if (messageLabel) messageLabel.textContent = data.contact.form.messageLabel || "Message";
      if (submitText) submitText.textContent = data.contact.form.submitText || "Send Message";
    }

    // Social Links
    const socialLinksContainer = document.getElementById("social-links");
    if (socialLinksContainer && data.contact.socialLinks) {
      socialLinksContainer.innerHTML = data.contact.socialLinks.map(link => `
        <a href="${link.url}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth group">
          <i class="${link.icon} text-xl text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-smooth"></i>
          <span class="font-medium text-gray-700 dark:text-gray-300">${link.platform}</span>
        </a>
      `).join("");
    }

    // Language Toggle Button
    const langToggle = document.getElementById("lang-toggle");
    if (langToggle) {
      langToggle.textContent = currentLang === "en" ? "AR / EN" : "EN / AR";
    }

    // Store language preference
    localStorage.setItem('portfolio-lang', currentLang);
    
    hideLoadingState();
    
    // Re-initialize scroll animations after content loads
    if (typeof initScrollAnimations === 'function') {
      setTimeout(initScrollAnimations, 100);
    }

  } catch (error) {
    console.error("Error loading content:", error);
    hideLoadingState();
    
    // Determine error type and show helpful message
    let errorMessage = "Failed to load content. ";
    let errorDetails = "";
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      // CORS or network error - likely opening file directly
      if (window.location.protocol === 'file:') {
        errorMessage = "⚠️ Cannot load content when opening file directly. ";
        errorDetails = "Please use a local web server. See instructions below.";
      } else {
        errorMessage = "Network error loading content. ";
        errorDetails = "Please check your connection and try again.";
      }
    } else if (error.message.includes('404')) {
      errorMessage = "Content file not found. ";
      errorDetails = `Looking for: data/content.${currentLang}.json`;
    } else {
      errorDetails = error.message;
    }
    
    // Show error message to user
    const errorMsg = document.createElement("div");
    errorMsg.className = "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md";
    errorMsg.innerHTML = `
      <div class="font-semibold mb-2">${errorMessage}</div>
      <div class="text-sm opacity-90">${errorDetails}</div>
      ${window.location.protocol === 'file:' ? `
        <div class="mt-3 pt-3 border-t border-red-400">
          <div class="text-xs font-semibold mb-1">Quick Fix:</div>
          <div class="text-xs">
            Run: <code class="bg-red-600 px-2 py-1 rounded">python -m http.server 8080</code><br>
            Then open: <code class="bg-red-600 px-2 py-1 rounded">http://localhost:8080</code>
          </div>
        </div>
      ` : ''}
    `;
    document.body.appendChild(errorMsg);
    setTimeout(() => errorMsg.remove(), 10000);
  }
}

/**
 * Toggle between English and Arabic
 */
function toggleLanguage() {
  // Prevent infinite recursion
  if (window._togglingLanguage) {
    console.warn('Language toggle already in progress');
    return;
  }
  
  window._togglingLanguage = true;
  currentLang = currentLang === "en" ? "ar" : "en";
  
  // Make currentLang globally accessible
  if (typeof window !== 'undefined') {
    window.currentLang = currentLang;
  }
  
  // Dispatch custom event for blog.js
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
  
  try {
    loadContent();
  } finally {
    // Clear flag after a short delay to allow loadContent to complete
    setTimeout(() => {
      window._togglingLanguage = false;
    }, 100);
  }
}

// Make toggleLanguage globally accessible
if (typeof window !== 'undefined') {
  window.toggleLanguage = toggleLanguage;
}

/**
 * Handle contact form submission
 * @param {Event} event - Form submit event
 */
async function handleContactSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const messageDiv = document.getElementById("contact-form-message");
  
  // Get form labels from current language
  let formLabels = {
    nameLabel: "Name",
    emailLabel: "Email",
    subjectLabel: "Subject",
    messageLabel: "Message",
    submitText: "Send Message",
    successMessage: "Thank you! Your message has been sent.",
    errorMessage: "Something went wrong. Please try again."
  };
  
  try {
    const currentData = await fetch(`data/content.${currentLang}.json`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    if (currentData.contact && currentData.contact.form) {
      formLabels = currentData.contact.form;
    }
  } catch (error) {
    console.warn("Could not load form labels, using defaults:", error);
  }
  
  // Validate form
  const name = formData.get("name");
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");
  
  if (!name || !email || !subject || !message) {
    if (messageDiv) {
      messageDiv.className = "mt-4 text-center text-red-600 dark:text-red-400";
      messageDiv.textContent = "Please fill in all fields.";
    }
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    if (messageDiv) {
      messageDiv.className = "mt-4 text-center text-red-600 dark:text-red-400";
      messageDiv.textContent = "Please enter a valid email address.";
    }
    return;
  }
  
  // Show loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
  }
  
  try {
    // Use API endpoint from api-config.js
    const apiUrl = (typeof getApiEndpoint !== 'undefined' && getApiEndpoint) 
      ? getApiEndpoint('contact')
      : (typeof API_ENDPOINTS !== 'undefined' ? API_ENDPOINTS.contact : '/api/contact');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        language: currentLang
      })
    });
    
    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error(`Invalid response from server (${response.status})`);
    }

    if (response.ok) {
      if (messageDiv) {
        messageDiv.className = "mt-4 text-center text-green-600 dark:text-green-400";
        messageDiv.textContent = data.message || formLabels.successMessage || "Thank you! Your message has been sent.";
      }
      form.reset();
    } else {
      // Handle error response from backend
      const errorMessage = data?.detail?.message || data?.message || `Server error (${response.status})`;
      const errors = data?.detail?.errors || [];
      
      console.error('Contact form API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      throw new Error(errorMessage + (errors.length > 0 ? ': ' + errors.join(', ') : ''));
    }
  } catch (error) {
    console.error("Contact form error:", error);
    if (messageDiv) {
      messageDiv.className = "mt-4 text-center text-red-600 dark:text-red-400";
      
      let errorMessage = formLabels.errorMessage || "Something went wrong. Please try again.";
      if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = "Cannot connect to the server. Please check if the backend is running.";
        } else {
          errorMessage = error.message;
        }
      }
      
      messageDiv.textContent = errorMessage;
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = `<span>${formLabels.submitText || "Send Message"}</span>`;
    }
  }
}

// Initialize contact form handler
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
  }
});

// Load content when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContent);
} else {
  loadContent();
}
