document.addEventListener('DOMContentLoaded', () => {
  // --- STATE MANAGEMENT ---
  let currentLang = localStorage.getItem('sodevia-lang') || 'es';
  if (currentLang !== 'es' && currentLang !== 'en') {
    currentLang = 'es';
  }

  let currentTheme = localStorage.getItem('sodevia-theme') || 'dark';
  if (currentTheme !== 'dark' && currentTheme !== 'light') {
    currentTheme = 'dark';
  }

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
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sodevia-theme', currentTheme);
      htmlEl.setAttribute('data-theme', currentTheme);
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
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.btn-submit');
      const submitBtnTextEs = submitBtn.querySelector('.lang-es');
      const submitBtnTextEn = submitBtn.querySelector('.lang-en');
      
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const msg = document.getElementById('form-message-body').value.trim();

      // Client-side Honeypot Check
      const honeypot = contactForm.querySelector('input[name="_gotcha"]').value;
      if (honeypot) {
        // Silent success response to trick the bot and save API requests
        showStatus('success', 'success');
        contactForm.reset();
        return;
      }

      // Privacy Policy Consent Check
      const privacyCheck = document.getElementById('form-privacy');
      if (privacyCheck && !privacyCheck.checked) {
        showStatus('validationError', 'error');
        return;
      }

      // Input Length Constraints Check
      if (!name || name.length > 100 || 
          !email || email.length > 254 || 
          !msg || msg.length > 5000) {
        showStatus('validationError', 'error');
        return;
      }

      // Show sending state
      submitBtn.disabled = true;
      const originalTextEs = submitBtnTextEs.textContent;
      const originalTextEn = submitBtnTextEn.textContent;
      submitBtnTextEs.textContent = translations.es.submitting;
      submitBtnTextEn.textContent = translations.en.submitting;
      
      formStatus.style.display = 'none';

      try {
        const response = await fetch("https://formspree.io/f/mwlkpyqq", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            name: name,
            email: email,
            message: msg,
            privacy_consent: "accepted"
          })
        });

        if (response.ok) {
          showStatus('success', 'success');
          contactForm.reset();
        } else {
          showStatus('error', 'error');
        }
      } catch (err) {
        showStatus('error', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtnTextEs.textContent = originalTextEs;
        submitBtnTextEn.textContent = originalTextEn;
      }
    });
  }

  function showStatus(key, type) {
    formStatus.className = `form-message ${type}`;
    
    // Secure DOM manipulation without innerHTML
    formStatus.textContent = '';
    
    const spanEs = document.createElement('span');
    spanEs.className = 'lang-es';
    spanEs.textContent = translations.es[key];
    
    const spanEn = document.createElement('span');
    spanEn.className = 'lang-en';
    spanEn.textContent = translations.en[key];
    
    formStatus.appendChild(spanEs);
    formStatus.appendChild(spanEn);
    
    formStatus.style.display = 'block';
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
