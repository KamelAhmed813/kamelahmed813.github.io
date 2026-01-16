/**
 * Application Rendering Functions
 * Handles dynamic rendering of all portfolio sections
 */

/**
 * Render experience timeline
 * @param {Array} items - Experience items array
 */
function renderExperience(items) {
  const container = document.getElementById("experience-list");
  if (!container) return;
  
  container.innerHTML = "";
  
  items.forEach((exp, index) => {
    const div = document.createElement("div");
    div.className = `card mb-8 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-smooth animate-slide-up`;
    div.style.animationDelay = `${index * 0.1}s`;
    
    div.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">${exp.role} — ${exp.company}</h3>
        <small class="text-gray-600 dark:text-gray-400 mt-2 md:mt-0">${exp.period}</small>
      </div>
      <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
        ${exp.details.map(d => `<li>${d}</li>`).join("")}
      </ul>
    `;
    container.appendChild(div);
  });
}

/**
 * Render skills by category
 * @param {Array} skills - Skills array with categories
 */
function renderSkills(skills) {
  const container = document.getElementById("skills-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (Array.isArray(skills) && skills.length > 0 && typeof skills[0] === 'object' && skills[0].category) {
    // New categorized structure
    skills.forEach((category, catIndex) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "mb-12 animate-slide-up";
      categoryDiv.style.animationDelay = `${catIndex * 0.1}s`;
      
      categoryDiv.innerHTML = `
        <h3 class="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">${category.category}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${category.items.map(item => `
            <div class="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-smooth group">
              <div class="flex items-center gap-3 mb-2">
                <i class="${item.icon} text-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-smooth"></i>
                <h4 class="font-semibold text-gray-900 dark:text-gray-100">${item.name}</h4>
              </div>
              ${item.description ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${item.description}</p>` : ''}
            </div>
          `).join("")}
        </div>
      `;
      container.appendChild(categoryDiv);
    });
  } else {
    // Fallback for old flat structure
    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
    
    skills.forEach((skill, index) => {
      const div = document.createElement("div");
      div.className = "p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-smooth animate-slide-up";
      div.style.animationDelay = `${index * 0.1}s`;
      div.textContent = skill;
      grid.appendChild(div);
    });
    
    container.appendChild(grid);
  }
}

/**
 * Render featured projects
 * @param {Array} projects - Projects array
 */
function renderProjects(projects) {
  const container = document.getElementById("projects-grid");
  if (!container || !projects || projects.length === 0) return;
  
  container.innerHTML = "";
  
  projects.forEach((project, index) => {
    // Determine which link to use: prefer 'link' if valid, otherwise use 'github'
    const projectLink = (project.link && project.link !== '#' && project.link.trim() !== '') 
      ? project.link 
      : (project.github && project.github.trim() !== '') 
        ? project.github 
        : null;
    
    // Create card wrapper (link if available, div otherwise)
    const cardWrapper = projectLink 
      ? document.createElement("a")
      : document.createElement("div");
    
    if (projectLink) {
      cardWrapper.href = projectLink;
      cardWrapper.target = "_blank";
      cardWrapper.rel = "noopener noreferrer";
      cardWrapper.className = "block group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-smooth transform hover:scale-105 animate-slide-up cursor-pointer";
    } else {
      cardWrapper.className = "group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-smooth transform hover:scale-105 animate-slide-up";
    }
    
    cardWrapper.style.animationDelay = `${index * 0.1}s`;
    
    const imageHtml = project.image 
      ? `<img src="${project.image}" alt="${project.title}" class="w-full h-48 object-cover group-hover:scale-110 transition-smooth duration-300" />`
      : `<div class="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
           <i class="fas fa-project-diagram text-white text-6xl"></i>
         </div>`;
    
    cardWrapper.innerHTML = `
      ${imageHtml}
      <div class="p-6">
        <h3 class="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">${project.title}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">${project.description}</p>
        
        ${project.techStack && project.techStack.length > 0 ? `
          <div class="flex flex-wrap gap-2 mb-4">
            ${project.techStack.map(tech => `
              <span class="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                ${tech}
              </span>
            `).join("")}
          </div>
        ` : ''}
        
        ${project.metrics ? `
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
            <i class="fas fa-chart-line mr-2"></i>${project.metrics}
          </p>
        ` : ''}
        
        ${projectLink ? `
          <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm">
            ${projectLink.includes('github.com') ? `
              <i class="fab fa-github"></i>
              <span>View on GitHub</span>
            ` : projectLink.includes('blog.html') ? `
              <i class="fas fa-book-open"></i>
              <span>Read Article</span>
            ` : `
              <i class="fas fa-external-link-alt"></i>
              <span>View Project</span>
            `}
          </div>
        ` : ''}
      </div>
    `;
    
    container.appendChild(cardWrapper);
  });
}

/**
 * Render testimonials
 * @param {Array} testimonials - Testimonials array
 */
