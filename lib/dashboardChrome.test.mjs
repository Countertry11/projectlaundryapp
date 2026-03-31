import test from "node:test";
import assert from "node:assert/strict";

import { getDashboardToneStyles } from "./dashboardChrome.mjs";

test("getDashboardToneStyles returns configured styles for known tones", () => {
  const styles = getDashboardToneStyles("emerald");

  assert.equal(styles.tone, "emerald");
  assert.match(styles.iconClassName, /from-emerald-500/);
  assert.match(styles.badgeClassName, /text-emerald-600/);
});

test("getDashboardToneStyles falls back to blue when tone is unknown", () => {
  const styles = getDashboardToneStyles("unknown-tone");

  assert.equal(styles.tone, "blue");
  assert.match(styles.iconClassName, /from-blue-600/);
});
