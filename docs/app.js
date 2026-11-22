import { layouts, palettes, fonts, ratios, posterWidth, linesOf, renderPoster, drawTile, moonReady } from './poster.js';

const $ = selector => document.querySelector(selector);
const examples = ['月亮\n落进了\n我的诗里', '山风\n吹过\n一整个春天', '听\n雨落下\n城市在呼吸', '月\n当空\n光辉皎洁\n耀乾坤静空阔\n圆满中秋玩争诗哲\n玉兔滴难穿桂核人共折'];
const initial = { text: examples[0], layout: 'lunar', palette: 'blue', font: 'serif', ratio: 'portrait' };
const storageKey = 'equal-width-press.draft.v2';
const state = {...initial};
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if(saved && typeof saved.text === 'string') state.text=saved.text;
  for(const [key,options] of Object.entries({layout:layouts,palette:palettes,font:fonts,ratio:ratios})) {
    if(saved && Object.hasOwn(options,saved[key])) state[key]=saved[key];
  }
} catch { /* Local-only editing also works when browser storage is disabled. */ }

const icons = {
  github: '<path d="M9 19c-4.4 1.2-4.4-2.5-6.2-3m12.3 6v-3.1a2.7 2.7 0 0 0-.8-2.1c2.7-.3 5.6-1.3 5.6-6a4.7 4.7 0 0 0-1.3-3.3 4.3 4.3 0 0 0-.1-3.3s-1.1-.3-3.5 1.3a12.2 12.2 0 0 0-6.3 0C6.3 3.9 5.2 4.2 5.2 4.2a4.3 4.3 0 0 0-.1 3.3 4.7 4.7 0 0 0-1.3 3.3c0 4.7 2.9 5.7 5.6 6a2.7 2.7 0 0 0-.8 2.1V22"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 5V4a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v10a1 1 0 0 0 1 1h1"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  sliders:'<path d="M3 7h7m5 0h6M3 17h11m5 0h2"/><circle cx="12" cy="7" r="2.5"/><circle cx="16" cy="17" r="2.5"/>',
  expand:'<path d="M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5"/>',
  frame:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 17h8"/>',
  shuffle:'<path d="M3 7h3c4 0 6 10 10 10h4m-3-3 3 3-3 3M3 17h3c1.7 0 3-1.7 4-3.4M14 9c.9-1.3 2-2 3-2h3m-3-3 3 3-3 3"/>',
  chevron:'<path d="m6 9 6 6 6-6"/>', check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
};
const icon = name => '<svg aria-hidden="true" viewBox="0 0 24 24">'+icons[name]+'</svg>';
function makeOptions(id, options, key, make) {
  for(const [value, option] of Object.entries(options)){
    const button=document.createElement('button');
    button.type='button';button.dataset[key]=value;button.title=option.name;
    button.setAttribute('aria-label',option.name);make(button,value,option);
    button.addEventListener('click',()=>{
      if(key==='layout' && state.palette===layouts[state.layout].palette) state.palette=option.palette;
      state[key]=value; update();
    });
    $(id).append(button);
  }
}
makeOptions('#layouts',layouts,'layout',(b,value,o)=>{
  b.className='layout';
  b.innerHTML='<span class="tile"><canvas aria-hidden="true"></canvas></span><span class="layout-name">'+o.name+'<i data-icon="check"></i></span>';
  drawTile(b.querySelector('canvas'),value);
});
makeOptions('#palettes',palettes,'palette',(b,value,p)=>{
  b.className='swatch';b.style.setProperty('--swatch',p.paper);b.style.setProperty('--swatch-ink',p.ink);
  b.style.setProperty('--swatch-ring',value==='paper'?p.ink:p.paper);b.innerHTML='<i data-icon="check"></i>';
});
makeOptions('#ratios',ratios,'ratio',(b,value,r)=>{
  b.className='ratio';
  const shape=document.createElement('span');shape.className='ratio-mark';
  shape.style.width=String(14*posterWidth/r.height)+'px';shape.style.height='14px';b.append(shape,r.name);
});
for(const [key,f] of Object.entries(fonts)) $('#font').add(new Option(f.name,key));
document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
$('#writing').value=state.text;$('#font').value=state.font;
$('#font').addEventListener('change',e=>{state.font=e.target.value;update();});
$('#writing').addEventListener('input',e=>{state.text=e.target.value;update();});
let exampleIndex=examples.indexOf(state.text);
$('#sample').addEventListener('click',()=>{
  exampleIndex=(exampleIndex+1)%examples.length;
  state.text=examples[exampleIndex];$('#writing').value=state.text;update();
});
let currentRows=[], revision=0, frame=0;
let saveTimer, messageTimer, imageUrl, imageBlob;
const poster=$('#poster'), dialog=$('#output');

