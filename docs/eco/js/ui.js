// Виджеты интерфейса: панели, кнопки, полоски, иконки.

export function panel(ctx, x, y, w, h, alpha = 0.92) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#3a2a18';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#8a6a40';
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function button(ctx, x, y, w, h, label, opts = {}) {
  const enabled = opts.enabled !== false;
  const hover = opts.hover && enabled;
  ctx.save();
  ctx.fillStyle = enabled ? (hover ? '#7a5a2e' : '#5a4020') : '#333';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = enabled ? '#c8a060' : '#555';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = enabled ? '#ffe8c0' : '#888';
  ctx.font = (opts.font || (h >= 40 ? '20px' : '16px')) + ' Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  wrapText(ctx, label, x + w / 2, y + h / 2, w - 10, h >= 40 ? 20 : 15);
  ctx.restore();
}

export function wrapText(ctx, text, cx, cy, maxW, lineH) {
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  for (const wd of words) {
    const t = cur ? cur + ' ' + wd : wd;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  const y0 = cy - (lines.length - 1) * lineH / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, y0 + i * lineH));
  return lines.length;
}

export function iconLabel(ctx, img, x, y, size, text, color = '#ffe8c0', font = '18px') {
  if (img) ctx.drawImage(img, x, y, size, size);
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font + ' Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText(text, x + size + 6, y + size / 2);
  ctx.restore();
}

export function bar(ctx, x, y, w, h, frac, color = '#5ec24a') {
  ctx.save();
  ctx.fillStyle = '#241a10';
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = color;
    roundRect(ctx, x + 2, y + 2, Math.max(4, (w - 4) * Math.min(1, frac)), h - 4, 3);
    ctx.fill();
  }
  ctx.strokeStyle = '#8a6a40';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 4);
  ctx.stroke();
  ctx.restore();
}

export function text(ctx, str, x, y, opts = {}) {
  ctx.save();
  ctx.fillStyle = opts.color || '#ffe8c0';
  ctx.font = (opts.font || '18px') + ' Georgia, serif';
  ctx.textAlign = opts.align || 'left';
  ctx.textBaseline = opts.baseline || 'top';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function drawSpriteFit(ctx, img, x, y, w, h) {
  if (!img) return;
  const k = Math.min(w / img.width, h / img.height);
  const dw = img.width * k, dh = img.height * k;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function shade(ctx, x, y, w, h, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
