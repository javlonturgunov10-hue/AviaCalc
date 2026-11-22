/*
 * AviaCalc | Unit conversions screen
 * Category tabs, inputs, swap, copy and clear.
 * Author: Turgunov J (Student ID AE18097)
 */

(function () {
  var $ = function (i) { return document.getElementById(i); };
  var CATS = AviaCalc.converter.CATS, conv = AviaCalc.converter.conv, fmt = AviaCalc.converter.fmt, parse = AviaCalc.converter.parse;
  var S = {i: 0, p: {}}, cur = '';
  CATS.forEach(function (c) { S.p[c.id] = {v: '', f: c.d[0], t: c.d[1]}; });

  function render() {
    var c = CATS[S.i], st = S.p[c.id], v = parse(st.v), o;
    $('msg').textContent = ''; $('rnum').textContent = '—'; $('runit').textContent = '';
    $('d1').textContent = $('d2').textContent = $('d3').textContent = '—';
    $('copy').disabled = true; cur = '';
    if (v === null) return;
    if (isNaN(v)) { $('msg').textContent = 'Enter a valid number, for example 12.5 or -40.'; return; }
    o = conv(c, st.f, st.t, v);
    if (o.err || !isFinite(o.r)) { $('msg').textContent = o.err || 'The result is too large to display.'; return; }
    var vt = st.v.trim(), shown = v < 0 ? '(' + vt + ')' : vt, r = fmt(o.r);
    $('rnum').textContent = r; $('runit').textContent = st.t;
    $('d1').textContent = vt + ' ' + st.f;
    $('d2').textContent = r + ' ' + st.t;
    $('d3').textContent = (o.k !== undefined ? shown + ' × ' + String(parseFloat(o.k.toPrecision(10))) : o.f.split('v').join(shown)) + ' = ' + r;
    cur = vt + ' ' + st.f + ' = ' + r + ' ' + st.t;
    $('copy').disabled = false;
  }
  function setCat() {
    var c = CATS[S.i], st = S.p[c.id], p = $('panel');
    p.style.setProperty('--c', c.c); p.style.setProperty('--ci', c.ci || '#fff');
    $('pip').setAttribute('d', c.ic); $('pname').textContent = c.n;
    var o = c.u.map(function (u) { return '<option>' + u[0] + '</option>'; }).join('');
    $('from').innerHTML = o; $('to').innerHTML = o;
    $('from').value = st.f; $('to').value = st.t; $('val').value = st.v;
    document.querySelectorAll('.cat').forEach(function (b, i) { b.setAttribute('aria-pressed', i === S.i ? 'true' : 'false'); });
    render();
  }
  function cs() { return S.p[CATS[S.i].id]; }
  CATS.forEach(function (c, i) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.className = 'cat'; b.type = 'button';
    b.style.cssText = '--c:' + c.c + ';--ci:' + (c.ci || '#fff');
    b.innerHTML = '<span class="tile"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="' + c.ic + '"/></svg></span>' + c.n.replace(/&/g, '&amp;');
    b.addEventListener('click', function () { S.i = i; setCat(); });
    li.appendChild(b); $('cats').appendChild(li);
  });
  $('val').addEventListener('input', function () { cs().v = this.value; render(); });
  $('from').addEventListener('change', function () { cs().f = this.value; render(); });
  $('to').addEventListener('change', function () { cs().t = this.value; render(); });
  $('swap').addEventListener('click', function () {
    var s = cs(), x = s.f; s.f = s.t; s.t = x;
    $('from').value = s.f; $('to').value = s.t; render();
  });
  $('sign').addEventListener('click', function () {
    var s = cs(), t = s.v.trim();
    s.v = t.charAt(0) === '-' ? t.slice(1) : '-' + t.replace(/^[+]/, '');
    $('val').value = s.v; render(); $('val').focus();
  });
  $('clear').addEventListener('click', function () {
    var c = CATS[S.i]; S.p[c.id] = {v: '', f: c.d[0], t: c.d[1]};
    setCat(); $('val').focus();
  });
  $('copy').addEventListener('click', function () {
    if (!cur) return;
    var t = cur, btn = this;
    (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject())
      .catch(function () {
        var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select();
        try { document.execCommand('copy'); } catch (e) {}
        a.remove();
      })
      .then(function () { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy result'; }, 1500); });
  });
  $('cback').addEventListener('click', function () { location.hash = '#problems'; });
  setCat();
})();
