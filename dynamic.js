// 滚动动画：元素进入视口时添加 visible 类
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

// 监听所有带 fade-in 类的元素（精简选择器）
document.querySelectorAll('.fade-in, .fade-in-delay, .fade-in-delay-2').forEach(el => {
  observer.observe(el);
});

// 点击跳转平滑滚动（如 #about）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// ✅ 可选：校训微动效（加载后沉稳浮现）
document.addEventListener('DOMContentLoaded', () => {
  const slogan = document.querySelector('.hitu-slogan');
  if (slogan) {
    slogan.style.opacity = '0';
    slogan.style.transform = 'translateY(8px)';
    setTimeout(() => {
      slogan.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      slogan.style.opacity = '1';
      slogan.style.transform = 'translateY(0)';
    }, 150);
  }
});
