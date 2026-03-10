const STORAGE_KEY = "cafecode_my_reviews";

export function getMyReviewIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function addMyReviewId(id: string): void {
  const ids = getMyReviewIds();
  ids.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function removeMyReviewId(id: string): void {
  const ids = getMyReviewIds();
  ids.delete(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function isMyReview(id: string): boolean {
  return getMyReviewIds().has(id);
}
