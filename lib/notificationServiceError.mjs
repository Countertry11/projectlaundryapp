export function getNotificationErrorMessage(error) {
  if (error instanceof Error) {
    return error.message.trim();
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message.trim();
  }

  if (typeof error === "string") {
    return error.trim();
  }

  return "";
}

export function shouldSilenceNotificationError(error) {
  const message = getNotificationErrorMessage(error).toLowerCase();

  if (!message) {
    return true;
  }

  return (
    message.includes('relation "notifications" does not exist') ||
    message.includes("permission denied") ||
    message.includes("row-level security") ||
    message.includes("not found")
  );
}
