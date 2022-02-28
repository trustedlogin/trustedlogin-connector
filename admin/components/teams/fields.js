import React from "react";

export const SelectFieldArea = ({ id, label, children }) => (
  <div className="">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-2">{children}</div>
  </div>
);
export const InputField = ({
  id,
  name,
  label,
  type = "text",
  defaultValue = null,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-2 relative rounded-lg">
        <input
          type={type}
          name={name}
          id={id}
          defaultValue={defaultValue}
          className="block w-full pl-4 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500"
        />
      </div>
    </div>
  );
};

export const SelectField = ({ id, name, label, children }) => {
  return (
    <SelectFieldArea label={label} id={id}>
      <select
        id={id}
        name={name}
        className="bg-white block w-full pl-3 pr-8 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500">
        {children}
      </select>
    </SelectFieldArea>
  );
};