// toggle.js
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.toggle-btn');
  const checkbox = document.getElementById('billingToggle');
  const switchElement = document.querySelector('.switch');

  if (!toggleBtn || !checkbox || !switchElement) {
    console.warn('Toggle component elements not found');
    return;
  }

  // Initialize state
  function updateMode() {
    if (checkbox.checked) {
      // Monthly mode (checkbox checked - slider on right)
      toggleBtn.classList.add('monthly-mode');
      toggleBtn.classList.remove('annual-mode');
      switchElement.setAttribute('aria-checked', 'true');
    } else {
      // Annual mode (checkbox unchecked - slider on left) 
      toggleBtn.classList.add('annual-mode');
      toggleBtn.classList.remove('monthly-mode');
      switchElement.setAttribute('aria-checked', 'false');
    }
    
    // Dispatch custom event for external listeners
    const event = new CustomEvent('billingToggleChange', {
      detail: {
        isAnnual: !checkbox.checked,
        mode: !checkbox.checked ? 'annual' : 'monthly'
      }
    });
    document.dispatchEvent(event);
  }

  // Handle checkbox change
  checkbox.addEventListener('change', updateMode);
  
  // Handle keyboard navigation
  switchElement.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      updateMode();
    }
  });

  // Public API
  window.BillingToggle = {
    isAnnual: () => !checkbox.checked,
    setAnnual: (annual) => {
      checkbox.checked = !annual;
      updateMode();
    },
    toggle: () => {
      checkbox.checked = !checkbox.checked;
      updateMode();
    }
  };

  // Initial mode setup
  updateMode();
});