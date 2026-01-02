// ===== 动态功能：主题切换 + 滚动动画 + 锚点修复 =====

document.addEventListener('DOMContentLoaded', () => {
  // 1. 滚动动画：Intersection Observer（性能最优）
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

  // 2. 主题切换按钮（右下角）
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle';
  toggleBtn.setAttribute('aria-label', '切换深色/浅色模式');
  toggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.758a.75.75 0 001.06-1.061l-1.59-1.59a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
    </svg>`;
  document.body.appendChild(toggleBtn);

  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // 3. 平滑滚动（锚点跳转）
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const hash = this.getAttribute('href');
      if (hash === '#') return;
      
      const target = document.querySelector(hash);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // 4. 修复 GitHub Pages hash 跳转延迟
  if (window.location.hash) {
    setTimeout(() => {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
});
// ===== 汉堡菜单交互（手机端）=====
document.querySelector('.hamburger')?.addEventListener('click', function () {
  const menu = document.querySelector('.mobile-menu');
  menu.classList.toggle('open');
});



