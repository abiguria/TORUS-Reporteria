/* TORUS · Reporte público de obra
   Se inserta en cualquier sitio con un div id="torus-reporte" data-proyecto="pasaje-rubio"
   + la etiqueta script que carga https://<host>/reporte.js
   Lee <host>/<proyecto>/datos.json. Publica avance, fechas, fotos y descripciones cortas ya filtradas:
   nada de presupuesto, renglones, pendientes ni acuerdos. */
(function () {
  var script = document.currentScript;
  var BASE = (script && script.src) ? script.src.replace(/[^/]*$/, '') : './';

  var CSS = '\
:host{all:initial;display:block;--ink:#111214;--paper:#F4F4F2;--surface:#fff;--muted:#5D636B;--line:#DCDEE1;--soft:#ECEDEF;--accent:#E0561C;\
font-family:"Archivo","IBM Plex Sans",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:var(--ink)}\
*{box-sizing:border-box}[hidden]{display:none!important}\
.w{background:var(--paper);color:var(--ink);padding:clamp(16px,3vw,32px);border-radius:10px;display:flex;flex-direction:column;gap:18px}\
.hd{display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;border-bottom:2px solid var(--ink);padding-bottom:14px}\
.hd .t{flex:1;min-width:220px}\
.ey{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600}\
h2{margin:4px 0 0;font-size:clamp(22px,3.2vw,34px);line-height:1.05;font-weight:800;letter-spacing:-.01em;text-wrap:balance}\
.loc{font-size:13px;color:var(--muted);margin-top:4px}\
.upd{font-size:12px;color:var(--muted);text-align:right}\
.upd b{display:block;color:var(--ink);font-size:13px}\
.views{display:inline-flex;border:1px solid var(--ink);border-radius:999px;overflow:hidden;align-self:flex-start}\
.views button{border:0;background:transparent;font:inherit;font-size:13px;font-weight:700;padding:8px 16px;cursor:pointer;color:var(--ink)}\
.views button[aria-selected=true]{background:var(--ink);color:#fff}\
.kpis{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:8px;overflow:hidden}\
.kpis>div{background:var(--surface);padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}\
.lb{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}\
.big{font-size:34px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}\
.big small{font-size:15px;color:var(--muted);font-weight:600;margin-left:2px}\
.mid{font-size:20px;font-weight:700;line-height:1.1}\
.bar{height:10px;background:var(--soft);border-radius:2px;position:relative;overflow:hidden}\
.bar i{position:absolute;inset:0 auto 0 0;background:var(--ink)}\
.note{font-size:12px;color:var(--muted)}\
.card{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}\
.card h3{margin:0;font-size:16px;font-weight:700}\
.ch{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ch h3{flex:1}\
svg text{font-family:inherit}\
.tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}\
.tab{flex:none;border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink)}\
.tab[aria-selected=true]{background:var(--ink);border-color:var(--ink);color:#fff}\
.ph{display:grid;grid-template-columns:minmax(220px,1fr) 2fr;gap:14px;align-items:start}\
.desc{list-style:none;margin:0;padding:0;overflow-y:auto;max-height:min(62vh,520px);border:1px solid var(--soft);border-radius:6px}\
.desc li{display:grid;grid-template-columns:24px 1fr;gap:8px;padding:9px 10px;border-top:1px solid var(--soft);cursor:pointer;font-size:13px;line-height:1.4}\
.desc li:first-child{border-top:0}\
.desc li .n{font-size:11px;font-weight:700;color:var(--muted);font-variant-numeric:tabular-nums;padding-top:2px}\
.desc li[aria-current=true]{background:var(--ink);color:#fff}\
.desc li[aria-current=true] .n{color:#fff}\
.desc li .e{color:var(--muted);font-style:italic}\
.desc li[aria-current=true] .e{color:#ddd}\
.right{display:flex;flex-direction:column;gap:8px;min-width:0}\
.car{position:relative;background:#0c0c0d;border-radius:6px;overflow:hidden;aspect-ratio:4/3;max-height:62vh;touch-action:pan-y}\
.track{display:flex;height:100%;transition:transform .35s ease}\
.slide{flex:0 0 100%;height:100%;display:grid;place-items:center;min-width:0}\
.slide img{width:100%;height:100%;object-fit:contain;display:block;user-select:none;-webkit-user-drag:none}\
.nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:var(--ink);font-size:20px;font-weight:700;cursor:pointer;display:grid;place-items:center}\
.nav:disabled{opacity:.3;cursor:default}\
.prev{left:10px}.next{right:10px}\
.cnt{position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.65);color:#fff;font-size:12px;padding:3px 8px;border-radius:999px;font-variant-numeric:tabular-nums}\
.cap{display:none;font-size:14px;line-height:1.45}\
.thumbs{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}\
.thumbs button{flex:none;width:64px;height:48px;border:2px solid transparent;border-radius:4px;padding:0;overflow:hidden;cursor:pointer;background:var(--soft)}\
.thumbs button[aria-current=true]{border-color:var(--accent)}\
.thumbs img{width:100%;height:100%;object-fit:cover;display:block}\
table{border-collapse:collapse;width:100%;font-size:13px}\
th{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:left;font-weight:600;padding:8px;border-bottom:1px solid var(--line);white-space:nowrap}\
td{padding:9px 8px;border-bottom:1px solid var(--soft);vertical-align:middle}\
td.r,th.r{text-align:right;font-variant-numeric:tabular-nums}\
.mini{height:6px;background:var(--soft);border-radius:2px;min-width:80px;position:relative;overflow:hidden}\
.mini i{position:absolute;inset:0 auto 0 0;background:var(--ink)}\
.up{color:#2E7A4E;font-weight:700}\
.lnk{border:1px solid var(--ink);background:none;border-radius:4px;font:inherit;font-size:12px;font-weight:700;padding:4px 8px;cursor:pointer;white-space:nowrap;color:var(--ink)}\
.tw{overflow-x:auto}\
.ft{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px}\
.ft b{color:var(--ink);font-weight:800;letter-spacing:-.01em}\
button:focus-visible,li:focus-visible,.car:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\
.empty{padding:40px;text-align:center;color:var(--muted)}\
@media (max-width:760px){.kpis{grid-template-columns:repeat(3,1fr)}.kpis>div:first-child{grid-column:1/-1}.kpis .big{font-size:26px}.kpis .mid{font-size:15px}.kpis>div{padding:12px}\
.ph{grid-template-columns:1fr}.ph .desc{display:none}.cap{display:block;min-height:2.9em}.upd{text-align:left}.hide-m{display:none}}\
@media (prefers-reduced-motion:reduce){.track{transition:none}}';

  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  function fmt(s) { if (!s) return '—'; var p = s.split('-'); return p[2] + '-' + MES[+p[1] - 1] + '-' + p[0]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function chart(rs) {
    var n = rs.length, W = 760, H = 250, L = 40, R = 16, T = 22, B = 30;
    function X(i) { return n === 1 ? (L + W - R) / 2 : L + (W - L - R) * i / (n - 1); }
    function Y(v) { return T + (H - T - B) * (1 - v / 100); }
    var g = [0, 25, 50, 75, 100].map(function (v) { return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#ECEDEF"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" font-size="11" fill="#5D636B">' + v + '%</text>'; }).join('');
    var d = rs.map(function (r, i) { return (i ? 'L' : 'M') + X(i) + ',' + Y(r.avance); }).join('');
    var area = n > 1 ? '<path d="' + d + 'L' + X(n - 1) + ',' + Y(0) + 'L' + X(0) + ',' + Y(0) + 'Z" fill="#111214" opacity=".06"/><path d="' + d + '" fill="none" stroke="#111214" stroke-width="2"/>' : '';
    var lbl = Math.max(1, Math.ceil(n / 8));
    var dots = rs.map(function (r, i) {
      var last = i === n - 1, anc = n === 1 ? 'middle' : i === 0 ? 'start' : last ? 'end' : 'middle';
      return '<circle cx="' + X(i) + '" cy="' + Y(r.avance) + '" r="' + (last ? 5 : 3.5) + '" fill="' + (last ? '#E0561C' : '#111214') + '"/>' +
        '<text x="' + X(i) + '" y="' + (Y(r.avance) - 10) + '" text-anchor="' + anc + '" font-size="12" font-weight="700" fill="#111214">' + r.avance.toFixed(0) + '%</text>' +
        ((i % lbl === 0 || last) ? '<text x="' + X(i) + '" y="' + (H - 9) + '" text-anchor="' + anc + '" font-size="11" fill="#5D636B">' + fmt(r.fecha).slice(0, 6) + '</text>' : '');
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-height:300px" role="img" aria-label="Curva de avance de obra por visita">' + g + area + dots + '</svg>';
  }

  function mount(el) {
    var proyecto = el.getAttribute('data-proyecto') || '';
    var src = el.getAttribute('data-src') || (BASE + proyecto + '/datos.json');
    var root = el.attachShadow ? el.attachShadow({ mode: 'open' }) : el;
    root.innerHTML = '<style>' + CSS + '</style><div class="w"><div class="empty">Cargando avance de obra…</div></div>';
    var w = root.querySelector('.w');
    var load = window.__TORUS_DATA__ ? Promise.resolve(window.__TORUS_DATA__) : fetch(src + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    load.then(function (data) { render(w, data, src); }).catch(function () { w.innerHTML = '<div class="empty">No se pudo cargar el avance de obra en este momento.</div>'; });
  }

  function render(w, data, src) {
    var base = src.replace(/[^/]*$/, '');
    var rs = (data.reportes || []).slice().sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    if (!rs.length) {
      var P0 = data.proyecto || {};
      w.innerHTML = '<div class="hd"><div class="t"><div class="ey">TORUS · Avance de obra</div><h2>' + esc(P0.nombre) + '</h2><div class="loc">' + esc(P0.ubicacion || '') + '</div></div>' +
        '<div class="upd">Actualizado<b>' + fmt((data.actualizado || '').slice(0, 10)) + '</b></div></div>' +
        '<div class="kpis"><div><span class="lb">Avance de obra</span><span class="big">0<small>%</small></span><div class="bar"><i style="width:0"></i></div><span class="note">' + esc(P0.etapa || 'Por iniciar') + '</span></div>' +
        '<div><span class="lb">Última visita</span><span class="mid">—</span></div><div><span class="lb">Visitas</span><span class="big">0</span></div><div><span class="lb">Fotos</span><span class="big">0</span></div></div>' +
        '<div class="card"><h3>Registro de obra</h3><p class="note" style="margin:0;font-size:14px">Las visitas de obra, la curva de avance y el registro fotográfico aparecerán aquí cuando se publique el primer reporte.</p></div>' +
        '<div class="ft"><span>Reporte generado desde la bitácora de obra de <b>TORUS.</b></span></div>';
      return;
    }
    rs.forEach(function (r) { r.avance = +r.avance || 0; r.fotos = (r.fotos || []).map(function (f) { return typeof f === 'string' ? { src: f, txt: '' } : f; }); });
    var last = rs[rs.length - 1], cur = rs.length - 1, idx = 0;
    var totalFotos = rs.reduce(function (a, r) { return a + r.fotos.length; }, 0);
    var P = data.proyecto || {};
    function url(f) { return /^(https?:|data:|\/)/.test(f.src) ? f.src : base + f.src; }

    w.innerHTML =
      '<div class="hd"><div class="t"><div class="ey">TORUS · Avance de obra</div><h2>' + esc(P.nombre) + '</h2><div class="loc">' + esc(P.ubicacion || '') + '</div></div>' +
      '<div class="upd">Actualizado<b>' + fmt((data.actualizado || '').slice(0, 10)) + '</b></div></div>' +
      '<div class="kpis"><div><span class="lb">Avance de obra</span><span class="big">' + last.avance.toFixed(0) + '<small>%</small></span><div class="bar"><i style="width:' + last.avance + '%"></i></div><span class="note">' + esc(last.etapa || P.etapa || '') + '</span></div>' +
      '<div><span class="lb">Última visita</span><span class="mid">' + fmt(last.fecha) + '</span></div>' +
      '<div><span class="lb">Visitas</span><span class="big">' + rs.length + '</span></div>' +
      '<div><span class="lb">Fotos</span><span class="big">' + totalFotos + '</span></div></div>' +
      '<div class="views" role="tablist" aria-label="Vista"><button role="tab" data-v="res" aria-selected="true">Registro fotográfico</button><button role="tab" data-v="his" aria-selected="false">Histórico de avances</button></div>' +
      '<div class="body"></div>' +
      '<div class="ft"><span>Reporte generado desde la bitácora de obra de <b>TORUS.</b></span><span>' + esc(P.cliente || '') + '</span></div>';

    var body = w.querySelector('.body');

    function viewRes() {
      body.innerHTML = '<div class="card"><div class="ch"><h3 class="vt"></h3><span class="note vs"></span></div><div class="tabs" role="tablist" aria-label="Visitas"></div>' +
        '<div class="ph"><ol class="desc" aria-label="Descripción de las fotos"></ol><div class="right"><div class="car" tabindex="0" aria-label="Carrusel de fotos; usa las flechas del teclado"><div class="track"></div><button class="nav prev" aria-label="Foto anterior">‹</button><button class="nav next" aria-label="Foto siguiente">›</button><span class="cnt"></span></div>' +
        '<div class="cap" aria-live="polite"></div><div class="thumbs"></div></div></div></div>';
      var tabs = body.querySelector('.tabs'), track = body.querySelector('.track'), thumbs = body.querySelector('.thumbs'), cnt = body.querySelector('.cnt'), desc = body.querySelector('.desc'), cap = body.querySelector('.cap');
      var prev = body.querySelector('.prev'), next = body.querySelector('.next'), car = body.querySelector('.car');
      function fs() { return rs[cur].fotos; }
      function showVisit(i) {
        cur = i; idx = 0;
        tabs.innerHTML = rs.slice().reverse().map(function (r) { var j = rs.indexOf(r); return '<button class="tab" role="tab" data-i="' + j + '" aria-selected="' + (j === cur) + '">' + fmt(r.fecha) + '</button>'; }).join('');
        tabs.hidden = rs.length < 2;
        body.querySelector('.vt').textContent = 'Visita #' + rs[cur].numero + ' · ' + fmt(rs[cur].fecha);
        body.querySelector('.vs').textContent = (rs[cur].etapa || 'Visita de obra') + ' · ' + rs[cur].avance.toFixed(0) + '% de avance';
        var f = fs();
        track.innerHTML = f.length ? f.map(function (x, k) { return '<div class="slide"><img src="' + esc(url(x)) + '" alt="' + esc(x.txt || ('Foto ' + (k + 1) + ' de la visita del ' + fmt(rs[cur].fecha))) + '" loading="' + (k < 2 ? 'eager' : 'lazy') + '" draggable="false"></div>'; }).join('') : '<div class="slide"><span class="note">Sin fotos publicadas para esta visita.</span></div>';
        thumbs.innerHTML = f.map(function (x, k) { return '<button data-k="' + k + '" aria-label="Ver foto ' + (k + 1) + '"><img src="' + esc(url(x)) + '" alt="" loading="lazy"></button>'; }).join('');
        desc.innerHTML = f.map(function (x, k) { return '<li tabindex="0" data-k="' + k + '"><span class="n">' + String(k + 1).padStart(2, '0') + '</span><span' + (x.txt ? '' : ' class="e"') + '>' + esc(x.txt || 'Registro fotográfico') + '</span></li>'; }).join('');
        track.style.transform = 'translateX(0)'; sync(true);
      }
      function sync(first) {
        var n = fs().length, x = fs()[idx];
        cnt.textContent = n ? (idx + 1) + ' / ' + n : '';
        cap.textContent = x && x.txt ? x.txt : '';
        prev.disabled = idx <= 0; next.disabled = idx >= n - 1;
        thumbs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-current', String(+b.dataset.k === idx)); });
        desc.querySelectorAll('li').forEach(function (li) { li.setAttribute('aria-current', String(+li.dataset.k === idx)); });
        var t = thumbs.querySelector('[aria-current=true]'); if (t) thumbs.scrollLeft = t.offsetLeft - thumbs.clientWidth / 2 + 32;
        var li = desc.querySelector('[aria-current=true]');
        if (li && !first) { var top = li.offsetTop, bot = top + li.offsetHeight; if (top < desc.scrollTop || bot > desc.scrollTop + desc.clientHeight) desc.scrollTop = top - desc.clientHeight / 3; }
        if (first) desc.scrollTop = 0;
      }
      function go(k) { var n = fs().length; if (!n) return; idx = Math.max(0, Math.min(n - 1, k)); track.style.transform = 'translateX(' + (-idx * 100) + '%)'; sync(); }
      var x0 = null;
      car.addEventListener('pointerdown', function (e) { if (!e.target.closest('.nav')) x0 = e.clientX; });
      car.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); });
      car.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(idx - 1); if (e.key === 'ArrowRight') go(idx + 1); });
      prev.addEventListener('click', function () { go(idx - 1); });
      next.addEventListener('click', function () { go(idx + 1); });
      thumbs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) go(+b.dataset.k); });
      desc.addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) go(+li.dataset.k); });
      desc.addEventListener('keydown', function (e) { var li = e.target.closest('li'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(+li.dataset.k); } });
      tabs.addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (b) showVisit(+b.dataset.i); });
      showVisit(cur);
    }

    function viewHis() {
      var rows = rs.map(function (r, i) { return { r: r, i: i, d: i ? r.avance - rs[i - 1].avance : null }; }).reverse();
      body.innerHTML = '<div class="card"><div class="ch"><h3>Histórico de avances</h3><span class="note">' + rs.length + (rs.length > 1 ? ' visitas registradas' : ' visita registrada') + '</span></div>' + chart(rs) +
        (rs.length < 2 ? '<p class="note">La curva se completa a partir de la segunda visita.</p>' : '') +
        '<div class="tw"><table><thead><tr><th>Fecha</th><th class="hide-m">Visita</th><th class="hide-m">Etapa</th><th class="r">Avance</th><th class="hide-m"></th><th class="r">Cambio</th><th class="r">Fotos</th><th></th></tr></thead><tbody>' +
        rows.map(function (o) { var r = o.r; return '<tr><td style="white-space:nowrap;font-weight:700">' + fmt(r.fecha) + '</td><td class="hide-m">#' + r.numero + '</td><td class="hide-m">' + esc(r.etapa || '') + '</td><td class="r"><b>' + r.avance.toFixed(0) + '%</b></td><td class="hide-m"><div class="mini"><i style="width:' + r.avance + '%"></i></div></td>' +
          '<td class="r">' + (o.d == null ? '—' : o.d > 0 ? '<span class="up">+' + o.d.toFixed(0) + '%</span>' : o.d.toFixed(0) + '%') + '</td><td class="r">' + r.fotos.length + '</td><td><button class="lnk" data-i="' + o.i + '">Ver fotos</button></td></tr>'; }).join('') +
        '</tbody></table></div></div>';
      body.querySelectorAll('.lnk').forEach(function (b) { b.addEventListener('click', function () { cur = +b.dataset.i; setView('res'); }); });
    }

    function setView(v) {
      w.querySelectorAll('.views button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.v === v)); });
      if (v === 'his') viewHis(); else viewRes();
    }
    w.querySelector('.views').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setView(b.dataset.v); });
    setView('res');
  }

  function init() { document.querySelectorAll('#torus-reporte, .torus-reporte').forEach(function (el) { if (!el.__torus) { el.__torus = 1; mount(el); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
