document.addEventListener('DOMContentLoaded', () => {
  // --- STATE MANAGEMENT ---
  let currentLang = localStorage.getItem('sodevia-lang') || 'es';
  let currentTheme = localStorage.getItem('sodevia-theme') || 'dark';

  const htmlEl = document.documentElement;

  // Apply initial states
  htmlEl.setAttribute('data-lang', currentLang);
  htmlEl.setAttribute('data-theme', currentTheme);

  // Update text of language toggle buttons
  const updateLangBtnText = () => {
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.textContent = currentLang === 'es' ? 'EN' : 'ES';
    }
  };
  updateLangBtnText();

  // --- LANGUAGE SWITCHER ---
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      localStorage.setItem('sodevia-lang', currentLang);
      htmlEl.setAttribute('data-lang', currentLang);
      updateLangBtnText();
    });
  }

  // --- THEME SWITCHER ---
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    // Update icon inside theme button based on current theme
    const updateThemeIcon = () => {
      themeToggle.innerHTML = currentTheme === 'dark' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' 
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
    };
    updateThemeIcon();

    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sodevia-theme', currentTheme);
      htmlEl.setAttribute('data-theme', currentTheme);
      updateThemeIcon();
    });
  }

  // --- STICKY HEADER & ACTIVE LINKS ---
  const header = document.querySelector('header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    // Sticky header
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active nav link highlight on scroll
    let currentActive = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        currentActive = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === currentActive) {
        link.classList.add('active');
      }
    });
  });

  // --- MOBILE MENU ---
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('nav');
  const navItems = document.querySelectorAll('.nav-links a, .btn-contact-nav');

  const toggleMobileMenu = () => {
    burger.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.classList.toggle('overflow-hidden');
  };

  if (burger) {
    burger.addEventListener('click', toggleMobileMenu);
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (nav.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  // --- SCROLL REVEAL (INTERSECTION OBSERVER) ---
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null, // viewport
    threshold: 0.15, // reveal when 15% visible
    rootMargin: '0px 0px -50px 0px' // offset bottom trigger slightly
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- CONTACT FORM HANDLING ---
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  const translations = {
    es: {
      submitting: 'Enviando mensaje...',
      success: '¡Mensaje enviado con éxito! Nos pondremos en contacto a la brevedad.',
      error: 'Hubo un error al enviar el formulario. Por favor, intente de nuevo.',
      validationError: 'Por favor complete todos los campos requeridos.'
    },
    en: {
      submitting: 'Sending message...',
      success: 'Message sent successfully! We will contact you shortly.',
      error: 'There was an error sending the form. Please try again.',
      validationError: 'Please fill in all required fields.'
    }
  };

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const msg = document.getElementById('form-message-body').value.trim();

      if (!name || !email || !msg) {
        showStatus('validationError', 'error');
        return;
      }

      try {
        const subject = encodeURIComponent(`Contacto Web Sodevia - ${name}`);
        const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${msg}`);
        
        window.location.href = `mailto:sodevia.ar@gmail.com?subject=${subject}&body=${body}`;
        
        showStatus('success', 'success');
        contactForm.reset();
      } catch (err) {
        showStatus('error', 'error');
      }
    });
  }

  function showStatus(key, type) {
    formStatus.className = `form-message ${type}`;
    formStatus.innerHTML = `
      <span class="lang-es">${translations.es[key]}</span>
      <span class="lang-en">${translations.en[key]}</span>
    `;
    formStatus.style.display = 'block';
    
    // Auto-scroll to status
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
