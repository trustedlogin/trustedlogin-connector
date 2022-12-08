import React, { useState } from "react";

const CONNECTIION_SETTINGS = {
  loginUrl: "https://tlmockapi.local/mock-server/login",
};
const NotConnected = ({ loginUrl }) => {
  return (
    <div>
      <h2>Login</h2>
      <a target={"_blank"} rel={"noopener noreferrer"} href={loginUrl}>
        Connect
      </a>
    </div>
  );
};
//List of connected accounts
const ConnectedAccounts = ({ connectedAccounts, title }) => {
  return (
    <div>
      <h2>{title}</h2>
      {connectedAccounts.length && (
        <ul>
          {connectedAccounts.map((account) => (
            <li key={account.id}>
              <p>{account.name}</p>
              <a href="#">"Disconnect</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
//List of possible accounts
const PossibleAccounts = ({ possibleAccounts }) => {
  return (
    <div>
      <h2>Possible Accounts</h2>

      {possibleAccounts.length && (
        <ul>
          {possibleAccounts.map((account) => (
            <li key={account.id}>
              <p>{account.name}</p>
              <a href="#">"Connect</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default function Connector({
  title = "Connect",
  loginUrl = CONNECTIION_SETTINGS.loginUrl,
  connected = false,
  connectedAccounts = [],
  notConnectedAccounts = [],
}) {
  const [connectionState, setConnectionState] = useState({
    connected,
    connectedAccounts,
    notConnectedAccounts,
  });
  return (
    <div>
      <h1>{title}</h1>
      {connectionState.connected ? (
        <>
          <ConnectedAccounts
            connectedAccounts={connectionState.connectedAccounts}
          />
          <PossibleAccounts
            possibleAccounts={connectionState.notConnectedAccounts}
          />
        </>
      ) : (
        <NotConnected loginUrl={loginUrl} />
      )}
    </div>
  );
}
