const hasOnboarded =
  window.tlVendor && window.tlVendor.onboarding === "COMPLETE";
let initialTeams = null;
let initialIntegrationSettings = null;
//Remote session
let session = {
  hasAppToken: false,
  loginUrl: null,
  logoutUrl: null,
};
//See init.php for where tlVendor is set using wp_localize_script
if (window.tlVendor) {
  initialTeams = window.tlVendor.settings.teams;
  if (initialTeams.length > 0) {
    initialTeams = initialTeams.map((team, id) => {
      return {
        ...team,
        id,
      };
    });
  }
  initialIntegrationSettings = window.tlVendor.settings.integrations;

  if (window.tlVendor.session) {
    session = window.tlVendor.session;
  }
}

export { hasOnboarded, initialTeams, initialIntegrationSettings, session };
