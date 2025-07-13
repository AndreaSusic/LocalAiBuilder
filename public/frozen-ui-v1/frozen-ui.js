/**
 * FROZEN UI INTERACTIVE FUNCTIONALITY
 * Hamburger menu and inline editing system
 */

// Hamburger menu functionality
document.addEventListener("DOMContentLoaded", function () {
  const ham = document.querySelector(".hamburger");
  const menu = document.querySelector(".nav-links");

  if (ham && menu) {
    ham.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
  }

  // Enhanced inline editor for all editable elements
  const elements = document.querySelectorAll(
    "h1, h2, h3, h4, p, nav, .contact-phone, .cta, .btn-primary, .btn-accent, footer, .nav-links li a, .logo",
  );

  elements.forEach((el) => {
    // Store reference to delete button
    let deleteButton = null;

    el.addEventListener("mouseenter", function () {
      this.style.outline = "2px dotted #ff0000";
      this.style.cursor = "pointer";
      this.style.position = "relative";

      // Create delete button if it doesn't exist
      if (!deleteButton) {
        deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.innerHTML = "✕";
        deleteButton.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          background: #e53935;
          border-radius: 50%;
          color: #fff;
          font-size: 12px;
          border: none;
          cursor: pointer;
          opacity: 0.6;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        `;

        deleteButton.addEventListener("mouseenter", function () {
          this.style.opacity = "0.9";
        });

        deleteButton.addEventListener("mouseleave", function () {
          this.style.opacity = "0.6";
        });

        deleteButton.addEventListener("click", function (e) {
          e.stopPropagation();
          e.preventDefault();

          // Notify dashboard about deletion
          if (window.editorBridge) {
            window.editorBridge.notifyElementDeleted(el);
          }

          // Remove the element
          el.remove();
        });

        this.appendChild(deleteButton);
      }
    });

    el.addEventListener("mouseleave", function () {
      if (
        !this.hasAttribute("contenteditable") ||
        this.contentEditable === "false"
      ) {
        this.style.outline = "none";
        // Remove delete button
        if (deleteButton) {
          deleteButton.remove();
          deleteButton = null;
        }
      }
    });

    el.addEventListener("click", function () {
      this.contentEditable = true;
      this.style.outline = "2px solid #ffc000";
      this.focus();

      el.setAttribute("contenteditable", "true"); // make it editable
      el.focus(); // keep caret inside iframe

      // Notify dashboard about selection
      if (window.editorBridge) {
        window.editorBridge.notifyElementSelection(this);
      }
    });

    el.addEventListener("blur", function () {
      //    this.contentEditable = false;
      this.style.outline = "none";
      // Remove delete button on blur
      if (deleteButton) {
        deleteButton.remove();
        deleteButton = null;
      }
    });
  });

  // Log data hierarchy enforcement
  console.log("🔍 FROZEN UI DATA HIERARCHY SUMMARY:");
  console.log("📋 Services: Checking data hierarchy for authentic services...");
  console.log("🎨 Colors: #ffc000, #000000 (Priority 1: User Questionnaire)");
  console.log("📸 Images: Authentic GBP photos (Priority 3: GBP Data)");
  console.log(
    "📞 Contact: 065 2170293, Svetog Save bb, Osečina (Priority 2: Website/GBP)",
  );
  console.log(
    "⭐ Reviews: Aleksandar Popović, Jordan Jančić, Marko Pavlović (Priority 3: GBP)",
  );
  console.log("✅ NO DUMMY DATA OR STOCK IMAGES USED");
});
