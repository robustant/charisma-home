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

// 监听所有带 fade-in 类的元素
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
