document.addEventListener('DOMContentLoaded', () => {
  // ========== 1. 初始化主题 ==========
  const themeToggle = document.querySelector('.theme-toggle');
  const htmlEl = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ========== 2. 滚动动画 ==========
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-in, .fade-in-delay, .fade-in-delay-2').forEach(el => {
    observer.observe(el);
  });

  // ========== 3. 汉堡菜单 ==========
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ========== 4. Hash 锚点跳转修复 ==========
  if (window.location.hash) {
    setTimeout(() => {
      const el = document.getElementById(window.location.hash.substring(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
});
