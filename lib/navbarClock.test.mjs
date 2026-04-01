import test from "node:test";
import assert from "node:assert/strict";
import { getMillisecondsUntilNextMinute } from "./navbarClock.mjs";

test("getMillisecondsUntilNextMinute waits until the next minute boundary", () => {
  const referenceDate = new Date("2026-04-01T15:59:45.250Z");

  assert.equal(getMillisecondsUntilNextMinute(referenceDate), 14_750);
});

test("getMillisecondsUntilNextMinute returns a full minute at an exact boundary", () => {
  const referenceDate = new Date("2026-04-01T16:00:00.000Z");

  assert.equal(getMillisecondsUntilNextMinute(referenceDate), 60_000);
});
