const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', '打开导航'); mobileNav.hidden = true; }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航'); mobileNav.hidden = !open; });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
matchMedia('(min-width: 561px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
document.querySelector('#share').addEventListener('click', async () => {
  const status = document.querySelector('#share-status');
  try { await navigator.clipboard.writeText('https://2029233251.github.io/'); status.textContent = '作品集链接已复制'; }
  catch { status.textContent = '请复制浏览器地址栏中的作品集链接'; }
});
if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.nav-links a')];
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => { if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }); }, { rootMargin: '-15% 0px -65% 0px' });
  ['lab', 'experience', 'honors', 'about'].forEach(id => observer.observe(document.getElementById(id)));
}
async function initPlanner() {
  const canvas = document.querySelector('#hero-map'), status = document.querySelector('#map-status'), button = document.querySelector('#reroute');
  try {
    const { plan, seededMap } = await import('./lab/core/planner.mjs');
    const ctx = canvas.getContext('2d'); let seed = 42;
    function render() {
      const size = 24, rows = 14, grid = seededMap(seed, size).slice(0, rows), start = [0, 0], goal = [size - 1, rows - 1];
      const a = plan(grid, start, goal, { diagonal: true });
      const d = plan(grid, start, goal, { algorithm: 'dijkstra', diagonal: true });
      const unit = 25, offset = 20; ctx.clearRect(0, 0, 640, 390);
      for (let y = 0; y < rows; y++) for (let x = 0; x < size; x++) { ctx.fillStyle = grid[y][x] === 0 ? '#606a53' : grid[y][x] === 4 ? '#333e2b' : '#252e21'; ctx.fillRect(offset + x * unit + 1, offset + y * unit + 1, unit - 2, unit - 2); }
      if (a.status === 'ok') { ctx.strokeStyle = '#ff784d'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); a.path.forEach(([x, y], i) => { const px = offset + (x + .5) * unit, py = offset + (y + .5) * unit; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); }
      for (const [p, color] of [[start, '#eff5e6'], [goal, '#ff784d']]) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(offset + (p[0] + .5) * unit, offset + (p[1] + .5) * unit, 8, 0, Math.PI * 2); ctx.fill(); }
      const matches = a.status === 'ok' && d.status === 'ok' && Math.abs(a.cost - d.cost) < 1e-9;
      status.textContent = a.status === 'ok' ? `路径代价 ${a.cost.toFixed(2)} · 展开 ${a.expanded} / ${d.expanded} 节点${matches ? ' · 代价一致 ✓' : ' · 请检查对照结果'}` : '当前地图不可达，请更换地图。';
      canvas.setAttribute('aria-label', `合成地图，种子 ${seed}。${status.textContent}`);
      document.querySelector('#map-seed').textContent = `SEED ${String(seed).padStart(2, '0')}`;
    }
    render(); button.disabled = false; button.addEventListener('click', () => { seed = (seed + 17) % 999999; render(); });
  } catch { status.textContent = '预览暂不可用，完整实验与源码入口仍可访问。'; button.hidden = true; }
}
initPlanner();
