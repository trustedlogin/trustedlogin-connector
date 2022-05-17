import { useMemo, useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { useSettings } from "../hooks/useSettings";
import { HorizontalLogo } from "./TrustedLoginLogo";
import { SelectFieldArea, InputFieldArea } from "./teams/fields";
import TitleDescriptionLink from "./TitleDescriptionLink";

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

const AccessKeyForm = ({ initialAccountId = null }) => {
  const [accessKey, setAccessKey] = useState("");
  const { settings } = useSettings();
  const [redirectData, setRedirectData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  //Get teams from settings.
  const teams = useMemo(() => {
    return settings && settings.hasOwnProperty("teams") ? settings.teams : [];
  }, [settings]);

  const [accountId, setAccountId] = useState(initialAccountId);

  //Get all teams as options
  const teamsOption = useMemo(() => {
    if (!teams) {
      return [];
    }
    return teams.map((t) => {
      return {
        label: t.account_id,
        value: t.name ? t.name : t.account_id,
      };
    });
  }, [teams]);

  //This the form  action, where to redirect to.
  const action = useMemo(() => {
    if (!redirectData) {
      if (!window.tlVendor) {
        return "";
      }
      return window.tlVendor.accessKey.url;
    }
    return redirectData.loginurl;
  }, [redirectData, window.tlVendor]);

  useEffect(() => {
    if (teams.length == 1) {
      setAccountId(teams[0].account_id);
    }
  }, [teams, setAccountId]);

  const handler = (e) => {
    setIsLoading(true);
    let form = e.target;
    //Check if form input is valid
    if (!form.checkValidity()) {
      setIsLoading(false);

      //If not,show validation errros
      return;
    }
    let body = {};
    const data = new FormData(form);
    for (let [key, value] of data) {
      body[key] = value;
    }

    e.preventDefault();
    fetch(window.tlVendor.accessKey.url, {
      method: "POST",
      body,
    })
      .then((res) => res.json())
      .then((res) => {
        console.log({ res });
        if (res.hasOwnProperty("success") && res.success) {
          const { data } = res;
          setRedirectData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (redirectData) {
      document.getElementById("access-key-form").submit();
    }
  }, [redirectData]);

  return (
    <>
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mx-auto bg-white rounded-lg px-8 py-3 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:px-14 sm:py-8">
          <div className="w-full p-8 text-center">
            <HorizontalLogo />
          </div>
          <TitleDescriptionLink
            title={__("Log In Using Access Key", "trustedlogin-vendor")}
          />

          <>
            <form
              onSubmit={redirectData ? null : handler}
              id="access-key-form"
              method={"POST"}
              action={action}
              className="flex flex-col py-6 space-y-6 justify-center">
              {redirectData ? (
                <>
                  <div>{__("Redirecting", "trustedlogin")}</div>
                  <input type="hidden" name="action" value={"trustedlogin"} />
                  <input
                    type="hidden"
                    name="endpoint"
                    value={redirectData.endpoint}
                  />
                  <input type="hidden" name="ak" value={accessKey} />
                  <input
                    type="hidden"
                    name="identifier"
                    value={redirectData.identifier}
                  />
                </>
              ) : (
                <>
                  <input type="hidden" name="trustedlogin" value={1} />
                  <input
                    type="hidden"
                    name="action"
                    value={window.tlVendor.accessKey.action}
                  />
                  <input
                    type="hidden"
                    name="provider"
                    value={window.tlVendor.accessKey.provider}
                  />
                  <input
                    type="hidden"
                    name="_tl_ak_nonce"
                    value={window.tlVendor.accessKey._tl_ak_nonce}
                  />
                  {null !== initialAccountId ? (
                    <input type="hidden" name="account_id" value={accountId} />
                  ) : (
                    <SelectFieldArea
                      name="account_id"
                      id="account_id"
                      label={__("Account ID", "trustedlogin-vendor")}
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}>
                      <>
                        <select
                          name="account_id"
                          id="account_id"
                          className="bg-white block w-full pl-3 pr-8 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500">
                          {teamsOption.map(({ label, value }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </>
                    </SelectFieldArea>
                  )}
                  <div className="relative rounded-lg">
                    <InputFieldArea
                      name="access_key"
                      id="access_key"
                      label={__("Access Key", "trustedlogin-vendor")}>
                      <input
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        type="text"
                        name="access_key"
                        id="access_key"
                        className="block w-full pl-4 pr-10 py-4 sm:text-md border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500"
                        placeholder={__(
                          "Paste key received from customer",
                          "trustedlogin-vendor"
                        )}
                      />
                    </InputFieldArea>
                  </div>
                  {isLoading ? (
                    <div className="spinner is-active inline-flex justify-center p-4 border border-transparent text-md font-medium rounded-lg text-white bg-blue-tl"></div>
                  ) : (
                    <input
                      type="submit"
                      className="inline-flex justify-center p-4 border border-transparent text-md font-medium rounded-lg text-white bg-blue-tl hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500"
                      value={__("Log In", "trustedlogin-vendor")}
                    />
                  )}
                </>
              )}
            </form>
          </>
        </div>
      </div>
    </>
  );
};

export default AccessKeyForm;
