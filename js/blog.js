/**
 * Blog Detail Page Handler
 * Loads and renders markdown blog posts with table of contents
 */

// Function to get current language (syncs with i18n.js)
// DO NOT declare currentLang here - it's already declared in i18n.js
function getCurrentLang() {
  // Try to get from i18n.js first (it's exposed on window)
  if (typeof window !== 'undefined' && window.currentLang !== undefined) {
    return window.currentLang;
  }
  // Fallback to localStorage
  return localStorage.getItem('portfolio-lang') || 'en';
}

/**
 * Get blog slug from URL
 */
function getBlogSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || params.get('id');
}

/**
 * Load blog metadata from JSON
 */
async function loadBlogMetadata(slug) {
  try {
    const lang = getCurrentLang();
    const res = await fetch(`data/content.${lang}.json`);
    
    if (!res.ok) {
      console.error(`Failed to fetch content.${lang}.json: HTTP ${res.status}`);
      throw new Error(`Failed to load blog metadata: HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    const blog = data.blog?.find(b => {
      // Extract slug from link or generate from title
      const blogSlug = b.slug || b.link?.split('?slug=')[1] || b.link?.split('?id=')[1] || 
                       b.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return blogSlug === slug;
    });
    
    if (!blog) {
      console.warn('Blog metadata not found for slug:', slug);
    }
    
    return blog || null;
  } catch (error) {
    console.error('Error loading blog metadata:', error);
    throw error; // Re-throw to be caught by loadBlogPost
  }
}

/**
 * Load markdown content from file
 */
async function loadMarkdownContent(slug) {
  try {
    const lang = getCurrentLang();
    const res = await fetch(`data/blogs/${slug}.md`);
    
    if (!res.ok) {
      // Try with language suffix
      const resLang = await fetch(`data/blogs/${slug}.${lang}.md`);
      if (resLang.ok) {
        return await resLang.text();
      }
      throw new Error(`Markdown file not found: ${slug}.md (HTTP ${res.status})`);
    }
    
    return await res.text();
  } catch (error) {
    console.error('Error loading markdown:', error);
    throw new Error(`Failed to load markdown file: ${error.message}`);
  }
}

/**
 * Extract frontmatter from markdown
 */
function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);
  
  if (match) {
    const frontmatter = {};
    const content = match[2];
    
    match[1].split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
        frontmatter[key] = value;
      }
    });
    
    return { frontmatter, content };
  }
  
  return { frontmatter: {}, content: markdown };
}

/**
 * Generate table of contents from markdown headings
 */
function generateTableOfContents(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const toc = [];
  
  headings.forEach((heading) => {
    // Generate ID if not present
    if (!heading.id) {
      const text = heading.textContent.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
      heading.id = text || `heading-${Date.now()}`;
    }
    
    const level = parseInt(heading.tagName.charAt(1));
    toc.push({
      id: heading.id,
      text: heading.textContent,
      level: level
    });
  });
  
  return toc;
}

/**
 * Create TOC link element
 */
function createTOCLink(item) {
  const link = document.createElement('a');
  link.href = `#${item.id}`;
  link.className = `block py-2 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth text-sm ${
    item.level === 1 ? 'font-semibold text-gray-900 dark:text-gray-100' : 
    item.level === 2 ? 'text-gray-700 dark:text-gray-300 ml-4' : 
    'text-gray-600 dark:text-gray-400 ml-8'
  }`;
  link.textContent = item.text;
  
  // Smooth scroll
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(item.id);
    if (target) {
      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile TOC after clicking
      const mobileTOC = document.getElementById('mobile-toc');
      if (mobileTOC) {
        mobileTOC.classList.add('hidden');
        const icon = document.getElementById('toc-toggle-icon');
        if (icon) icon.classList.remove('rotate-180');
      }
    }
  });
  
  return link;
}

/**
 * Render table of contents
 */
function renderTableOfContents(toc) {
  if (toc.length === 0) {
    const sidebar = document.getElementById('toc-sidebar');
    if (sidebar) sidebar.classList.add('hidden');
    return;
  }
  
  const sidebar = document.getElementById('toc-sidebar');
  if (sidebar) sidebar.classList.remove('hidden');
  
  // Desktop TOC
  const tocContainer = document.getElementById('table-of-contents');
  if (tocContainer) {
    tocContainer.innerHTML = '';
    toc.forEach(item => {
      tocContainer.appendChild(createTOCLink(item));
    });
  }
  
  // Mobile TOC
  const mobileTocContainer = document.getElementById('table-of-contents-mobile');
  if (mobileTocContainer) {
    mobileTocContainer.innerHTML = '';
    toc.forEach(item => {
      mobileTocContainer.appendChild(createTOCLink(item));
    });
  }
}

/**
 * Toggle mobile table of contents
 */
function toggleMobileTOC() {
  const mobileTOC = document.getElementById('mobile-toc');
  const icon = document.getElementById('toc-toggle-icon');
  
  if (mobileTOC && icon) {
    mobileTOC.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
  }
}

// Make toggleMobileTOC globally accessible
if (typeof window !== 'undefined') {
  window.toggleMobileTOC = toggleMobileTOC;
}

/**
 * Configure marked.js for better rendering
 */
function configureMarked() {
  if (typeof marked === 'undefined') {
    console.error('marked.js library is not loaded');
    throw new Error('Markdown parser (marked.js) is not available');
  }
  
  try {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    });
    
    // Add custom renderer for code blocks
    const renderer = new marked.Renderer();
    
    // Custom heading renderer with IDs
    renderer.heading = function(text, level) {
      const escapedText = text.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
      return `<h${level} id="${escapedText}" class="scroll-mt-24">${text}</h${level}>`;
    };
    
    // Custom code block renderer
    renderer.code = function(code, language) {
      const lang = language || 'text';
      return `<pre class="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto"><code class="language-${lang}">${code}</code></pre>`;
    };
    
    // Custom blockquote renderer
    renderer.blockquote = function(quote) {
      return `<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300">${quote}</blockquote>`;
    };
    
    // Custom link renderer
    renderer.link = function(href, title, text) {
      const isExternal = href.startsWith('http');
      return `<a href="${href}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-blue-600 dark:text-blue-400 hover:underline">${text}</a>`;
    };
    
    marked.use({ renderer });
  } catch (error) {
    console.error('Error configuring marked.js:', error);
    // Continue with default configuration if custom renderer fails
  }
}

