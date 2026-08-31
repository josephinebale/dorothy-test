const HOUSE_KEY = 'hm.lastHouseId';
const SIGNED_IN_KEY = 'hm.signedIn';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Prototype only; a blocked storage API just means nothing is remembered.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // See write().
  }
}

export function readLastHouseId(): string | null {
  return read(HOUSE_KEY);
}

export function writeLastHouseId(houseId: string): void {
  write(HOUSE_KEY, houseId);
}

export function clearLastHouseId(): void {
  remove(HOUSE_KEY);
}

export function readSignedIn(): boolean {
  return read(SIGNED_IN_KEY) !== 'false';
}

export function writeSignedIn(signedIn: boolean): void {
  write(SIGNED_IN_KEY, signedIn ? 'true' : 'false');
}
