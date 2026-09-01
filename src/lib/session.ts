const LOCATION_KEY = 'hm.lastLocationId';
const LEGACY_HOUSE_KEY = 'hm.lastHouseId';
const SIGNED_IN_KEY = 'hm.signedIn';
const PROTOTYPE_STARTED_KEY = 'hm.prototypeStarted';

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

export function readLastLocationId(): string | null {
  return read(LOCATION_KEY) ?? read(LEGACY_HOUSE_KEY);
}

export function writeLastLocationId(locationId: string): void {
  write(LOCATION_KEY, locationId);
}

export function clearLastLocationId(): void {
  remove(LOCATION_KEY);
  remove(LEGACY_HOUSE_KEY);
}

/** Back to a first run: signed in by default, with no location ever chosen. */
export function clearSession(): void {
  clearLastLocationId();
  remove(SIGNED_IN_KEY);
  remove(PROTOTYPE_STARTED_KEY);
}

export function readPrototypeStarted(): boolean {
  return read(PROTOTYPE_STARTED_KEY) === 'true';
}

export function writePrototypeStarted(started: boolean): void {
  write(PROTOTYPE_STARTED_KEY, started ? 'true' : 'false');
}

export function readSignedIn(): boolean {
  return read(SIGNED_IN_KEY) !== 'false';
}

export function writeSignedIn(signedIn: boolean): void {
  write(SIGNED_IN_KEY, signedIn ? 'true' : 'false');
}