/**
 * Load and render blog post
 */
async function loadBlogPost() {
  try {
    const slug = getBlogSlug();
    
    if (!slug) {
      console.error('No slug found in URL');
      hideLoadingState();
      showError('No blog post specified. Please provide a valid blog post slug in the URL.');
      return;
    }
    
    // Check if marked.js is loaded
    if (typeof marked === 'undefined') {
      console.error('marked.js is not loaded');
      hideLoadingState();
      showError('Markdown parser not available. Please refresh the page.');
      return;
    }
    
    // Load metadata from JSON
    let metadata = null;
    try {
      metadata = await loadBlogMetadata(slug);
    } catch (error) {
      console.warn('Failed to load metadata, continuing with markdown file only:', error);
      // Continue without metadata - we can extract from frontmatter
    }
    
    // Load markdown content
    const markdown = await loadMarkdownContent(slug);
    
    const { frontmatter, content } = parseFrontmatter(markdown);
    
    // Merge frontmatter with metadata (frontmatter takes precedence)
    const blogData = {
      title: frontmatter.title || metadata?.title || 'Untitled',
      date: frontmatter.date || metadata?.date || new Date().toISOString().split('T')[0],
      image: frontmatter.image || metadata?.image || '',
      excerpt: frontmatter.excerpt || frontmatter.description || metadata?.excerpt || ''
    };
    
    // Update page title
    document.title = `${blogData.title} | Kamel Ahmed`;
    
    // Render hero section
    renderBlogHero(blogData);
    
    // Configure and parse markdown
    configureMarked();
    
    const htmlContent = marked.parse(content);
    
    // Render content
    const contentContainer = document.getElementById('blog-content');
    if (!contentContainer) {
      throw new Error('Blog content container not found');
    }
    
    contentContainer.innerHTML = htmlContent;
    
    // Add custom styling classes to markdown elements
    addMarkdownStyles(contentContainer);
    
    // Generate and render table of contents
    const toc = generateTableOfContents(htmlContent);
    renderTableOfContents(toc);
    
    // Show article, hide loading
    hideLoadingState();
    const blogArticle = document.getElementById('blog-article');
    
    if (blogArticle) {
      blogArticle.classList.remove('hidden');
    } else {
      console.error('Blog article container not found');
    }
    
    // Update language-specific text
    updateLanguageText();
    
  } catch (error) {
    console.error('Error loading blog post:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Ensure loading state is hidden
    hideLoadingState();
    
    // Show user-friendly error message
    let errorMessage = `Failed to load blog post: ${error.message}`;
    
    // Provide more specific error messages
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to fetch blog content. Please check your connection and ensure you are using a web server (not opening the file directly).';
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      errorMessage = 'Blog post not found. Please check the URL and try again.';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Invalid blog metadata format. Please check the content files.';
    }
    
    showError(errorMessage);
  }
}

/**
 * Render blog hero section
 */
