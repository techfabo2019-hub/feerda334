(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menu toggle (mobile panel)
  const panel = $('#panel');
  const menuBtn = $('.menu-toggle');
  // One-shot flag to prevent outside-click from closing right after programmatic open
  let suppressOutsideCloseOnce = false;
  if (menuBtn && panel) {
    const setPanelState = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.classList.toggle('open', open);
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', String(!open));
    };
    panel.setAttribute('aria-hidden', 'true');
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      setPanelState(!expanded);
    });
    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (suppressOutsideCloseOnce) { suppressOutsideCloseOnce = false; return; }
      if (!panel.classList.contains('open')) return;
      if (panel.contains(e.target) || menuBtn.contains(e.target)) return;
      setPanelState(false);
    });
    // Close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) setPanelState(false);
    });
  }

  // Tabs
  const tabs = $$('.tab');
  const panes = $$('.tab-pane');
  const activateTab = (key) => {
    tabs.forEach(t => {
      const active = t.dataset.tab === key;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    panes.forEach(p => {
      const active = p.id === `tab-${key}`;
      p.classList.toggle('active', active);
      if (active) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
    if (location.hash !== `#${key}`) {
      try { history.replaceState(null, '', `#${key}`); } catch { location.hash = `#${key}`; }
    }
  };
  tabs.forEach(tab => tab.addEventListener('click', () => {
    activateTab(tab.dataset.tab);
  }));

  // Hash routing for tabs (#about, #links, #contact)
  const syncHash = () => {
    const hash = (location.hash || '#links').replace('#', '');
    if (hash === 'about' || hash === 'links' || hash === 'contact') activateTab(hash);
    else activateTab('links');
  };
  window.addEventListener('hashchange', syncHash);
  syncHash();

  // Make "All links" button toggle the menu panel and activate Links tab
  $$('a[href="#links"]').forEach(a => a.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    activateTab('links');
    suppressOutsideCloseOnce = true; // prevent immediate outside-close
    if (menuBtn) menuBtn.click(); // toggles open/close
  }));

  // Avatar logo setup (click to set, right-click to clear)
  const avatar = $('#avatar');
  const applyAvatar = (url) => {
    if (!avatar) return;
    if (url) {
      avatar.style.setProperty('--avatar-img', `url("${url}")`);
      avatar.classList.add('has-img');
    } else {
      avatar.style.removeProperty('--avatar-img');
      avatar.classList.remove('has-img');
    }
  };
  try {
    const savedAvatar = localStorage.getItem('avatarImg');
    if (savedAvatar) applyAvatar(savedAvatar);
  } catch {}
  if (avatar) {
    avatar.addEventListener('click', () => {
      const input = prompt('Paste a profile logo image URL, or type "upload" to choose a file. Leave blank to cancel.');
      if (!input) return;
      const val = input.trim();
      if (/^https?:\/\//i.test(val)) {
        applyAvatar(val);
        try { localStorage.setItem('avatarImg', val); } catch {}
      } else if (val.toLowerCase() === 'upload') {
        const picker = document.createElement('input');
        picker.type = 'file';
        picker.accept = 'image/*';
        picker.onchange = () => {
          const f = picker.files && picker.files[0];
          if (!f) return;
          if (f.size > 2 * 1024 * 1024) { alert('Please choose an image under 2MB.'); return; }
          const r = new FileReader();
          r.onload = () => {
            applyAvatar(r.result);
            try { localStorage.setItem('avatarImg', r.result); } catch {}
          };
          r.readAsDataURL(f);
        };
        picker.click();
      }
    });
    avatar.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const confirmClear = confirm('Remove custom profile logo?');
      if (confirmClear) {
        applyAvatar('');
        try { localStorage.removeItem('avatarImg'); } catch {}
      }
    });
  }

  // Background image overlay (Ctrl+B to set, Ctrl+Shift+B to clear)
  const bgImg = $('#bg-img');
  const defaultBg = 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=2000&q=60';
  const applyBg = (url) => {
    if (!bgImg) return;
    if (url) { bgImg.style.backgroundImage = `url("${url}")`; }
    else { bgImg.style.backgroundImage = 'none'; }
  };
  try {
    const savedBg = localStorage.getItem('bgImage');
    if (savedBg) applyBg(savedBg); else applyBg(defaultBg);
  } catch { applyBg(defaultBg); }
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      if (e.shiftKey) {
        applyBg('');
        try { localStorage.removeItem('bgImage'); } catch {}
        return;
      }
      const input = prompt('Paste background image URL (leave blank to cancel)');
      if (input && /^https?:\/\//i.test(input)) {
        const url = input.trim();
        applyBg(url);
        try { localStorage.setItem('bgImage', url); } catch {}
      }
    }
  });

  // Tilt effect on link cards
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const maxRotX = 6, maxRotY = 8;
    $$('.link-card').forEach(card => {
      let rafId = 0;
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;  // 0..1
        const y = (e.clientY - rect.top) / rect.height; // 0..1
        const rX = (0.5 - y) * maxRotX;
        const rY = (x - 0.5) * maxRotY;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `translateY(-2px) rotateX(${rX}deg) rotateY(${rY}deg)`;
        });
      };
      const onLeave = () => {
        cancelAnimationFrame(rafId);
        card.style.transform = '';
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('touchstart', onLeave, { passive: true });
    });
  }

  // Discord link setup (provided default; Shift-click to edit; persist in localStorage)
  const discordLink = $('#discord-link');
  const defaultDiscord = 'https://discord.gg/437fNQNqUx';
  const setDiscord = (url) => {
    if (!discordLink) return;
    discordLink.href = url;
    const small = discordLink.querySelector('.label small');
    if (small) small.textContent = 'Join my Discord';
    try { localStorage.setItem('discordInvite', url); } catch {}
  };
  try {
    const saved = localStorage.getItem('discordInvite');
    if (saved && /^https?:\/\//i.test(saved)) setDiscord(saved);
    else setDiscord(defaultDiscord);
  } catch {
    setDiscord(defaultDiscord);
  }
  if (discordLink) {
    discordLink.addEventListener('click', (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        const current = discordLink.href;
        const input = prompt('Paste your Discord invite URL', current);
        if (input && /^https?:\/\//i.test(input)) setDiscord(input.trim());
      }
    });
  }

  // Contact tab actions: Share and Copy helpers
  const shareBtn = $('#share-profile');
  const copyDiscordBtn = $('#copy-discord');
  const copyKickBtn = $('#copy-kick');
  const shareData = { title: 'FERDA 777', text: 'Check out my links', url: location.href };
  const notify = (msg) => { try { console.log(msg); } catch {} alert(msg); };
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          notify('Profile link copied');
        }
      } catch {}
    });
  }
  const copy = async (text, successMsg) => {
    try { await navigator.clipboard.writeText(text); notify(successMsg); } catch {}
  };
  if (copyDiscordBtn) copyDiscordBtn.addEventListener('click', () => {
    const url = (discordLink && discordLink.href) || 'https://discord.gg/437fNQNqUx';
    copy(url, 'Discord invite copied');
  });
  if (copyKickBtn) copyKickBtn.addEventListener('click', () => {
    copy('https://kick.com/ferda_777', 'Kick link copied');
  });
})();
