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

export const StateTextInput = ({
  title,
  required,
  placeholder,
  value,
  index,
  state,
  setState,
}) => {
  console.log('came here')
  return (
    <>
      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        {index < 1 ? title : ""}
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
            value={value}
            onChange={(e) => {
              // Erstelle eine Kopie des aktuellen States
              const newState = [...state];

              // Ersetze den alten Wert mit dem neuen Wert an der gegebenen Indexposition
              newState[index] = e.target.value;

              // Setze den State mit der neuen Kopie
              setState(newState);
            }}
          />
        </div>
      </div>
    </>
  );
};

export const StateObjectInput = ({
  title,
  required,
  placeholder,
  value,
  index,
  field,
  state,
  setState,
}) => {

  return (
    <>
      <label
        htmlFor={`${field}-${index}`}
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        {index === 0 ? title : ""}
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">

        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            required={required}
            placeholder={placeholder}
            name={`${field}-${index}`}
            id={`${field}-${index}`}
            autoComplete={`${field}-${index}`}
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            value={value[field]}
            onChange={(e) => {
              console.log(state);
              const newState = [...state];
              newState[index] = {
                ...newState[index],
                [field]: e.target.value,
              };
              setState(newState);
            }}
          />
        </div>
      </div>
    </>
  );
};

StateTextInput.displayName = "StateTextInput";
