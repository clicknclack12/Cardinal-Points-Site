(function () {
  var stack = document.querySelector('.stack');
  if (!stack) return;
  var cards = [].slice.call(stack.querySelectorAll('.stack-card'));
  var n = cards.length;
  if (n < 2) return;
  var cap = document.querySelector('.stack-cap');
  var order = cards.slice();           // order[0] is the top card
  var busy = false, suppress = false;
  var POS = [
    { x: 0,   y: 0,  r: -1.2 },
    { x: 26,  y: -6, r: 4 },
    { x: -30, y: 8,  r: -5 }
  ];
  function pos(k) { return POS[Math.min(k, POS.length - 1)]; }
  function tf(p, dx, dy, dr) {
    return 'translate(-50%,-50%) translate(' + ((p.x + (dx || 0))) + 'px,' + ((p.y + (dy || 0))) + 'px) rotate(' + (p.r + (dr || 0)) + 'deg)';
  }
  function place(card, k) {
    card.style.zIndex = 10 - k;
    card.style.setProperty('--veil', k === 0 ? 0 : 0.65);
    card.style.transform = tf(pos(k));
    card.style.pointerEvents = k === 0 ? 'auto' : 'none';
    card.setAttribute('aria-hidden', k === 0 ? 'false' : 'true');
    card.tabIndex = k === 0 ? 0 : -1;
  }
  function layout(skip) {
    order.forEach(function (c, k) { if (c !== skip) { c.style.transition = ''; place(c, k); } });
  }
  function caption() {
    if (!cap) return;
    var top = order[0];
    cap.textContent = (cards.indexOf(top) + 1) + ' / ' + n + ' · ' + (top.getAttribute('data-caption') || '');
  }
  function W() { return stack.offsetWidth; }

  function flick(dir, fromDx) {
    if (busy) return;
    busy = true;
    var top = order[0];
    order.push(order.shift());
    layout(top);
    caption();
    top.style.transition = 'transform .38s cubic-bezier(.5,0,.9,.6)';
    top.style.zIndex = 30;
    top.style.transform = 'translate(-50%,-50%) translate(' + (dir * (W() * 0.95 + 160)) + 'px,' + (-10) + 'px) rotate(' + (dir * 22) + 'deg)';
    setTimeout(function () {
      top.style.transition = 'none';
      place(top, n - 1);
      void top.offsetWidth;
      top.style.transition = '';
      busy = false;
    }, 400);
  }
  function back() {
    if (busy) return;
    busy = true;
    var card = order.pop();
    order.unshift(card);
    card.style.transition = 'none';
    card.style.zIndex = 30;
    card.style.transform = 'translate(-50%,-50%) translate(' + (-(W() * 0.95 + 160)) + 'px,-10px) rotate(-22deg)';
    void card.offsetWidth;
    card.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)';
    layout(null);
    card.style.zIndex = 30;
    place(card, 0);
    card.style.zIndex = 30;
    setTimeout(function () { card.style.zIndex = 10; busy = false; layout(null); }, 460);
    caption();
  }

  stack.addEventListener('dragstart', function (e) { e.preventDefault(); });
  // drag / flick
  var drag = null;
  stack.addEventListener('pointerdown', function (e) {
    if (busy || e.button > 0) return;
    var card = e.target.closest('.stack-card');
    if (!card || card !== order[0]) return;
    drag = { card: card, id: e.pointerId, sx: e.clientX, sy: e.clientY, t0: Date.now(), moved: false, dx: 0 };
  });
  stack.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      drag.moved = true;
      try { drag.card.setPointerCapture(drag.id); } catch (_) {}
      drag.card.style.transition = 'none';
      drag.card.classList.add('dragging');
    }
    if (!drag.moved) return;
    drag.dx = dx;
    drag.card.style.transform = tf(pos(0), dx, dy * 0.25, dx * 0.04);
  });
  function end(e, cancel) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    d.card.classList.remove('dragging');
    if (!d.moved) return;
    suppress = true; setTimeout(function () { suppress = false; }, 0);
    var dt = Math.max(Date.now() - d.t0, 1), v = d.dx / dt;
    if (!cancel && (Math.abs(d.dx) > W() * 0.16 || Math.abs(v) > 0.55)) {
      flick(d.dx > 0 ? 1 : -1);
    } else {
      d.card.style.transition = '';
      place(d.card, 0);
    }
  }
  stack.addEventListener('pointerup', function (e) { end(e, false); });
  stack.addEventListener('pointercancel', function (e) { end(e, true); });
  // a drag should not count as a tap that opens the viewer
  stack.addEventListener('click', function (e) {
    if (suppress) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  stack.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); flick(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); back(); }
  });
  var nb = document.querySelector('.st-next'), pb = document.querySelector('.st-prev');
  if (nb) nb.addEventListener('click', function () { flick(-1); });
  if (pb) pb.addEventListener('click', back);

  layout(null);
  caption();
  stack.classList.add('ready');
})();
