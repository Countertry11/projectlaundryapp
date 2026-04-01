export function getMillisecondsUntilNextMinute(date = new Date()) {
  const elapsedMilliseconds =
    date.getSeconds() * 1000 + date.getMilliseconds();

  if (elapsedMilliseconds === 0) {
    return 60_000;
  }

  return 60_000 - elapsedMilliseconds;
}
