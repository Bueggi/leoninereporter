import { forwardRef } from "react";

const RefTextInput = forwardRef((props, ref) => {
  const { title, required, placeholder } = props;
  return (
    <>
      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        {title}
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            required={required}
            placeholder={placeholder}
            name="advertisername"
            id="advertisername"
            autoComplete="advertisername"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            ref={ref}
          />
        </div>
      </div>
    </>
  );
});
RefTextInput.displayName = "RefTextInput";
export default RefTextInput;