function renderBlogHero(data) {
  const titleEl = document.getElementById('blog-title');
  const excerptEl = document.getElementById('blog-excerpt');
  const dateEl = document.getElementById('blog-date');
  const heroImageEl = document.getElementById('blog-hero-image');
  
  if (titleEl) titleEl.textContent = data.title;
  if (excerptEl) excerptEl.textContent = data.excerpt;
  
  if (dateEl) {
    const date = new Date(data.date);
    dateEl.textContent = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  if (heroImageEl && data.image) {
    heroImageEl.innerHTML = `<img src="${data.image}" alt="${data.title}" class="w-full h-full object-cover" />`;
  }
}

/**
 * Add custom styles to markdown elements
 */
function addMarkdownStyles(container) {
  // Style headings
  container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    heading.classList.add('font-bold', 'text-gray-900', 'dark:text-gray-100', 'mt-8', 'mb-4');
    if (heading.tagName === 'H1') heading.classList.add('text-4xl');
    if (heading.tagName === 'H2') heading.classList.add('text-3xl');
    if (heading.tagName === 'H3') heading.classList.add('text-2xl');
  });
  
  // Style paragraphs
  container.querySelectorAll('p').forEach(p => {
    p.classList.add('mb-4', 'text-gray-700', 'dark:text-gray-300', 'leading-relaxed');
  });
  
  // Style lists
  container.querySelectorAll('ul, ol').forEach(list => {
    list.classList.add('mb-4', 'ml-6', 'space-y-2');
  });
  
  container.querySelectorAll('li').forEach(li => {
    li.classList.add('text-gray-700', 'dark:text-gray-300');
  });
  
  // Style images
  container.querySelectorAll('img').forEach(img => {
    img.classList.add('rounded-lg', 'shadow-md', 'my-6', 'w-full', 'h-auto');
  });
  
  // Style code
  container.querySelectorAll('code:not(pre code)').forEach(code => {
    code.classList.add('bg-gray-100', 'dark:bg-gray-900', 'px-2', 'py-1', 'rounded', 'text-sm', 'font-mono');
  });
  
  // Style horizontal rules
  container.querySelectorAll('hr').forEach(hr => {
    hr.classList.add('my-8', 'border-gray-300', 'dark:border-gray-700');
  });
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.classList.add('hidden');
  }
}

/**
 * Show error state
 */
function showError(message) {
  console.error('Showing error:', message);
  
  // Always hide loading state first
  hideLoadingState();
  
  const blogArticle = document.getElementById('blog-article');
  const errorState = document.getElementById('error-state');
  
  if (blogArticle) {
    blogArticle.classList.add('hidden');
  }
  
  if (errorState) {
    errorState.classList.remove('hidden');
  }
  
  const errorMsg = document.getElementById('error-message');
  if (errorMsg) {
    errorMsg.textContent = message;
  }
}

/**
 * Update language-specific text
 */
function updateLanguageText() {
  // This will be called by i18n.js when language changes
  const lang = getCurrentLang();
  
  // Update text based on language
  const texts = {
    en: {
      backToPortfolio: 'Back to Portfolio',
      backToBlog: 'Back to Blog',
      tocTitle: 'Table of Contents'
    },
    ar: {
      backToPortfolio: 'العودة إلى الملف الشخصي',
      backToBlog: 'العودة إلى المدونة',
      tocTitle: 'جدول المحتويات'
    }
  };
  
  const t = texts[lang] || texts.en;
  
  const backToPortfolio = document.getElementById('back-to-portfolio');
  const backToBlog = document.getElementById('back-to-blog');
  const tocTitle = document.getElementById('toc-title');
  const tocTitleMobile = document.getElementById('toc-title-mobile');
  
  if (backToPortfolio) backToPortfolio.textContent = t.backToPortfolio;
  if (backToBlog) backToBlog.textContent = t.backToBlog;
  if (tocTitle) tocTitle.textContent = t.tocTitle;
  if (tocTitleMobile) tocTitleMobile.textContent = t.tocTitle;
}

// Wait for marked.js to load before initializing
function initializeBlog() {
  // Check if there was a load error
  if (window.markedLoadError) {
    console.error('marked.js failed to load from CDN');
    showError('Failed to load markdown parser. Please check your internet connection and refresh the page.');
    return;
  }
  
  if (typeof marked === 'undefined') {
    // Wait up to 5 seconds for marked.js to load
    if (typeof window.markedLoadAttempts === 'undefined') {
      window.markedLoadAttempts = 0;
    }
    window.markedLoadAttempts++;
    
    if (window.markedLoadAttempts < 50) { // 5 seconds max (50 * 100ms)
      setTimeout(initializeBlog, 100);
      return;
    } else {
      console.error('marked.js did not load after 5 seconds');
      showError('Markdown parser failed to load. Please refresh the page.');
      return;
    }
  }
  
  window.markedLoadAttempts = 0; // Reset counter
  loadBlogPost();
}

// Initialize when page loads
function startInitialization() {
  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBlog);
  } else {
    initializeBlog();
  }
}

// Start initialization
startInitialization();

// Fallback: If still loading after 10 seconds, show error
setTimeout(() => {
  const loadingState = document.getElementById('loading-state');
  if (loadingState && !loadingState.classList.contains('hidden')) {
    console.error('Blog loading timeout');
    showError('Blog post is taking too long to load. Please check the console for errors and refresh the page.');
  }
}, 10000);

// Listen for language changes
window.addEventListener('languagechange', () => {
  updateLanguageText();
});

// Also listen for custom events from i18n.js
window.addEventListener('langchange', () => {
  updateLanguageText();
  // Reload blog post with new language if needed
  const slug = getBlogSlug();
  if (slug) {
    // Only reload if we need to fetch different language content
    // For now, just update UI text
    updateLanguageText();
  }
});

// Make updateLanguageText globally accessible for i18n.js
if (typeof window !== 'undefined') {
  window.updateLanguageText = updateLanguageText;
}