function renderTestimonials(testimonials) {
  const container = document.getElementById("testimonials-grid");
  if (!container || !testimonials || testimonials.length === 0) return;
  
  container.innerHTML = "";
  
  testimonials.forEach((testimonial, index) => {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-smooth animate-slide-up";
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      <div class="mb-4">
        <i class="fas fa-quote-left text-3xl text-blue-500 dark:text-blue-400 opacity-50"></i>
      </div>
      <p class="text-gray-700 dark:text-gray-300 italic mb-6 text-lg leading-relaxed">
        "${testimonial.quote}"
      </p>
      <div class="flex items-center gap-4">
        ${testimonial.avatar ? `
          <img src="${testimonial.avatar}" alt="${testimonial.author}" class="w-12 h-12 rounded-full" />
        ` : `
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <i class="fas fa-user text-white"></i>
          </div>
        `}
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">${testimonial.author}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">${testimonial.role}${testimonial.company ? `, ${testimonial.company}` : ''}</p>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

/**
 * Render blog articles
 * @param {Array} articles - Blog articles array
 */
function renderBlog(articles) {
  const container = document.getElementById("blog-grid");
  if (!container || !articles || articles.length === 0) return;
  
  container.innerHTML = "";
  
  articles.forEach((article, index) => {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-smooth transform hover:scale-105 animate-slide-up";
    card.style.animationDelay = `${index * 0.1}s`;
    
    const date = new Date(article.date);
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const imageHtml = article.image 
      ? `<img src="${article.image}" alt="${article.title}" class="w-full h-48 object-cover group-hover:scale-110 transition-smooth duration-300" />`
      : `<div class="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
           <i class="fas fa-newspaper text-white text-6xl"></i>
         </div>`;
    
    card.innerHTML = `
      ${imageHtml}
      <div class="p-6">
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <i class="fas fa-calendar"></i>
          <span>${formattedDate}</span>
        </div>
        <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">${article.title}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">${article.excerpt}</p>
        <a href="${article.link}" 
           class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-smooth">
          Read More <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
    
    container.appendChild(card);
  });
}

/**
 * Render timeline from experience data
 * @param {Array} experience - Experience array
 * @param {string} title - Timeline title (optional)
 */
function renderTimeline(experience, title = null) {
  const container = document.getElementById("timeline-container");
  if (!container || !experience || experience.length === 0) return;
  
  const isRTL = document.body.dir === 'rtl';
  const timelineTitle = title || (isRTL ? "الخط الزمني المهني" : "Career Timeline");
  
  container.innerHTML = `
    <h3 class="text-2xl font-semibold mb-8 text-center" id="timeline-title">${timelineTitle}</h3>
    <div class="relative">
      <div class="absolute ${isRTL ? 'right-1/2' : 'left-1/2'} transform ${isRTL ? 'translate-x-1/2' : '-translate-x-1/2'} w-1 h-full bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
      ${experience.map((exp, index) => {
        const isEven = index % 2 === 0;
        const alignment = isRTL 
          ? (isEven ? 'md:pl-1/2 md:text-left' : 'md:pr-1/2 md:text-right')
          : (isEven ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:text-left');
        const margin = isRTL
          ? (isEven ? 'md:ml-auto' : 'md:mr-auto')
          : (isEven ? 'md:mr-auto' : 'md:ml-auto');
        const dotPosition = isRTL
          ? (isEven ? 'left-0 md:left-1/2 md:-translate-x-1/2' : 'right-0 md:right-1/2 md:translate-x-1/2')
          : (isEven ? 'right-0 md:right-1/2 md:translate-x-1/2' : 'left-0 md:left-1/2 md:-translate-x-1/2');
        
        return `
          <div class="relative mb-8 ${alignment} animate-slide-up" style="animation-delay: ${index * 0.1}s">
            <div class="md:w-1/2 ${margin}">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-smooth">
                <div class="absolute hidden md:block ${dotPosition} top-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800"></div>
                <h4 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">${exp.role}</h4>
                <p class="text-blue-600 dark:text-blue-400 font-medium mb-2">${exp.company}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${exp.period}</p>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/**
 * Navigate to chat page
 */
function goToChat() {
  window.location.href = "chat.html";
}

/**
 * Smooth scroll to section
 * @param {string} sectionId - Section ID to scroll to
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const headerOffset = 80;
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/**
 * Show/hide scroll to top button based on scroll position
 */
function handleScrollToTop() {
  const button = document.getElementById("scroll-to-top");
  if (!button) return;
  
  if (window.scrollY > 300) {
    button.classList.remove("opacity-0", "pointer-events-none");
    button.classList.add("opacity-100");
  } else {
    button.classList.add("opacity-0", "pointer-events-none");
    button.classList.remove("opacity-100");
  }
}

// Initialize scroll to top button
window.addEventListener("scroll", handleScrollToTop);

/**
 * Initialize scroll animations using Intersection Observer
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slide-up');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections and cards
  const elementsToAnimate = document.querySelectorAll('section, .card, [data-animate]');
  elementsToAnimate.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// Initialize scroll animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initScrollAnimations, 100);
  });
} else {
  setTimeout(initScrollAnimations, 100);
}
