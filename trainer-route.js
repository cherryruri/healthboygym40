(() => {
  if (!document.getElementById('trainer')) return;

  function syncRoute(hash) {
    const trainerOnly = hash === '#trainer';
    const changed = document.documentElement.classList.contains('trainer-only-view') !== trainerOnly;
    document.documentElement.classList.toggle('trainer-only-view', trainerOnly);
    if (trainerOnly) {
      document.body.classList.add('show-trainer-section');
      const question=document.querySelector('.trainer-pt-question');
      if(question&&!question.querySelector('.trainer-question-copy')){const copy=document.createElement('span');copy.className='trainer-question-copy';while(question.firstChild)copy.append(question.firstChild);question.append(copy);}
      if(question){question.classList.remove('trainer-question-enter');requestAnimationFrame(()=>requestAnimationFrame(()=>question.classList.add('trainer-question-enter')));}
    }
    if (changed) {
      document.body.classList.remove('trainer-proof-header');
      requestAnimationFrame(() => window.ScrollTrigger?.refresh());
    }
  }

  const homePath = path => path.replace(/index\.html$/, '').replace(/\/$/, '');
  // Restore the destination layout before existing menu handlers measure its scroll position.
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && homePath(url.pathname) === homePath(location.pathname)) {
      syncRoute(url.hash);
    }
  }, true);

  const syncCurrentRoute = () => syncRoute(location.hash);
  window.addEventListener('hashchange', syncCurrentRoute);
  window.addEventListener('popstate', syncCurrentRoute);
  window.addEventListener('pageshow', syncCurrentRoute);
  syncCurrentRoute();
})();
