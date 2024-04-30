import { __ } from "@wordpress/i18n";

const teamFields = {
  account_id: {
    label: __("Account ID", "trustedlogin-connector"),
    id: "account_id",
  },
  private_key: {
    label: __("Private Key", "trustedlogin-connector"),
    id: "private_key",
  },
  public_key: {
    label: __("Public Key", "trustedlogin-connector"),
    id: "public_key",
  },
  helpdesk: {
    label: __("Help Desk", "trustedlogin-connector"),
    id: "helpdesk",
    defaultValue: "helpscout",
    options: [
      { value: "helpscout", label: __("Help Scout", "trustedlogin-connector") },
      { value: "freescout", label: __("FreeScout", "trustedlogin-connector") },
    ],
  },
  approved_roles: {
    label: __("What Roles Provide Support?", "trustedlogin-connector"),
    id: "approved_roles",
    type: "array",
  },
};
export default teamFields;
