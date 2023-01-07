import React, { useState } from "react";
import { exchangeToken } from "../../api";
import { PrimaryButtonLookingLink, SecondaryButton } from "../Buttons";
import { SettingsPageLayout } from "../Layout";

const CONNECTIION_SETTINGS = {
  loginUrl: "https://php8.trustedlogin.dev/login",
};
const Login = ({ loginUrl }) => {
  return (
    <div>
      <h2>Login</h2>
      <PrimaryButtonLookingLink href={loginUrl}>
        Login To Trusted Login
      </PrimaryButtonLookingLink>
    </div>
  );
};
//List of connected accounts
const ConnectedAccounts = ({ connectedAccounts, title }) => {
  return (
    <div>
      <h2>{title}</h2>
      {connectedAccounts.length ? (
        <ul>
          {connectedAccounts.map((account) => (
            <li key={account.id}>
              <p>{account.name}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No Accounts Connected</p>
      )}
    </div>
  );
};

const handleConnect = (token) => {
  exchangeToken(token).then((account) => {
    console.log({ account });
    //TODO put in connected accounts
    console.log(JSON.parse(account.data));
  });
};
//List of possible accounts
const PossibleAccounts = ({ accounts }) => {
  const possible = React.useMemo(() => {
    return Object.values(accounts);
  }, [accounts]);

  return (
    <div>
      <h2>Possible Accounts</h2>

      {possible.length ? (
        <ul>
          {possible.map(({ token, name }) => (
            <li key={token}>
              <p>{name}</p>
              <SecondaryButton
                onClick={(e) => {
                  e.preventDefault();
                  handleConnect(token);
                }}>
                Connect
              </SecondaryButton>
            </li>
          ))}
        </ul>
      ) : (
        <p>No unconnected accounts</p>
      )}
    </div>
  );
};

export default function Connector({
  title = "Connect",
  loginUrl = CONNECTIION_SETTINGS.loginUrl,
  connected = false,
}) {
  const [connectionState, setConnectionState] = useState({
    connected,
    connectedAccounts: [],
    notConnectedAccounts: connected ? tlVendor.connect.tokens : [],
  });
  return (
    <SettingsPageLayout title={title} subTitle={"Connect With Trusted Login"}>
      {connectionState.connected ? (
        <>
          <ConnectedAccounts
            connectedAccounts={connectionState.connectedAccounts}
          />
          <PossibleAccounts accounts={connectionState.notConnectedAccounts} />
          <Login loginUrl={loginUrl} />
        </>
      ) : (
        <Login loginUrl={loginUrl} />
      )}
    </SettingsPageLayout>
  );
}
