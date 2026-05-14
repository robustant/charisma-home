// 搜索功能（主题逻辑统一由 dynamic.js 管理）
document.getElementById('searchInput').addEventListener('input', function (e) {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll('.link-card').forEach(card => {
    const name = card.querySelector('.link-name').textContent.toLowerCase();
    const desc = card.querySelector('.link-desc').textContent.toLowerCase();
    card.style.display = (name.includes(searchTerm) || desc.includes(searchTerm)) ? 'flex' : 'none';
  });
});
