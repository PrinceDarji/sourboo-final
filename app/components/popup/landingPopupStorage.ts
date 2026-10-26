let dismissedInCurrentExperience = false;
const KEY = 'sourboo_popup_dismissed';

export function isLandingPopupDismissed(): boolean {
  if (dismissedInCurrentExperience) return true;
  try { return typeof window !== 'undefined' && window.sessionStorage.getItem(KEY) === '1'; }
  catch { return false; }
}

export function setLandingPopupDismissed(): void {
  dismissedInCurrentExperience = true;
  try { window.sessionStorage.setItem(KEY, '1'); } catch { /* In-memory fallback. */ }
}
