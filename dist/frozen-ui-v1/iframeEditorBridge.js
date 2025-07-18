/**
 * IFRAME EDITOR BRIDGE
 * Handles communication between dashboard and iframe for editing commands
 * – Saves the user’s current selection
 * – Restores it when a toolbar command arrives
 * – Runs document.execCommand on that range
 */

(function () {
  "use strict";

  /* ──────────── 1.  Track the last selection ──────────── */
  let savedRange = null;

  document.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    if (sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
  });

  function restoreSelection() {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  /* Expose for quick console debugging */
  window.restoreSelection = restoreSelection;

  /* ──────────── 2.  Receive commands from dashboard ───── */
  window.addEventListener("message", (event) => {
    const { type, command, cmd, value = null } = event.data || {};

    /* Accept either payload shape */
    const isExec =
      (type === "execCommand" && command) || (type === "editor-cmd" && cmd);

    if (!isExec) return;

    restoreSelection(); // ensure the correct text is active
    document.execCommand(command || cmd, false, value);
  });

  /* ──────────── 3.  Helper functions (optional) ───────── */
  function notifyElementSelection(element) {
    window.parent.postMessage(
      {
        type: "elementSelected",
        tagName: element.tagName,
        className: element.className,
        content: element.textContent || element.innerText,
      },
      "*",
    );
  }

  function notifyElementDeleted(element) {
    window.parent.postMessage(
      {
        type: "elementDeleted",
        tagName: element.tagName,
        content: element.textContent || element.innerText,
      },
      "*",
    );
  }

  window.editorBridge = {
    notifyElementSelection,
    notifyElementDeleted,
  };

  console.log("✅ Iframe Editor Bridge initialized");
})();
