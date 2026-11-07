type LandingPopupRedirectProps = {
  enabled: boolean;
  delaySeconds: number;
};

/**
 * Homepage forced redirect is disabled.
 * Stays mounted from the root layout and renders nothing, so no timer is
 * scheduled and router.push('/popup') never runs.
 */
export default function LandingPopupRedirect({
  enabled,
  delaySeconds,
}: LandingPopupRedirectProps) {
  // Props remain for the root-layout caller. They are intentionally unused:
  // no timer is scheduled and the popup route is never pushed.
  void enabled;
  void delaySeconds;
  return null;
}
