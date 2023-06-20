import { __ } from "@wordpress/i18n";

const teamFields = {
  account_id: {
    label: __("Account ID", "trustedlogin-vendor"),
    id: "account_id",
  },
  private_key: {
    label: __("Private Key", "trustedlogin-vendor"),
    id: "private_key",
  },
  public_key: {
    label: __("Public Key", "trustedlogin-vendor"),
    id: "public_key",
  },
  helpdesk: {
    label: __("Help Desk", "trustedlogin-vendor"),
    id: "helpdesk",
    defaultValue: "helpscout",
    options: [
      { value: "helpscout", label: __("Help Scout", "trustedlogin-vendor") },
      { value: "freescout", label: __("Free Scout", "trustedlogin-vendor") },
      { value: "zendesk", label: __("Zendesk", "trustedlogin-vendor") },
    ],
  },
  approved_roles: {
    label: __("What Roles Provide Support?", "trustedlogin-vendor"),
    id: "approved_roles",
    type: "array",
  },
};
export default teamFields;
