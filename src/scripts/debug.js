export const debugMode = true;
export const log = console.log.bind(console);
export function timeIt(func) {
  const start = new Date().getTime();
  if (typeof func === 'function') {
    func();
  }

  const end = Date.now();
  const diff = end - start;
  log(`用时${Math.floor(diff / 10) / 100}s`);
}
