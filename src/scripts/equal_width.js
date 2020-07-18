import { log, timeIt } from './debug';

const $ = document.querySelector.bind(document);

function getRows(text) {
  return text.split(/\n/g).map(item => item.trim()).filter(item => item);
}

function init() {
  const $input = $('.input');
  const text = `
  月
  当空
  光辉皎洁
  耀乾坤静空阔
  圆满中秋玩争诗哲
  玉兔滴难穿桂核人共折
  万象照仍无私琼台岂遮君谒
  抱琴对弹别鹤声不得知音声不切
  抱琴对弹别鹤声不得知音声不切不切不切不切不切123456789

  `;
  $input.value = getRows(text).join('\n');
}


function genRowElement(text = '', fontSize = 12, elementType = 'span') {
  const ele = document.createElement(elementType);
  ele.innerHTML = text;
  ele.style.fontSize = `${fontSize}px`;
  ele.style.whiteSpace = 'nowrap';
  ele.className = 'row-item';
  return ele;
}


function measureWidth(str, size) {
  const $playground = $('.playground');
  const rowEle = genRowElement(str, size);
  $playground.appendChild(rowEle);
  const width = rowEle.offsetWidth;
  $playground.removeChild(rowEle);
  return width;
}


function getPerfectFontSize(text = '', targetWidth = 400) {
  // const lengthArr = [];
  const maxSize = 999;
  let perfectSize = 12;
  let currentMin = measureWidth(text, perfectSize);


  for (let i = perfectSize + 1; i < maxSize; i += 1) {
    const width = measureWidth(text, i);
    const delta = Math.abs(width - targetWidth);
    if (delta < currentMin) {
      currentMin = delta;
      perfectSize = i;
      // break;
    }
  }
  return perfectSize;

  // const { fontSize } = lengthArr.reduce((prevMin, item) => ((item.delta < prevMin.delta) ? item : prevMin), { delta: Infinity });
  // return fontSize;

  // lengthArr.forEach((item) => {
  //   log(item);
  // });
}


function go() {
  $('.output').innerHTML = '';
  const rows = getRows($('.input').value);
  // 找到最长的一列, 设为最小字号
  // Math.max
  rows.forEach((row) => {
    const perfectSize = getPerfectFontSize(row, 400);
    $('.output').appendChild(genRowElement(row, perfectSize, 'div'));
  });

  // 测量宽度

  // 以这个宽度为基准, 缩放其他列, 直到接近宽度为止
  // 输出
  // $('.output').innerHTML = rows.map(item => `<div class="output-row" >${item}</div>`).join('');
}
const test = () => {
  $('.output').appendChild(genRowElement('hello', 14));
};

function main() {
  init();
  log('ready');
  $('.button').addEventListener('click', () => {
    timeIt(go);
  });
}

main();
