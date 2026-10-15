const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');

// SDK/network stub only: these tests do not prove live Kakao authentication.
function setup(key = 'test-only-key') {
  const scripts = [];
  let timeout;
  const window = { setTimeout: callback => { timeout = callback; return 1; }, clearTimeout: () => {} };
  const exports = {};
  const document = { createElement: () => ({ remove() { this.removed = true; } }), head: { appendChild: script => scripts.push(script) } };
  const code = ts.transpileModule(fs.readFileSync('lib/kakao-loader.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, window, document, process: { env: { NEXT_PUBLIC_KAKAO_MAP_JS_KEY: key } } });
  return { load: exports.loadKakaoMaps, scripts, window, timeout: () => timeout() };
}
test('missing key does not request the SDK', async () => {
  const fixture = setup('');
  await assert.rejects(fixture.load(), /missing-key/);
  assert.equal(fixture.scripts.length, 0);
});
test('concurrent mounts share one script and wait for maps.load', async () => {
  const fixture = setup();
  const first = fixture.load();
  assert.equal(first, fixture.load());
  assert.equal(fixture.scripts.length, 1);
  let finish;
  fixture.window.kakao = { maps: { load: callback => { finish = callback; } } };
  fixture.scripts[0].onload();
  finish();
  assert.equal(await first, fixture.window.kakao.maps);
  assert.equal(await fixture.load(), fixture.window.kakao.maps);
  assert.equal(fixture.scripts.length, 1);
});
test('script failure cleans up and allows retry', async () => {
  const fixture = setup();
  const first = fixture.load();
  fixture.scripts[0].onerror();
  await assert.rejects(first, /sdk-load-failed/);
  assert.equal(fixture.scripts[0].removed, true);
  const retry = fixture.load();
  assert.equal(fixture.scripts.length, 2);
  fixture.window.kakao = { maps: { load: callback => callback() } };
  fixture.scripts[1].onload();
  await retry;
});
test('timeout rejects and ignores a late SDK callback', async () => {
  const fixture = setup();
  const pending = fixture.load();
  let finish;
  fixture.window.kakao = { maps: { load: callback => { finish = callback; } } };
  fixture.scripts[0].onload();
  fixture.timeout();
  await assert.rejects(pending, /sdk-load-failed/);
  finish();
  assert.equal(fixture.scripts[0].removed, true);
});
