/**
 * MICRO-INTERACTION ANIMATIONS FOR PREVIEW IFRAME
 * Smooth, elegant animations for enhanced user experience
 */

class MicroAnimations {
  constructor() {
    this.isInitialized = false;
    this.animationQueue = [];
    this.observerConfig = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
  }

  init() {
    if (this.isInitialized) return;
    
    console.log('🎨 Initializing micro-interaction animations...');
    
    // Initialize all animation systems
    this.setupScrollAnimations();
    this.setupHoverAnimations();
    this.setupClickAnimations();
    this.setupLoadingAnimations();
    this.setupParallaxEffects();
    this.setupButtonAnimations();
    this.setupImageAnimations();
    this.setupTextAnimations();
    
    this.isInitialized = true;
    console.log('✅ Micro-animations initialized successfully');
  }

  setupScrollAnimations() {
    // Fade in animations for sections
    const sections = document.querySelectorAll('section, .hero-section, .services-section, .about-section, .contact-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, this.observerConfig);

    sections.forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      observer.observe(section);
    });

    // Stagger animation for service cards
    const serviceCards = document.querySelectorAll('.service-card, .service-item');
    serviceCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
      
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, this.observerConfig);
      
      cardObserver.observe(card);
    });
  }

  setupHoverAnimations() {
    // Button hover animations
    const buttons = document.querySelectorAll('button, .btn, .cta-button, a[href*="tel"], a[href*="mailto"]');
    buttons.forEach(button => {
      button.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      button.style.transform = 'translateY(0)';
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
      });
    });

    // Card hover animations
    const cards = document.querySelectorAll('.service-card, .review-card, .team-card');
    cards.forEach(card => {
      card.style.transition = 'all 0.3s ease-out';
      card.style.transform = 'translateY(0)';
      
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.1)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      });
    });
  }

  setupClickAnimations() {
    // Click ripple effect
    const clickableElements = document.querySelectorAll('button, .btn, a, .service-card');
    clickableElements.forEach(element => {
      element.addEventListener('click', (e) => {
        this.createRippleEffect(e, element);
      });
    });
  }

  createRippleEffect(e, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    `;

    // Ensure element has relative positioning for ripple
    const originalPosition = element.style.position;
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    element.style.overflow = 'hidden';

    element.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
      if (originalPosition) {
        element.style.position = originalPosition;
      }
    });
  }

  setupLoadingAnimations() {
    // Page load animations
    const hero = document.querySelector('.hero-section, .hero');
    if (hero) {
      hero.style.opacity = '0';
      hero.style.transform = 'translateY(20px)';
      hero.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
      
      setTimeout(() => {
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
      }, 200);
    }

    // Navigation animation
    const nav = document.querySelector('nav, .navbar, header');
    if (nav) {
      nav.style.opacity = '0';
      nav.style.transform = 'translateY(-20px)';
      nav.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      
      setTimeout(() => {
        nav.style.opacity = '1';
        nav.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  setupParallaxEffects() {
    // Subtle parallax for hero background
    const hero = document.querySelector('.hero-section, .hero');
    if (hero) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
      });
    }

    // Parallax for background images
    const bgImages = document.querySelectorAll('[style*="background-image"]');
    bgImages.forEach(img => {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rect = img.getBoundingClientRect();
        const speed = 0.3;
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const yPos = -(scrolled * speed);
          img.style.backgroundPosition = `center ${yPos}px`;
        }
      });
    });
  }

  setupButtonAnimations() {
    // Enhanced button animations
    const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary, button[type="submit"]');
    ctaButtons.forEach(button => {
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      
      // Add gradient overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s ease-out;
        pointer-events: none;
        z-index: 1;
      `;
      
      button.appendChild(overlay);
      
      button.addEventListener('mouseenter', () => {
        overlay.style.left = '100%';
      });
      
      button.addEventListener('mouseleave', () => {
        overlay.style.left = '-100%';
      });
    });
  }

  setupImageAnimations() {
    // Image lazy loading with animation
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.complete) {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      } else {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        img.addEventListener('load', () => {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        });
      }
    });
    
    // Image hover effects
    const galleryImages = document.querySelectorAll('.gallery img, .service-image img');
    galleryImages.forEach(img => {
      img.style.transition = 'transform 0.3s ease-out';
      
      img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.05)';
      });
      
      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
    });
  }

  setupTextAnimations() {
    // Typewriter effect for hero title
    const heroTitle = document.querySelector('.hero h1, .hero-title');
    if (heroTitle && heroTitle.textContent.length < 100) {
      const text = heroTitle.textContent;
      heroTitle.textContent = '';
      heroTitle.style.borderRight = '2px solid #ffc000';
      
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          heroTitle.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 50);
        } else {
          setTimeout(() => {
            heroTitle.style.borderRight = 'none';
          }, 1000);
        }
      };
      
      setTimeout(typeWriter, 1000);
    }

    // Number counting animation
    const numbers = document.querySelectorAll('.stat-number, .counter');
    numbers.forEach(number => {
      const target = parseInt(number.textContent);
      if (target && target > 0) {
        number.textContent = '0';
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.animateNumber(number, target);
            }
          });
        }, this.observerConfig);
        
        observer.observe(number);
      }
    });
  }

  animateNumber(element, target) {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      element.textContent = Math.floor(current);
      
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      }
    }, 16);
  }

  // Add CSS keyframes for animations
  addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple-animation {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
      
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slide-in-left {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slide-in-right {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes bounce-in {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .animate-fade-in {
        animation: fade-in 0.8s ease-out forwards;
      }
      
      .animate-slide-in-left {
        animation: slide-in-left 0.6s ease-out forwards;
      }
      
      .animate-slide-in-right {
        animation: slide-in-right 0.6s ease-out forwards;
      }
      
      .animate-bounce-in {
        animation: bounce-in 0.6s ease-out forwards;
      }
      
      /* Enhanced button styles */
      .btn, button {
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .btn:hover, button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .btn:active, button:active {
        transform: translateY(0);
        transition: transform 0.1s ease-out;
      }
      
      /* Card hover effects */
      .service-card, .review-card, .team-card {
        transition: all 0.3s ease-out;
      }
      
      .service-card:hover, .review-card:hover, .team-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Loading states */
      .loading {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
      }
      
      .loaded {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Initialize micro-animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const microAnimations = new MicroAnimations();
  microAnimations.addAnimationStyles();
  microAnimations.init();
});

// Export for potential external use
window.MicroAnimations = MicroAnimations;