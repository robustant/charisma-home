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

  setActiveNavItem();
});

// ========== 自动激活当前页面的导航项 ==========
function setActiveNavItem() {
  const currentPath = window.location.pathname; // 如 /Charisma-home/notes/article1.html

  // 提取“关键路径段”用于匹配
  // 我们关心的是：是否在 notes/ 目录？还是在根目录的某个 .html？
  const isNotesPage = currentPath.includes('/notes/');

  // 获取所有导航链接（桌面 + 移动）
  const allLinks = document.querySelectorAll('.main-nav a, .mobile-menu a');

  allLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');

    if (!href) return;

    // 情况 1: 链接指向 "笔记"（包含 notes/）
    if (href.includes('notes/')) {
      if (isNotesPage) {
        link.classList.add('active');
      }
      return;
    }

    // 情况 2: 链接指向具体 .html 文件（如 self-introduction.html）
    // 我们提取文件名进行匹配
    const linkFilename = href.split('/').pop(); // 去掉 ../ 或 ./，只留文件名

    // 当前页面的文件名（如果是目录，则视为 index.html）
    let currentPageFile = currentPath.split('/').pop();
    if (!currentPageFile || currentPageFile === 'Charisma-home') {
      currentPageFile = 'index.html';
    }

    // 特殊处理：如果当前在 notes/ 目录，但 notes/index.html 实际文件名是 index.html
    // 所以不能仅靠文件名判断，上面已用 isNotesPage 处理

    if (linkFilename === currentPageFile) {
      link.classList.add('active');
    }
  });
}