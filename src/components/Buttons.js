export const Button = ({ children, onClick, className, type }) => (
  <button onClick={onClick} type={type} className={className}>
    {children}
  </button>
);

const CLASSES = {
  secondary:
    "bg-white py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500",
  primary:
    "ml-3 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-tl hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-sky-500",
};
export const PrimaryButton = ({ children, onClick }) => (
  <Button onClick={onClick} type="submit" className={CLASSES.primary}>
    {children}
  </Button>
);
export const PrimaryButtonLookingLink = ({ children, href }) => (
  <a href={href} target="__blank" className={CLASSES.primary}>
    {children}
  </a>
);
export const SecondaryButton = ({ children, onClick }) => (
  <Button onClick={onClick} type="submit" className={CLASSES.secondary}>
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
