/**
 * This is the entry point for the admin page
 */

import React from "react";
import { render } from "@wordpress/element";
import App from "./App";
import api from "../api";
import {
  hasOnboarded,
  initialTeams,
  initialIntegrationSettings,
  session,
} from "./setupVars";

/**
 * Removes all DOM nodes in array of nodes
 */
const removeAllNodes = (nodes) => {
  if (nodes && nodes.length) {
    nodes.forEach((node) => node.remove());
  }
};

window.addEventListener("load", function () {
  //remove notices
  removeAllNodes(document.getElementsByClassName("notice"));
  //Remove all WooCommerce messages
  removeAllNodes(document.getElementsByClassName("woocommerce-message"));
  render(
    <App
      {...{
        ...api,
        hasOnboarded,
        initialTeams,
        initialIntegrationSettings,
        session,
      }}
    />,
    document.getElementById("trustedlogin-settings")
  );
});
