// login.js — simple demo auth, respects ?next=

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const msg = document.getElementById('login-msg');

  if (!form || !email || !password) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!email.value || !password.value) {
      if (msg) msg.textContent = 'Please enter your email and password.';
      return;
    }

    try {
      const who = email.value.trim();
      // persist for future pages
      localStorage.setItem('skinai_user', who);
      if (msg) msg.textContent = 'Signing in…';
    } catch (err) {
      console.error('localStorage error:', err);
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || 'reports.html';
    setTimeout(() => { window.location.href = next; }, 300);
  });
});