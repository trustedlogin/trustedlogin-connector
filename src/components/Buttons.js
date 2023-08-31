export const Button = ({ children, onClick, className, type }) => (
  <button onClick={onClick} type={type} className={className}>
    {children}
  </button>
);

export const PrimaryButton = ({ children, onClick }) => (
  <Button
    onClick={onClick}
    type="submit"
    className="ml-3 inline-flex leading-6 justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-tl hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500">
    {children}
  </Button>
);
export const SecondaryButton = ({ children, onClick }) => (
  <Button
    onClick={onClick}
    type="submit"
    className="bg-white leading-6 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500">
    {children}
  </Button>
);

export const SubmitAndCanelButtons = ({
  onSubmit,
  onCancel,
  submitText,
  cancelText = "Cancel",
}) => (
  <div className="pt-8 mt-4 border-t">
    <div className="flex justify-end">
      <SecondaryButton onClick={onCancel}>{cancelText}</SecondaryButton>
      <PrimaryButton onClick={onSubmit}>{submitText}</PrimaryButton>
    </div>
  </div>
);
