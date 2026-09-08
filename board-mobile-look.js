(() => {
  const media = matchMedia('(max-width: 768px)');
  let cleanup = () => {};
  function sync() {
    cleanup();
    if (!media.matches || new URLSearchParams(location.search).get('board') === 'infoboard') return;
    const shell = document.querySelector('.board-content-shell');
    const main = document.querySelector('.board-main');
    if (!shell || !main) return;
    document.body.classList.add('mobile-board-look');
    const hero = document.createElement('section');
    hero.className = 'mobile-board-hero';
    hero.innerHTML = '<p>MORE THAN A GYM</p><h2>BOARD</h2><strong>헬스보이짐 수내점 소식</strong><span>오늘도, 더 나은 내가 되는 곳.<br>헬스보이짐 수내점입니다.</span>';
    main.prepend(hero);
    const decorate = () => {
      const cards = shell.querySelectorAll('.consult-post-card');
      cards.forEach((card, index) => {
        if (index > 1 || card.classList.contains('has-status') || card.querySelector('.mobile-board-photo')) return;
        const photo = document.createElement('img');
        photo.className = 'mobile-board-photo';
        photo.src = index === 0 ? '센터전체사진1.jpg' : '프리웨이트존사진1.jpg';
        photo.alt = ''; photo.loading = 'lazy';
        card.classList.add('mobile-board-featured');
        card.prepend(photo);
      });
    };
    const observer = new MutationObserver(decorate);
    observer.observe(shell, { childList: true, subtree: true });
    decorate();
    cleanup = () => {
      observer.disconnect(); hero.remove();
      shell.querySelectorAll('.mobile-board-photo').forEach(el => el.remove());
      shell.querySelectorAll('.mobile-board-featured').forEach(el => el.classList.remove('mobile-board-featured'));
      document.body.classList.remove('mobile-board-look');
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync, { once:true });
  else sync();
  media.addEventListener('change', sync);
})();
