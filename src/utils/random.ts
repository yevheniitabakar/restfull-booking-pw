const ALPHA = "abcdefghijklmnopqrstuvwxyz";

export function randomAlpha(length: number): string {
  if (length <= 0) {
    return "";
  }

  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * ALPHA.length);
    result += ALPHA[index];
  }
  return result;
}

export function randomInt(min: number, max: number): number {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}
