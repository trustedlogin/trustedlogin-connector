import React, { useMemo, useState } from "react";
import { exchangeTeamToken } from "../../api";
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

const ConnectTeam = ({
  name,
  teamToken,
  exchangeToken,
  setErrors,
  onTeamConnected,
}) => {
  const handler = () => {
    exchangeTeamToken({ teamToken, token: exchangeToken })
      .then((account) => {
        console.log({ account });
        onTeamConnected({ teamToken, id: account.id, name: account.name });
        return true;
      })
      .catch((e) => {
        setErrors(e);
        return false;
      });
  };
  return (
    <>
      <p>{name}</p>
      <SecondaryButton onClick={handler}>Connect</SecondaryButton>
    </>
  );
};

export default function Connector({
  title = "Connect",
  loginUrl = CONNECTIION_SETTINGS.loginUrl,
  connected = false,
}) {
  const [errors, setErrors] = useState(false);

  const [connectionState, setConnectionState] = useState({
    connected,
    connectedAccounts: [],
    notConnectedAccounts: connected
      ? Object.values(tlVendor.connect.tokens)
      : [],
  });

  const onTeamConnected = ({ teamToken, id, name }) => {
    const predicate = (account) => account.token === teamToken;
    console.log({ teamToken, id, name }, connectionState.notConnectedAccounts);
    //Find unConnected account with teamToken
    const teamIndex = connectionState.notConnectedAccounts.findIndex(predicate);
    //throw if teamIndex is less than 0
    if (teamIndex < 0) {
      console.log({ teamToken, connectionState });
      throw new Error("Could not find team with token");
    }
    const team = {
      name,
      id,
    };
    setConnectionState((state) => {
      return {
        ...state,
        connectedAccounts: [...state.connectedAccounts, team],
        //remove teamIndex from notConnectedAccounts
        notConnectedAccounts: state.notConnectedAccounts.filter(predicate),
      };
    });
  };
  const exchangeToken = useMemo(() => {
    if (
      window.tlVendor &&
      window.tlVendor.connect &&
      window.tlVendor.connect.exchangeToken
    ) {
      return window.tlVendor.connect.exchangeToken;
    }
    return false;
  }, [window.tlVendor]);
  if (!exchangeToken) {
    //return <div>No exchange token</div>;
  }
  return (
    <SettingsPageLayout title={title} subTitle={"Connect With Trusted Login"}>
      {connectionState.connected ? (
        <>
          <div>
            <h2>Connected Accounts</h2>
            {connectionState.connectedAccounts.length ? (
              <ul>
                {connectionState.connectedAccounts.map((account) => (
                  <li key={account.id}>
                    <p>{account.name}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Accounts Connected</p>
            )}
          </div>
          <div>
            <h2>Possible Accounts</h2>
            {errors ? <p>Error: {errors}</p> : null}
            {connectionState.notConnectedAccounts.length ? (
              <ul>
                {connectionState.notConnectedAccounts.map(({ token, name }) => (
                  <li key={token}>
                    <ConnectTeam
                      name={name}
                      teamToken={token}
                      exchangeToken={exchangeToken}
                      setErrors={setErrors}
                      onTeamConnected={onTeamConnected}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No unconnected accounts</p>
            )}
          </div>
          <Login loginUrl={loginUrl} />
        </>
      ) : (
        <Login loginUrl={loginUrl} />
      )}
    </SettingsPageLayout>
  );
}
