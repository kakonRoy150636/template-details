const WISHLIST_KEY = 'kroy_wishlist';
const RECENT_KEY = 'kroy_recent';
const COMPARE_KEY = 'kroy_compare';
const RECENT_LIMIT = 10;
const COMPARE_LIMIT = 4;

function readArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// ---------- Wishlist ----------
export function getWishlist(): string[] {
  return readArray(WISHLIST_KEY);
}

export function toggleWishlist(id: string): string[] {
  const list = getWishlist();
  const idx = list.indexOf(id);
  const isAdding = idx === -1;
  if (isAdding) list.unshift(id);
  else list.splice(idx, 1);
  writeArray(WISHLIST_KEY, list);
  return list;
}

export function isInWishlist(id: string): boolean {
  return getWishlist().includes(id);
}

// ---------- Recently Viewed ----------
export function getRecent(): string[] {
  return readArray(RECENT_KEY).slice(0, RECENT_LIMIT);
}

export function addRecent(id: string) {
  let list = getRecent().filter((x) => x !== id);
  list.unshift(id);
  list = list.slice(0, RECENT_LIMIT);
  writeArray(RECENT_KEY, list);
}

// ---------- Compare ----------
export function getCompare(): string[] {
  return readArray(COMPARE_KEY).slice(0, COMPARE_LIMIT);
}

export function toggleCompare(id: string): string[] {
  let list = getCompare();
  const idx = list.indexOf(id);
  if (idx !== -1) {
    list.splice(idx, 1);
  } else {
    if (list.length >= COMPARE_LIMIT) return list;
    list.push(id);
  }
  writeArray(COMPARE_KEY, list);
  return list;
}

export function isComparing(id: string): boolean {
  return getCompare().includes(id);
}

export function removeFromCompare(id: string): string[] {
  const list = getCompare().filter((x) => x !== id);
  writeArray(COMPARE_KEY, list);
  return list;
}

export function clearCompare(): string[] {
  writeArray(COMPARE_KEY, []);
  return [];
}
