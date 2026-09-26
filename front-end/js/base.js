// base.js — shared behavior included on every admin page
// Sidebar collapse/expand toggle

document.addEventListener('DOMContentLoaded', () => {
  const appShell = document.getElementById('appShell');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (appShell && toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const collapsed = appShell.classList.toggle('sidebar-collapsed');
      toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    });
  }
});