function notify(message) {
  // A modal dialog lives in the top layer, so announce messages inside it when open.
  const node=$('#message');(dialog.open?dialog:document.body).append(node);
  node.textContent=message;node.classList.add('show');clearTimeout(messageTimer);
  messageTimer=setTimeout(()=>node.classList.remove('show'),3100);
}
function ready(enabled) {
  for (const id of ['#export','#copy','#enlarge','#open-paper']) $(id).disabled=!enabled;
}
function update() {
  const token=++revision, texts=linesOf(state.text);
  clearTimeout(saveTimer);saveTimer=setTimeout(save,160);
  $('#counter').textContent=texts.length+' 行 · '+Array.from(texts.join('')).length+' 字';
  $('#caption').textContent=layouts[state.layout].name+' / '+palettes[state.palette].name;
  $('#ink-chip').style.backgroundColor=palettes[state.palette].paper;
  $('#dimensions').textContent=posterWidth+' × '+ratios[state.ratio].height+' px';
  $('#color-name').textContent=palettes[state.palette].name;
  for(const key of ['ratio','palette','layout']) for(const el of document.querySelectorAll('[data-'+key+']')) el.setAttribute('aria-pressed',String(el.dataset[key]===state[key]));
  $('.paper').style.setProperty('--ratio',posterWidth/ratios[state.ratio].height);
  $('.paper').hidden=!texts.length;$('.empty').hidden=Boolean(texts.length);
  poster.setAttribute('aria-label',layouts[state.layout].name+'海报：'+texts.join('，'));
  ready(false);cancelAnimationFrame(frame);
  if(!texts.length){currentRows=[];return;}
  frame=requestAnimationFrame(async()=>{
    const pending=[document.fonts.load('100px '+fonts[state.font].family,texts.join(''))];
    if(state.layout==='lunar') pending.push(moonReady);
    const loads=await Promise.allSettled(pending);
    if(token!==revision)return;
    currentRows=renderPoster(poster,state);ready(true);
    if(loads[0].status==='rejected') notify('字体加载失败，已使用设备字体排版。');
    if(loads[1]?.status==='rejected') notify('月面图像加载失败，可刷新重试。');
  });
}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{/* optional storage */}}
window.addEventListener('pagehide',save);
Promise.allSettled([moonReady,document.fonts.load('100px '+fonts.serif.family,'月构字')]).then(()=>{
  for(const b of document.querySelectorAll('[data-layout]')) drawTile(b.querySelector('canvas'),b.dataset.layout);
});
function clipboardData() {
  const theme=palettes[state.palette], block=document.createElement('div');
  block.style.cssText='display:inline-block;background-color:'+theme.paper+';color:'+theme.ink+';padding:16px;text-align:left;';
  const font=fonts[state.font];
  const localNames={serif:'"Noto Serif SC","Source Han Serif SC"',kai:'"LXGW WenKai TC","LXGW WenKai"',display:'"ZCOOL QingKe HuangYou"',sans:'system-ui'};
  const scale=320/Math.max(1,...currentRows.map(r=>r.width));
  for(const row of currentRows){
    const line=document.createElement('div');
    line.style.cssText='white-space:pre;line-height:1.13;color:'+theme.ink+';font-family:'+localNames[state.font]+','+font.family+';font-size:'+(row.size*scale).toFixed(2)+'px;';
    line.textContent=row.text;block.append(line);
  }
  return {html:block.outerHTML,plain:currentRows.map(r=>r.text).join('\n')};
}
$('#copy').addEventListener('click',async ()=>{
  const {html,plain}=clipboardData();
  try{
    if(!navigator.clipboard?.write || !window.ClipboardItem)throw new Error('Legacy clipboard');
    await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([plain],{type:'text/plain'})})]);
  }catch{
    let supplied=false;
    const copy=e=>{if(e.clipboardData){e.preventDefault();e.clipboardData.setData('text/html',html);e.clipboardData.setData('text/plain',plain);supplied=true;}};
    document.addEventListener('copy',copy,{once:true});
    let ok=false;
    try { ok=document.execCommand('copy'); }catch{/* Browser may deny access. */}
    document.removeEventListener('copy',copy);
    if(!ok || !supplied){
      $('#writing').focus();$('#writing').select();notify('浏览器限制了复制，已选中文字，可手动复制。');return;
    }
  }
  notify('已复制排版，可粘贴到富文本编辑器。');
});
const png=()=>new Promise((resolve,reject)=>poster.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG encoding failed')),'image/png'));
async function showImage(exporting) {
  const token=revision;
  try {
    const blob=await png();if(token!==revision||dialog.open)return;
    imageBlob=blob;imageUrl=URL.createObjectURL(blob);
    $('#result-image').src=imageUrl;$('#export-tools').hidden=!exporting;
    dialog.classList.toggle('expanded',!exporting);
    $('#dialog-title').textContent=exporting?'导出海报':'放大预览';
    $('#download').href=imageUrl;
    const title=(linesOf(state.text)[0]||'海报').replace(/[\\/:*?"<>|]/g,'').slice(0,24);
    $('#download').download='齐行-'+title+'-'+layouts[state.layout].name+'.png';
    $('#file-info').textContent='PNG · '+$('#dimensions').textContent;
    $('#copy-image').hidden=!navigator.clipboard?.write||!window.ClipboardItem;
    dialog.showModal();
  }catch{notify('图片生成失败，请重试。');}
}
$('#enlarge').addEventListener('click',()=>showImage(false));
$('#export').addEventListener('click',()=>showImage(true));
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{
  document.body.append($('#message'));$('#message').classList.remove('show');
  if(imageUrl)URL.revokeObjectURL(imageUrl);
  $('#result-image').removeAttribute('src');$('#download').removeAttribute('href');imageUrl=undefined;imageBlob=undefined;
});
$('#copy-image').addEventListener('click',async()=>{
  try{await navigator.clipboard.write([new ClipboardItem({'image/png':imageBlob})]);notify('海报图片已复制。');}
  catch{notify('浏览器限制了图片复制，可使用「保存 PNG」。');}
});
// Both layouts use the same controls so edits, drafts and clipboard actions
// remain in sync when a phone rotates or the editor window is resized.
const mobile = matchMedia('(max-width: 680px), (max-width: 960px) and (max-height: 520px) and (pointer: coarse)');
const tabs = [...document.querySelectorAll('.editor-switch [role="tab"]')];
let selectedTab = tabs[0];

function selectEditorTab(next) {
  selectedTab = next;
  for (const tab of tabs) {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    const active = tab === selectedTab;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panel.hidden = mobile.matches && !active;
    if (mobile.matches) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
    }
  }
  $('#copy').hidden = mobile.matches && selectedTab !== tabs[0];
}

function placeEditorActions() {
  if (mobile.matches) {
    $('.mast-inner').append($('#export'));
    $('.editor-switch').append($('#copy'));
    $('#style-panel').append($('.source'));
  } else {
    $('.actions').append($('#copy'), $('#export'));
    $('.mast-inner').append($('.source'));
  }
  selectEditorTab(selectedTab);
}

for (const tab of tabs) {
  tab.addEventListener('click', () => selectEditorTab(tab));
  tab.addEventListener('keydown', event => {
    const targets = {
      ArrowLeft: tabs[1 - tabs.indexOf(tab)],
      ArrowRight: tabs[1 - tabs.indexOf(tab)],
      Home: tabs[0],
      End: tabs[1],
    };
    const target = targets[event.key];
    if (!target) return;
    event.preventDefault();
    selectEditorTab(target);
    target.focus();
  });
}

$('.empty a').addEventListener('click', event => {
  event.preventDefault();
  selectEditorTab(tabs[0]);
  $('#writing').focus();
});
$('#open-paper').addEventListener('click', () => showImage(false));
mobile.addEventListener('change', placeEditorActions);
placeEditorActions();
update();
