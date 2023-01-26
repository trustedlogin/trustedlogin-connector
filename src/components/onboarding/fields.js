export const Label = ({ id, children }) => (
  <label htmlFor={id} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
);

export const OnboardingSelectFieldArea = ({ id, label, children }) => {
  return (
    <div>
      <Label id={id}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export const SelectField = ({ id, label, children }) => {
  return (
    <OnboardingSelectFieldArea id={id} label={label}>
      <select
        id={id}
        name={id}
        className="bg-white block w-full pl-3 pr-8 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500">
        {children}
      </select>
    </OnboardingSelectFieldArea>
  );
};

export const InputField = ({
  id,
  label,
  defaultValue = "",
  type = "text",
  required = false,
}) => (
  <div>
    <Label id={id}>{label}</Label>
    <div className="mt-2 relative rounded-lg">
      <input
        defaultValue={defaultValue}
        type={type}
        name={id}
        id={id}
        required={required}
        className="block w-full pl-3 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500"
      />
    </div>
  </div>
);
