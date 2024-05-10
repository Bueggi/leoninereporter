import { forwardRef } from "react";

const RefNumberInput = forwardRef((props, ref) => {
  const {title, sign, placeholder, required} = props
  return (
    <>
      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        {title}
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="relative mt-2 rounded-md shadow-sm">
          {sign && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">{sign}</span>
            </div>
          )}
          <input
            type="number"
            name="price"
            id="price"
            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder={placeholder}
            aria-describedby="price-currency"
            required = {required}
            ref={ref}
          />
        </div>
      </div>
    </>
  );
})

RefNumberInput.displayName = "RefNumberInput";

export default RefNumberInput;
