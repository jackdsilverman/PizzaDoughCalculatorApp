// Renders the app icon, Android adaptive icon layers, splash image and favicon into the given folder.
// Usage: node scripts/make-icons.cjs assets   (needs Playwright with Chromium installed)
const { chromium } = require('playwright');
const fs = require('fs');
const BG = '#C2410C', CRUST = '#E9B66B', CHEESE = '#FCE7B2', PEP = '#A3201B';
const rad = d => (d - 90) * Math.PI / 180;
const pt = (cx, cy, r, d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
function wedge(cx, cy, r, a0, a1) {
  const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1);
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`;
}
function pizza(cx, cy, r, mono = false) {
  const gap = 2.2, out = [];
  for (let i = 0; i < 6; i++) {
    const a0 = i * 60 + gap, a1 = (i + 1) * 60 - gap, mid = (a0 + a1) / 2;
    const pulled = i === 1;
    const [dx, dy] = pulled ? [Math.cos(rad(mid)) * r * 0.1, Math.sin(rad(mid)) * r * 0.1] : [0, 0];
    const g = [];
    g.push(`<path d="${wedge(cx, cy, r, a0, a1)}" fill="${mono ? '#fff' : CRUST}"/>`);
    if (!mono) {
      g.push(`<path d="${wedge(cx, cy, r * 0.83, a0 + 0.5, a1 - 0.5)}" fill="${CHEESE}"/>`);
      for (const [pr, pa, ps] of [[0.6, mid - 9, 0.1], [0.34, mid + 8, 0.085]]) {
        const [px, py] = pt(cx, cy, r * pr, pa);
        g.push(`<circle cx="${px}" cy="${py}" r="${r * ps}" fill="${PEP}"/>`);
      }
    }
    out.push(`<g transform="translate(${dx},${dy})">${g.join('')}</g>`);
  }
  return out.join('');
}
const svg = (size, body, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}${body}</svg>`;
const files = {
  'icon.png': [1024, svg(1024, pizza(512, 530, 330), BG)],
  'android-icon-foreground.png': [1024, svg(1024, pizza(512, 520, 270))],
  'android-icon-background.png': [1024, svg(1024, '', BG)],
  'android-icon-monochrome.png': [1024, svg(1024, pizza(512, 520, 270, true))],
  'splash-icon.png': [1024, svg(1024, pizza(512, 530, 400))],
  'favicon.png': [48, svg(48, pizza(512, 530, 360), BG)],
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [name, [size, s]] of Object.entries(files)) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<html><body style="margin:0;background:transparent">${s}</body></html>`);
    await p.locator('svg').screenshot({ path: process.argv[2] + '/' + name, omitBackground: true });
  }
  // preview sheet
  await p.setViewportSize({ width: 900, height: 320 });
  const img = n => `data:image/png;base64,${fs.readFileSync(process.argv[2] + '/' + n).toString('base64')}`;
  await p.setContent(`<body style="margin:0;display:flex;gap:24px;padding:24px;background:#ddd;align-items:center">
    <img src="${img('icon.png')}" width="200" style="border-radius:44px">
    <div style="width:200px;height:200px;border-radius:50%;overflow:hidden;position:relative;background:${BG}"><img src="${img('android-icon-foreground.png')}" width="300" style="position:absolute;left:-50px;top:-50px"></div>
    <div style="width:200px;height:200px;background:#FBF7F2;display:flex;align-items:center;justify-content:center"><img src="${img('splash-icon.png')}" width="120"></div>
    <div style="width:200px;height:200px;background:#16120F;display:flex;align-items:center;justify-content:center"><img src="${img('splash-icon.png')}" width="120"></div></body>`);
  await p.screenshot({ path: require('os').tmpdir() + '/icon-preview.png' });
  await b.close();
})();
