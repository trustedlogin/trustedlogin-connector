import React from "react";
import { Dialog } from "@headlessui/react";
import { __ } from "@wordpress/i18n";
/**
 * Modal
 *
 * @see https://headlessui.dev/react/dialog
 */
export default function Modal({
  isOpen,
  setIsOpen,
  children,
  title,
  description,
  infoLink,
  infoLinkText,
  goLink,
  goLinkText,
  Logo,
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed z-10 inset-0 overflow-y-auto tl-modal">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded max-w-sm mx-auto">
          <Dialog.Title className={"sr-only"}>{title}</Dialog.Title>
          <>
            <div className="inline-block align-middle bg-white rounded-lg p-8 text-left overflow-hidden shadow-xl transform transition-all">
              <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="bg-white rounded-lg text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500">
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="flex flex-col">
                <div className="flex mx-auto border h-20 w-20 items-center justify-center rounded-lg">
                  <Logo />
                </div>
                <div className="max-w-sm mx-auto mt-2 mb-8 justify-center text-center">
                  <h2 className="mt-4 text-2xl text-gray-900">{title}</h2>
                  <p className="mt-2 mb-4 text-sm text-gray-500">
                    {description}
                  </p>
                  <a className="text-blue-tl text-sm" href={infoLink}>
                    {infoLinkText}
                  </a>
                </div>
              </div>

              {children}
              <div className="mt-6 flex sm:mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="mt-3 mr-4 w-2/5 inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2.5 bg-white text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  data-form-type="other">
                  {__("Close", "tl")}
                </button>
                <a
                  href={goLink}
                  type="button"
                  className="w-3/5 inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2.5 bg-blue-tl text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500 sm:col-start-2 sm:text-sm"
                  data-form-type="action,search">
                  {goLinkText}
                  <svg
                    className="ml-3"
                    width="11"
                    height="10"
                    viewBox="0 0 11 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.37528 9.12479L9.62486 0.87521M9.62486 0.87521H1.37528M9.62486 0.87521V9.12479"
                      stroke="white"
                      strokeWidth="1.67"
                      strokeLinecap="round"
                      strokeLinejoin="round"></path>
                  </svg>
                </a>
              </div>
            </div>
          </>
        </div>
      </div>
    </Dialog>
  );
}
