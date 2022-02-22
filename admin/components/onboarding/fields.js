export const Label = ({ id, children }) => (
  <label for={id} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
);

export const SelectField = ({ id, label, children }) => {
  return (
    <div>
      <Label id={id}>{label}</Label>
      <div className="mt-2">
        <select
          id={id}
          name={id}
          className="bg-white block w-full pl-3 pr-8 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500">
          {children}
        </select>
      </div>
    </div>
  );
};

export const InputField = ({ id, label, defaultValue = "", type = "text" }) => (
  <div>
    <Label id={id}>{label}</Label>
    <div className="mt-2 relative rounded-lg">
      <input
        defaultValue={defaultValue}
        type={type}
        name={id}
        id={id}
        className="block w-full pl-3 pr-10 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 ring-offset-2 focus:ring-sky-500"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.06004 6.00004C6.21678 5.55449 6.52614 5.17878 6.93334 4.93946C7.34055 4.70015 7.8193 4.61267 8.28483 4.69252C8.75035 4.77236 9.17259 5.01439 9.47676 5.37573C9.78093 5.73706 9.94741 6.19439 9.94671 6.66671C9.94671 8.00004 7.94671 8.66671 7.94671 8.66671M8.00004 11.3334H8.00671M14.6667 8.00004C14.6667 11.6819 11.6819 14.6667 8.00004 14.6667C4.31814 14.6667 1.33337 11.6819 1.33337 8.00004C1.33337 4.31814 4.31814 1.33337 8.00004 1.33337C11.6819 1.33337 14.6667 4.31814 14.6667 8.00004Z"
            stroke="#98A2B3"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
);
