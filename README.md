<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="等宽排版辅助 equal-width — 长短不一的文字，自动调字号排成一样宽；右侧粉色面板里四行诗字号递减但宽度相等，两条虚线标示左右边界">
</p>

<p align="center">
  <a href="https://xiaosang.cc/equal-width/">▶ 在线体验 Play Online</a>
  ·
  <a href="https://github.com/holynova/equal_width">GitHub 仓库</a>
</p>

equal-width 是一个等宽文字生成器：每行输入长短不一的文字，自动调整字号，使得看起来宽度相等。内置一首 9 行中秋诗做示例——从 1 个字的「月」到 30 多字的长句，点一下 go，全部排成 400px 宽。

equal-width is an equal-width text generator: type lines of different lengths and it auto-adjusts each line's font size so they all render at the same visual width. It ships with a 9-line Mid-Autumn poem as the demo — from the single character 「月」 to a 30+ character line — and one click on "go" lines them all up at 400px wide.

## 截图 / Screenshot

<p align="center">
  <img src="./assets/readme/screenshot.png" width="500" alt="点击 go 后的效果：输入框里 9 行长短不一的诗句，下方粉色输出框里每行字号不同但宽度完全相等，月字最大，长句最小">
</p>

## 原理 / How It Works

- **逐行扫描字号**：对每一行，从 1px 开始逐像素增大字号，在隐藏的测量区（`.playground`）实测渲染宽度，取宽度不超过 400px 的最大字号（上限 999px）。
- **真实渲染测量**：不估算字符宽度，直接用浏览器排版结果（`offsetWidth`），中英混排、数字都准。
- **输出**：每行生成一个 `div`，按算出的字号、`white-space: nowrap` 居中排进 400px 宽的粉色输出框。
- **计时**：点 go 后在控制台输出生成耗时（`debug.js` 的 `timeIt`）。

## 使用 / Usage

1. 在输入框里粘贴多行文字（默认已填 9 行中秋示例诗）。
2. 点 **go**，下方输出框即显示等宽排版结果。
3. 空行会被自动忽略；每行首尾空格会被去掉。

## 本地运行 / Run Locally

```bash
npm install
npm start          # webpack-dev-server 开发服务
npm run build      # 构建到 dist（webpack 3 + Babel 6 + SCSS）
```

构建产物发布在 `docs/`（GitHub Pages 直接用该目录），也可以直接用静态服务器打开 `docs/index.html` 查看。

## 技术 / Tech

- Webpack 3 + Babel 6 + SCSS，核心算法只在 `src/scripts/equal_width.js`（约 100 行）。
- 测量区 `.playground` 是一个隐藏 div，每次测完即移除临时节点。

```
src/index.html              入口：标题、输入框、go 按钮、输出框、测量区
src/scripts/equal_width.js  核心：分行、逐像素扫描最佳字号、生成输出
src/scripts/debug.js        日志与耗时统计
src/scripts/index.js        入口：引入样式与 equal_width
src/styles/style.scss       输出框样式（400px 宽、粉色底）
docs/                       构建产物（GitHub Pages 发布目录）
```

## English

**equal-width** is an equal-width text generator: type lines of different lengths and it auto-adjusts each line's font size so every line renders at the same visual width.

- **How it works**: for each line, it scans font sizes upward from 1px, measuring the real rendered width in a hidden playground div, and picks the largest size that stays within the 400px target (capped at 999px).
- **Real measurement**: no character-width estimation — it uses the browser's actual layout (`offsetWidth`), so mixed Chinese/English/digits come out right.
- **Demo text**: a built-in 9-line Mid-Autumn poem, from the single character 「月」 to a 30+ character line. Empty lines are skipped; leading/trailing spaces are trimmed.
- **Run it**: `npm install && npm start` (webpack-dev-server). Build with `npm run build` (webpack 3 + Babel 6 + SCSS); the built site lives in `docs/`.
- **Tech**: the core algorithm is ~100 lines in `src/scripts/equal_width.js`.

## 许可 / License

ISC（`package.json` 声明；仓库内暂无 LICENSE 文件）。
