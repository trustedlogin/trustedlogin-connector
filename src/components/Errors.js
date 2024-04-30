import React, { useState } from "react";
import { __, _x } from "@wordpress/i18n";

export const ToastError = ({
  heading,
  text,
  retryClick,
  learnMoreLink,
  isDismissible = false,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  if (isDismissed) {
    return null;
  }
  return (
    <div className="tl-error max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect
                x="3"
                y="3"
                width="40"
                height="40"
                rx="20"
                fill="#FEE4E2"></rect>
              <path
                d="M23.0003 19.6666V23M23.0003 26.3333H23.0087M31.3337 23C31.3337 27.6023 27.6027 31.3333 23.0003 31.3333C18.398 31.3333 14.667 27.6023 14.667 23C14.667 18.3976 18.398 14.6666 23.0003 14.6666C27.6027 14.6666 31.3337 18.3976 31.3337 23Z"
                stroke="#D92D20"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"></path>
              <rect
                x="3"
                y="3"
                width="40"
                height="40"
                rx="20"
                stroke="#FEF3F2"
                strokeWidth="6"></rect>
            </svg>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{heading}</p>
            {text ? <p className="mt-1 text-sm text-gray-500">{text}</p> : null}
            {learnMoreLink || retryClick ? (
              <div className="mt-3 flex space-x-5">
                {learnMoreLink ? (
                  <a
                    href={learnMoreLink}
                    className="bg-white rounded-md text-sm font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {__("Learn more", "trustedlogin-connector")}
                  </a>
                ) : null}
                {retryClick ? (
                  <button
                    onClick={retryClick}
                    className="tl-error-retry bg-white rounded-md text-sm font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {__("Try again", "trustedlogin-connector")}
                    <span aria-hidden="true">→</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          {isDismissible ? (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => setIsDismissed(true)}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">
                  {__("Close", "trustedlogin-connector")}
                </span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
//Error that takes up the whole screen
//Use below TopBar
export const PageError = ({ onClick, text }) => {
  return (
    <div className="tl-error flex flex-col justify-center text-center w-full max-w-lg mx-auto p-8 bg-white rounded-lg shadow sm:p-14">
      <svg
        className="mx-auto text-red-700"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect
          x="4"
          y="4"
          width="48"
          height="48"
          rx="24"
          fill="currentColor"></rect>
        <path
          d="M28 24.4V28M28 31.6H28.009M37 28C37 32.9706 32.9706 37 28 37C23.0294 37 19 32.9706 19 28C19 23.0294 23.0294 19 28 19C32.9706 19 37 23.0294 37 28Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"></path>
        <rect
          x="4"
          y="4"
          width="48"
          height="48"
          rx="24"
          stroke="#FEE4E2"
          strokeWidth="8"></rect>
      </svg>
      <h2 className="mt-4 text-2xl text-gray-900">
        {__("Uh oh!", "trustedlogin-connector")}
        <br />
        {__("Something went wrong.", "trustedlogin-connector")}
      </h2>
      {text ? <p className="mt-2 mb-8 text-sm text-gray-500">{text}</p> : null}
      <button
        onClick={onClick}
        className="tl-error-retry inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-lg text-white bg-red-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:text-sm">
        {__("Try again", "trustedlogin-connector")}
      </button>
    </div>
  );
};

//Error that goes at top of settings, under TopBar
export const ScreenError = ({
  heading,
  text,
  retryClick,
  learnMoreLink,
  isDismissible = false,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  if (isDismissed) {
    return null;
  }
  return (
    <div className="tl-error rounded-md bg-red-50 p-4 border border-red-300">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="text-red-700"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.0003 6.66663V9.99996M10.0003 13.3333H10.0087M18.3337 9.99996C18.3337 14.6023 14.6027 18.3333 10.0003 18.3333C5.39795 18.3333 1.66699 14.6023 1.66699 9.99996C1.66699 5.39759 5.39795 1.66663 10.0003 1.66663C14.6027 1.66663 18.3337 5.39759 18.3337 9.99996Z"
              stroke="currentColor"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"></path>
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="tl-error-heading text-sm font-medium text-red-700">
            {heading}
          </h3>
          {text ? (
            <div className="mt-2 text-sm text-red-500">
              <p className="tl-error-text">{text}</p>
            </div>
          ) : null}
          {retryClick || learnMoreLink ? (
            <div className="mt-4">
              <div className="-my-1.5 flex">
                {learnMoreLink ? (
                  <a
                    href={learnMoreLink}
                    className="py-1.5 rounded-md text-sm font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-red-600">
                    {__("Learn more", "trustedlogin-connector")}
                  </a>
                ) : null}
                {retryClick ? (
                  <button
                    onClick={retryClick}
                    className="tl-error-retry ml-3 py-1.5 rounded-md text-sm font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-red-600">
                    {__("Try again", "trustedlogin-connector")}
                    <span aria-hidden="true">→</span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        {isDismissible ? (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => setIsDismissed(true)}
                type="button"
                className="inline-flex rounded-md p-1.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-red-600">
                <span className="sr-only">
                  {__("Dismiss", "trustedlogin-connector")}
                </span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
