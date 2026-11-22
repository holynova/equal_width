export const layouts = {
  lunar: { name: '月相印记', english: 'LUNAR STUDY', palette: 'blue' },
  form: { name: '几何构成', english: 'FORM STUDY', palette: 'clay' },
  book: { name: '留白书页', english: 'TYPE STUDY', palette: 'paper' },
};
export const palettes = {
  blue: { name: '群青', paper: '#293fa0', ink: '#f6f0d9', accent: '#d9dbac' },
  clay: { name: '朱砂', paper: '#b7412b', ink: '#fff0d6', accent: '#edb373' },
  pine: { name: '松绿', paper: '#264e40', ink: '#f3edd2', accent: '#bed2a3' },
  charcoal: { name: '炭黑', paper: '#292c32', ink: '#f8f1df', accent: '#c2acb8' },
  paper: { name: '米纸', paper: '#eee7d3', ink: '#34332b', accent: '#995338' },
};
export const fonts = {
  serif: { name: '思源宋体', family: '"Press Serif", "Songti SC", "Noto Serif CJK SC", serif' },
  kai: { name: '霞鹜文楷', family: '"Press Kai", "Kaiti SC", KaiTi, serif' },
  display: { name: '站酷庆科黄油体', family: '"Press Display", "PingFang SC", sans-serif' },
  sans: { name: '系统黑体', family: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif' },
};
export const posterWidth = 1440;
export const ratios = {
  portrait: { name: '3:4', height: 1920 },
  square: { name: '1:1', height: 1440 },
  story: { name: '9:16', height: 2560 },
};
export function linesOf(text) {
  return text.split(/\r\n?|\n/).map(line => line.trim()).filter(Boolean);
}
const moon = new Image();
moon.src = new URL('./assets/lunar-print.webp', import.meta.url);
export const moonReady = moon.decode();
const plates = new Map();
function getPlate(ink) {
  if (!moon.naturalWidth) return null;
  if (!plates.has(ink)) {
    const mask = document.createElement('canvas');
    mask.width = moon.naturalWidth;
    mask.height = moon.naturalHeight;
    const pen = mask.getContext('2d');
    pen.drawImage(moon, 0, 0);
    pen.globalCompositeOperation = 'source-in';
    pen.fillStyle = ink;
    pen.fillRect(0, 0, mask.width, mask.height);
    plates.set(ink, mask);
  }
  return plates.get(ink);
}
function rule(ctx, x1, y1, x2, y2, width = 1.7) {
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function circle(ctx, x, y, radius, fill = true) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  if (fill) ctx.fill(); else ctx.stroke();
}
function star(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  for (const [dx, dy] of [[.12,-.15],[.75,0],[.12,.15],[0,1],[-.12,.15],[-.75,0],[-.12,-.15]]) ctx.lineTo(x + dx * radius, y + dy * radius);
  ctx.closePath(); ctx.fill();
}
function lunarPlate(ctx, h, colors) {
  const x = 929, y = h * .788, r = Math.min(403, h * .29);
  ctx.save();
  ctx.strokeStyle = colors.ink;
  ctx.globalAlpha = .52;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.62, r * .8, -.53, 0, 2 * Math.PI); ctx.stroke();
  ctx.setLineDash([3, 9]);
  circle(ctx, x, y, r * 1.12, false);
  ctx.restore();
  const plate = getPlate(colors.ink);
  if (plate) ctx.drawImage(plate, x-r, y-r, 2*r, 2*r);
  ctx.fillStyle = colors.accent;
  for (const [sx, sy, size] of [[.81,.25,15],[.76,.36,5],[.91,.32,7],[.3,.77,13],[.19,.84,5],[.63,.12,5]]) star(ctx,sx*1000, sy*h,size);
  for (const [sx, sy] of [[.77,.22],[.66,.37],[.89,.21],[.93,.45],[.83,.4],[.22,.7],[.37,.82]]) circle(ctx,1000*sx,h*sy,1.9);
}
function formPlate(ctx, h, colors) {
  ctx.save();
  ctx.translate(810, h*.76); ctx.rotate(-.50);
  ctx.strokeStyle = colors.accent;
  for (let r=60; r<=480; r+=19) {
    ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0,0,r, Math.PI,2*Math.PI); ctx.lineTo(r,500); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = colors.accent;
  ctx.fillRect(74, h * .78, 85, 10);
}
function bookPlate(ctx, h, colors) {
  ctx.strokeStyle=colors.ink;
  rule(ctx,72,h*.15,928,h*.15,2);
  rule(ctx,72,h*.843,928,h*.843,2);
  ctx.fillStyle=colors.accent;
  ctx.beginPath(); ctx.moveTo(825,0); ctx.lineTo(862,0); ctx.lineTo(862,h*.095); ctx.lineTo(844,h*.082); ctx.lineTo(825,h*.095); ctx.closePath();ctx.fill();
}
function letterpress(ctx, label, x, y, size, tracking = 3) {
  ctx.font = '500 '+size+'px Arial, sans-serif';
  for (const ch of label) { ctx.fillText(ch,x,y); x += ctx.measureText(ch).width + tracking; }
}
function furniture(ctx, h, state, colors) {
  const layout = layouts[state.layout], inset=74, bottom=h*.943;
  ctx.fillStyle=colors.ink;ctx.strokeStyle=colors.ink;
  letterpress(ctx,layout.english,inset,h*.069,21,3.5);
  if (state.layout === 'lunar') {
    const start=818, y=h*.063;
    for (let i=0;i<5;i++) {
      const x=start+i*25;ctx.lineWidth=1.8;
      circle(ctx,x,y,7.8,false);
      if (i===4) circle(ctx,x,y,7.5);
      if (i>0 && i<4) {
        ctx.save();ctx.beginPath();ctx.arc(x,y,7.6,0,2*Math.PI);ctx.clip();
        circle(ctx,x+14-i*3.6,y,7.8);ctx.restore();
      }
    }
  }
  ctx.save();ctx.globalAlpha=.72;rule(ctx,inset,bottom-29,926,bottom-29,1.6);ctx.restore();
  ctx.font='19px "PingFang SC", sans-serif';ctx.fillText(layout.name,inset,bottom);
  const alignment='E Q U A L   W I D T H';
  ctx.font='16px Arial, sans-serif';ctx.textAlign='right';
  if (state.layout === 'lunar') {
    const w = ctx.measureText(alignment).width;
    ctx.fillStyle=colors.paper;ctx.fillRect(914-w,bottom-20,w+24,27);ctx.fillStyle=colors.ink;
  }
  ctx.fillText(alignment,926,bottom);ctx.textAlign='left';
}
function inkMetrics(ctx, text) {
  const m=ctx.measureText(text);
  return { left:m.actualBoundingBoxLeft, width:Math.max(1,m.actualBoundingBoxLeft+m.actualBoundingBoxRight || m.width), top:Math.max(0,m.actualBoundingBoxAscent), bottom:Math.max(0,m.actualBoundingBoxDescent) };
}
// Measure at a fixed size, then apply one uniform scale per line. This also
// preserves fractional font sizes in long lines and glyph overhangs in italics.
export function fitLines(ctx, texts, family, box) {
  ctx.font='100px '+family;
  const measured = texts.map(text => {
    const metrics = inkMetrics(ctx,text);
    const factor=box.w/metrics.width;
    return {text, metrics, factor, height:Math.max(12, metrics.top+metrics.bottom)*factor};
  });
  const heights=measured.reduce((total,row)=>total+row.height,0);
  const gap=Math.min(25, box.h/(Math.max(1,texts.length)*5));
  const fullHeight=heights+Math.max(0,texts.length-1)*gap;
  const shrink=Math.min(1,box.h/Math.max(1,fullHeight));
  let top=box.y+(box.center?(box.h-fullHeight*shrink)/2:0);
  return measured.map(row=>{
    const scale=row.factor*shrink, width=box.w*shrink;
    const left=box.x+(box.center?(box.w-width)/2:0);
    const line={text:row.text, size:100*scale, scale, x:left+row.metrics.left*scale, y:top+row.metrics.top*scale, width};
    top+=(row.height+gap)*shrink;
    return line;
  });
}
export function renderPoster(canvas, state) {
  const scale = posterWidth / 1000;
  const h=ratios[state.ratio].height / scale;
  if(canvas.width!==posterWidth || canvas.height!==ratios[state.ratio].height) {
    canvas.width=posterWidth; canvas.height=ratios[state.ratio].height;
  }
  const ctx=canvas.getContext('2d'), colors=palettes[state.palette];
  ctx.save();ctx.scale(scale,scale);
  ctx.fillStyle=colors.paper;ctx.fillRect(0,0,1000,h);
  if(state.layout==='lunar') lunarPlate(ctx,h,colors);
  if(state.layout==='form') formPlate(ctx,h,colors);
  if(state.layout==='book') bookPlate(ctx,h,colors);
  furniture(ctx,h,state,colors);
  const box=state.layout==='book'?{x:120,y:h*.19,w:760,h:h*.60,center:true}:state.layout==='form'?{x:74,y:h*.19,w:680,h:h*.54}:{x:72,y:h*.145,w:562,h:h*.49};
  const rows=fitLines(ctx,linesOf(state.text),fonts[state.font].family,box);
  ctx.fillStyle=colors.ink;
  for(const row of rows){
    ctx.save();ctx.translate(row.x,row.y);ctx.scale(row.scale,row.scale);
    ctx.fillText(row.text,0,0);ctx.restore();
  }
  ctx.restore();return rows;
}
export function drawTile(canvas, layout) {
  canvas.width=300;canvas.height=147;
  const ctx=canvas.getContext('2d'), colors=palettes[layouts[layout].palette];
  ctx.save();ctx.scale(.3,.3);
  ctx.fillStyle=colors.paper;ctx.fillRect(0,0,1000,490);
  if(layout==='lunar') {
    const plate=getPlate(colors.ink);
    if(plate) ctx.drawImage(plate,495,110,540,540);
    ctx.strokeStyle=colors.ink;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(785,375,370,167,-.5,0,Math.PI*2);ctx.stroke();
  } else if(layout==='form') formPlate(ctx,500,colors);
  else bookPlate(ctx,490,colors);
  ctx.fillStyle=colors.ink;
  const sample=layout==='lunar'?'月':layout==='form'?'构':'字';
  ctx.font='265px '+fonts.serif.family;ctx.fillText(sample,layout==='book'?370:70,353);
  if(layout!=='book') { ctx.fillRect(90,393,180,4);ctx.fillRect(90,410,115,4); }
  ctx.restore();
}
