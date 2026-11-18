<p align="right"><a href="README.md">中文</a></p>

<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="equal-width — lines of uneven text, auto-sized to the same width; in the pink panel on the right, four lines of a poem shrink in size but stay equal in width, with dashed guides marking the edges">
</p>

<p align="center">
  <a href="https://xiaosang.cc/equal-width/">▶ Live Demo</a>
  ·
  <a href="https://github.com/holynova/equal_width">GitHub Repository</a>
</p>

equal-width is an equal-width text generator: type lines of different lengths and it auto-adjusts each line's font size so they all render at the same visual width. It ships with a 9-line Mid-Autumn poem as the demo — from the single character 「月」 ("Moon") to a 30+ character line — and one click on "go" lines them all up at 400px wide.

## Screenshot

<p align="center">
  <img src="./assets/readme/screenshot.png" width="500" alt="After clicking go: 9 lines of uneven poem in the input box, and in the pink output box below, each line a different size but exactly the same width — the single character 月 largest, the long line smallest">
</p>

## How It Works

- **Per-line font-size scan**: for each line, it scans font sizes upward from 1px, measuring the real rendered width in a hidden playground div (`.playground`), and picks the largest size that stays within the 400px target (capped at 999px).
- **Real measurement**: no character-width estimation — it uses the browser's actual layout (`offsetWidth`), so mixed Chinese/English/digits come out right.
- **Output**: each line becomes a `div`, centered into the 400px-wide pink output box at its computed size with `white-space: nowrap`.
- **Timing**: after clicking go, the generation time is logged to the console (`timeIt` in `debug.js`).

## Usage

1. Paste multiple lines of text into the input box (it ships pre-filled with the 9-line Mid-Autumn poem).
2. Click **go** and the equal-width result appears in the output box below.
3. Empty lines are skipped; leading/trailing spaces are trimmed.

## Run Locally

```bash
npm install
npm start          # webpack-dev-server
npm run build      # build to dist (webpack 3 + Babel 6 + SCSS)
```

The build output lives in `docs/`; you can also open `docs/index.html` directly with a static server.

## Tech

- Webpack 3 + Babel 6 + SCSS; the core algorithm is ~100 lines in `src/scripts/equal_width.js`.
- The `.playground` measurement area is a hidden div; temporary nodes are removed after each measurement.

```
src/index.html              Entry: title, input box, go button, output box, measurement area
src/scripts/equal_width.js  Core: split lines, scan for the best font size per pixel, render output
src/scripts/debug.js        Logging and timing
src/scripts/index.js        Entry: imports styles and equal_width
src/styles/style.scss       Output box styles (400px wide, pink background)
docs/                       Build output
```
