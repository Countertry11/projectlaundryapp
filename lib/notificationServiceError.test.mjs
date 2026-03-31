import test from "node:test";
import assert from "node:assert/strict";
import {
  getNotificationErrorMessage,
  shouldSilenceNotificationError,
} from "./notificationServiceError.mjs";

test("getNotificationErrorMessage returns message from Error instances", () => {
  assert.equal(
    getNotificationErrorMessage(new Error("permission denied")),
    "permission denied",
  );
});

test("getNotificationErrorMessage returns empty string for empty objects", () => {
  assert.equal(getNotificationErrorMessage({}), "");
});

test("shouldSilenceNotificationError silences empty object errors", () => {
  assert.equal(shouldSilenceNotificationError({}), true);
});

test("shouldSilenceNotificationError silences missing relation errors", () => {
  assert.equal(
    shouldSilenceNotificationError({
      message: 'relation "notifications" does not exist',
    }),
    true,
  );
});

test("shouldSilenceNotificationError silences permission errors", () => {
  assert.equal(
    shouldSilenceNotificationError({
      message: "permission denied for table notifications",
    }),
    true,
  );
});

test("shouldSilenceNotificationError keeps unexpected network errors visible", () => {
  assert.equal(
    shouldSilenceNotificationError({
      message: "network timeout while fetching notifications",
    }),
    false,
  );
});
