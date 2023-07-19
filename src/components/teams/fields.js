import React from "react";

export const SelectFieldArea = ({ id, label, children, htmlFor }) => (
  <div className="">
    <label
      htmlFor={htmlFor ? htmlFor : id}
      className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-2">{children}</div>
  </div>
);

export const InputFieldArea = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-2 relative rounded-lg">{children}</div>
  </div>
);

export const InputField = ({ id, name, label, type = "text", value = "", onChange, required = false, }) => {
    return (
        <InputFieldArea name={name} id={id} label={label}>
            <input
                type={type}
                name={name}
                id={id}
                required={required}
                value={value}
                onChange={onChange}
                className="block w-full pl-4 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500"
            />
        </InputFieldArea>
    );
};

export const SelectField = ({ id, name, label, children, value, onChange }) => {
    return (
        <SelectFieldArea label={label} id={id}>
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                className="bg-white block w-full pl-3 pr-8 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500">
                {children}
            </select>
        </SelectFieldArea>
    );
};
