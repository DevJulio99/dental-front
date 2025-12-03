const CustomCheckbox = ({ id, checked, onChange, label, disabled, className, ...rest }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`w-5 h-5 text-blue-check bg-gray-100 border-gray-300 rounded-md focus:ring-transparent ${className || ''}`}
        {...rest}
      />
      {label && (
        <label htmlFor={id} className="ml-3 font-medium text-gray-800 cursor-pointer capitalize">
          {label}
        </label>
      )}
    </div>
  );
};

export default CustomCheckbox;
