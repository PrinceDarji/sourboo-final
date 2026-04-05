let dismissedInCurrentExperience = false;

export function isLandingPopupDismissed(): boolean {
  return dismissedInCurrentExperience;
}

export function setLandingPopupDismissed(): void {
  dismissedInCurrentExperience = true;
}
