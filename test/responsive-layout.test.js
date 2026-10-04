const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = html.match(/<style>([\s\S]*?)<\/style>/i)?.[1];

function mediaBlock(prelude) {
  const marker = `@media ${prelude}`;
  const start = css.indexOf(marker);
  assert.notEqual(start, -1, `missing media query: ${marker}`);

  const open = css.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }

  assert.fail(`unterminated media query: ${marker}`);
}

function ruleBody(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing CSS rule: ${selector}`);
  return match[1];
}

test("responsive CSS keeps the canvas full-screen and adapts controls by viewport", () => {
  assert.match(css, /canvas\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*position:\s*absolute;[^}]*inset:\s*0;/s);
  const wideControls = ruleBody(css, ".controls");
  assert.match(wideControls, /display:\s*flex;/);
  assert.match(wideControls, /flex-direction:\s*row;/);
  assert.match(wideControls, /top:\s*20px;/);
  assert.match(wideControls, /right:\s*20px;/);

  const narrow = mediaBlock("(max-width: 600px)");
  const narrowControls = ruleBody(narrow, ".controls");
  assert.match(narrowControls, /flex-direction:\s*column;/);
  assert.match(narrowControls, /top:\s*max\(12px,\s*env\(safe-area-inset-top\)\);/);
  assert.match(narrowControls, /right:\s*max\(12px,\s*env\(safe-area-inset-right\)\);/);
  assert.match(narrowControls, /gap:\s*8px;/);
  const narrowButtons = ruleBody(narrow, ".control-button");
  assert.match(narrowButtons, /min-height:\s*44px;/);
  assert.match(narrowButtons, /padding:\s*8px\s+14px;/);

  const shortLandscape = mediaBlock("(orientation: landscape) and (max-height: 500px)");
  const shortLandscapeControls = ruleBody(shortLandscape, ".controls");
  assert.match(shortLandscapeControls, /top:\s*max\(8px,\s*env\(safe-area-inset-top\)\);/);
  assert.match(shortLandscapeControls, /right:\s*max\(8px,\s*env\(safe-area-inset-right\)\);/);
  assert.match(shortLandscapeControls, /gap:\s*6px;/);
  const shortLandscapeButtons = ruleBody(shortLandscape, ".control-button");
  assert.match(shortLandscapeButtons, /min-height:\s*44px;/);
  assert.match(shortLandscapeButtons, /padding:\s*6px\s+10px;/);
  assert.match(shortLandscapeButtons, /font-size:\s*12px;/);
});
