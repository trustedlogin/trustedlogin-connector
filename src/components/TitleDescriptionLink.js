import React from "react";
import { __ } from "@wordpress/i18n";
const TitleDescriptionLink = ({
  title,
  description = "",
  link = "https://app.trustedlogin.com/settings",
  linkText = __("Where can I find this info?", "trustedloging-vendor"),
}) => (
  <div className="max-w-sm mx-auto mb-8 justify-center text-center">
    <h2 className="mt-4 text-2xl text-gray-900">{title}</h2>
    <p className="mt-2 mb-4 text-sm text-gray-500">{description}</p>
    <a className="text-blue-tl text-sm" href={link} target="_blank">
      {linkText}
    </a>
  </div>
);
export default TitleDescriptionLink;
