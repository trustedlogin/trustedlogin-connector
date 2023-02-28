import { useMemo } from "react";
import { Button } from "./Buttons";

export const DangerButton = ({
  onClick,
  id,
  children,
  isExpanded,
  hasPopup,
}) => {
  return (
    <Button
      onClick={onClick}
      className="bg-white border border-red-700 rounded-lg px-4 py-2 inline-flex items-center justify-center text-sm font-medium text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-red-700"
      id={id}
      isExpanded={isExpanded}
      hasPopup={hasPopup}>
      {children}
    </Button>
  );
};

DangerButton.defaultProps = {
  isExpanded: false,
  hasPopup: true,
};
export const ToggleSwitch = ({
  isEnabled,
  onClick,
  labeledBy,
  describedBy,
  isLoading = false,
}) => {
  const buttonClasses = useMemo(() => {
    let classes =
      "ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500";
    if (isEnabled) {
      classes = `bg-teal-500 ${classes}`;
    } else {
      classes = `bg-gray-200 ${classes}`;
    }
    if (isLoading) {
      classes = `animate-pulse ${classes}`;
    }
    return classes;
  }, [isEnabled, isLoading]);

  const spanClasses = useMemo(() => {
    let classes =
      "inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200";
    if (isEnabled) {
      classes = `translate-x-5 ${classes}`;
    } else {
      classes = `translate-x-0 ${classes}`;
    }
    return classes;
  }, [isEnabled]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      type="button"
      className={buttonClasses}
      role="switch"
      aria-checked={isEnabled}
      aria-labelledby={labeledBy}
      aria-describedby={describedBy}>
      <span aria-hidden="true" className={spanClasses}></span>
    </button>
  );
};
