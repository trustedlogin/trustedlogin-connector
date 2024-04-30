import { useRef } from "react";
import { __ } from "@wordpress/i18n";
const TitleDescriptionLink = ({
  title,
  description = "",
  link = "",
  linkText = "",
}) => (
  <div className="max-w-sm mx-auto mb-8 justify-center text-center">
    <h2 className="mt-4 text-2xl text-gray-900">{title}</h2>
    <p className="mt-2 mb-4 text-sm text-gray-500">{description}</p>
    {link && linkText && linkText.length && link.length ? (
      <a className="text-blue-tl text-sm" href={link} target="_blank">
        {linkText}
        <span className="screen-reader-text">
          {__("(Link opens in a new window)", "trustedlogin-connector")}
        </span>
      </a>
    ) : (
      ""
    )}
  </div>
);
export default TitleDescriptionLink;
