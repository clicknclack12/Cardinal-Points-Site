(function () {
  var links = [].slice.call(document.querySelectorAll('a.lb'));
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;
  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Map viewer');
  dlg.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous map">&lsaquo;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-next" aria-label="Next map">&rsaquo;</button>';
  document.body.appendChild(dlg);
  var img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption');
  var prev = dlg.querySelector('.lb-prev'), next = dlg.querySelector('.lb-next');
  var i = 0;
  if (links.length < 2) { prev.hidden = true; next.hidden = true; }

  function show(n) {
    i = (n + links.length) % links.length;
    var a = links[i], t = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = t ? t.alt : '';
    cap.textContent = a.getAttribute('data-caption') || '';
  }
  links.forEach(function (a, n) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(n);
      dlg.showModal();
    });
  });
  prev.addEventListener('click', function () { show(i - 1); });
  next.addEventListener('click', function () { show(i + 1); });
  dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
})();
