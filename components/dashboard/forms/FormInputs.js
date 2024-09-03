import { Switch } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const Input = ({ label, type, value, setValue, keyName }) => {
    return (
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
        <div className="mt-2">
          <input
            type={type}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={value[keyName] ? value[keyName] : ""}
            onChange={(e) => {
              setValue({ ...value, [`${keyName}`]: e.target.value });
            }}
          />
        </div>
      </div>
    );
  };
  
  export const Ueberschrift = ({ label }) => {
    return (
      <div className="col-span-1 md:col-span-3 text-xs leading-6 sm:order-none sm:w-auto sm:leading-7 text-indigo-600 font-bold">
        {label}
      </div>
    );
  };
  
  export const Toggle = ({label, enabled, setEnabled }) => {
    return (
      <div>
         <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label && label}
        </label>
        <Switch
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
          className={classNames(
            enabled ? "bg-indigo-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          )}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={classNames(
              enabled ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            )}
          />
        </Switch>
      </div>
    );
  };
  
  export const Dropdown = ({
    label,
    options,
    setState,
    state,
    keyName,
    value,
  }) => {
    return (
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>
        <select
          id="location"
          name="location"
          value={state[keyName]}
          onChange={(e) => setState({ ...state, [`${keyName}`]: e.target.value })}
          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {options && options.map((el, i) => <option key={i}>{el}</option>)}
        </select>
      </div>
    );
  };