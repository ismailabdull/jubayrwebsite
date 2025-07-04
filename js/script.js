// All functionality consolidated into a single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing all functionality...');
  

  
  // --- NAVBAR SCROLL EFFECT ---
  const header = document.querySelector('.header');
  let lastScrollTop = 0;
  
  if (header) {
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 50) {
        // Scrolled down - make navbar transparent
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.transition = 'all 0.3s ease';
      } else {
        // At top - make navbar solid
        header.style.backgroundColor = '#fff';
        header.style.backdropFilter = 'none';
      }
      
      lastScrollTop = scrollTop;
    });
  }

  // --- HAMBURGER MENU ---
  console.log('Initializing hamburger menu...');
  
  const iconMenu = document.querySelector('.menu__icon');
  const menuBody = document.querySelector('.menu__body');
  const closeButton = document.querySelector('.menu__close');
  const body = document.body;

  console.log('Menu elements found:', {
    iconMenu: !!iconMenu,
    menuBody: !!menuBody,
    closeButton: !!closeButton
  });

  // Check if elements exist
  if (!iconMenu || !menuBody) {
    console.error('Menu elements not found!');
  } else {
    function openMenu() {
      console.log('Opening menu...');
      body.classList.add('menu-open');
      console.log('Menu opened. Body classes:', body.className);
    }
    
    function closeMenu() {
      console.log('Closing menu...');
      body.classList.remove('menu-open');
      console.log('Menu closed. Body classes:', body.className);
    }

    function toggleMenu() {
      console.log('Toggling menu...');
      if (body.classList.contains('menu-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Menu icon click
    iconMenu.addEventListener('click', function(event) {
      console.log('Menu icon clicked!');
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

    // Close button click
    if (closeButton) {
      closeButton.addEventListener('click', function(event) {
        console.log('Close button clicked!');
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (body.classList.contains('menu-open') && 
          !iconMenu.contains(event.target) && 
          !menuBody.contains(event.target)) {
        console.log('Clicking outside menu - closing');
        closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && body.classList.contains('menu-open')) {
        console.log('Escape key pressed - closing menu');
        closeMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 1113 && body.classList.contains('menu-open')) {
        console.log('Window resized to desktop - closing menu');
        closeMenu();
      }
    });

    console.log('Hamburger menu initialized successfully');
  }

  // --- SPOLLER BUTTONS ---
  const spollerButtons = document.querySelectorAll("[data-spoller] .spollers-faq__button");

  spollerButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const currentItem = button.closest("[data-spoller]");
      const content = currentItem.querySelector(".spollers-faq__text");

      const parent = currentItem.parentNode;
      const isOneSpoller = parent.hasAttribute("data-one-spoller");

      if (isOneSpoller) {
        const allItems = parent.querySelectorAll("[data-spoller]");
        allItems.forEach((item) => {
          if (item !== currentItem) {
            const otherContent = item.querySelector(".spollers-faq__text");
            item.classList.remove("active");
            otherContent.style.maxHeight = null;
          }
        });
      }

      if (currentItem.classList.contains("active")) {
        currentItem.classList.remove("active");
        content.style.maxHeight = null;
      } else {
        currentItem.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // --- DONATE PAGE FUNCTIONALITY ---
  const tabs = document.querySelectorAll('.donate__tab');
  const tabContents = document.querySelectorAll('.donate__tab-content');
  
  if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const targetTab = this.dataset.tab;
        
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('donate__tab_active'));
        tabContents.forEach(content => {
          content.classList.remove('donate__tab-content_active');
        });
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('donate__tab_active');
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add('donate__tab-content_active');
        }
      });
    });
  }
  
  // Amount button selection
  const amountButtons = document.querySelectorAll('.donate__amount-btn');
  const customInputs = document.querySelectorAll('[id^="custom-amount"]');
  
  amountButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all amount buttons in the same section
      const parentSection = this.closest('.donate__tab-content');
      if (parentSection) {
        const sectionButtons = parentSection.querySelectorAll('.donate__amount-btn');
        sectionButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Clear custom input in the same section
        const customInput = parentSection.querySelector('[id^="custom-amount"]');
        if (customInput) {
          customInput.value = '';
        }
      }
    });
  });
  
  // Custom amount input handling
  customInputs.forEach(input => {
    input.addEventListener('input', function() {
      // Remove active class from all amount buttons in the same section
      const parentSection = this.closest('.donate__tab-content');
      if (parentSection) {
        const sectionButtons = parentSection.querySelectorAll('.donate__amount-btn');
        sectionButtons.forEach(btn => btn.classList.remove('active'));
      }
    });
  });
  
  // Submit button handling (placeholder - integrate with your payment processor)
  const submitButtons = document.querySelectorAll('.donate__submit-btn');
  submitButtons.forEach(button => {
    button.addEventListener('click', function() {
      const parentSection = this.closest('.donate__tab-content');
      if (parentSection) {
        const activeButton = parentSection.querySelector('.donate__amount-btn.active');
        const customInput = parentSection.querySelector('[id^="custom-amount"]');
        
        let amount = '';
        if (activeButton) {
          amount = activeButton.textContent.replace(/[^0-9]/g, '');
        } else if (customInput && customInput.value) {
          amount = customInput.value;
        }
        
        console.log('Donation amount:', amount);
        // Add your payment processing logic here
        alert('Thank you for your donation! This is a demo - no actual payment will be processed.');
      }
    });
  });

  // --- TESTIMONIAL SLIDER ---
  const testimonialSlides = document.querySelectorAll('.testimonial__slide');
  const testimonialDots = document.querySelectorAll('.testimonial__dot');
  const prevArrow = document.querySelector('.testimonial__arrow_prev');
  const nextArrow = document.querySelector('.testimonial__arrow_next');
  
  if (testimonialSlides.length > 0) {
    let currentSlide = 0;
    let autoSlideInterval;

    function showSlide(slideIndex) {
      // Hide all slides
      testimonialSlides.forEach(slide => {
        slide.classList.remove('testimonial__slide_active');
      });
      
      // Remove active class from all dots
      testimonialDots.forEach(dot => {
        dot.classList.remove('testimonial__dot_active');
      });
      
      // Show current slide and activate corresponding dot
      if (testimonialSlides[slideIndex]) {
        testimonialSlides[slideIndex].classList.add('testimonial__slide_active');
      }
      if (testimonialDots[slideIndex]) {
        testimonialDots[slideIndex].classList.add('testimonial__dot_active');
      }
      
      currentSlide = slideIndex;
    }

    function nextSlide() {
      const nextIndex = (currentSlide + 1) % testimonialSlides.length;
      showSlide(nextIndex);
    }

    function prevSlide() {
      const prevIndex = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
      showSlide(prevIndex);
    }

    // Auto-slide functionality
    function startAutoSlide() {
      autoSlideInterval = setInterval(nextSlide, 5000);
    }

    const pauseAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
      }
    };

    // Event listeners
    if (prevArrow) {
      prevArrow.addEventListener('click', () => {
        pauseAutoSlide();
        prevSlide();
        startAutoSlide();
      });
    }

    if (nextArrow) {
      nextArrow.addEventListener('click', () => {
        pauseAutoSlide();
        nextSlide();
        startAutoSlide();
      });
    }

    testimonialDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        pauseAutoSlide();
        showSlide(index);
        startAutoSlide();
      });
    });

    // Pause auto-slide on hover
    const testimonialContainer = document.querySelector('.testimonial__container');
    if (testimonialContainer) {
      testimonialContainer.addEventListener('mouseenter', pauseAutoSlide);
      testimonialContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // Start auto-slide
    startAutoSlide();
  }

  console.log('All functionality initialized successfully');
});
