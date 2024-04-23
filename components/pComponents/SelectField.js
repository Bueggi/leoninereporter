/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export default function SelectField({ options, formRef }) {
  return (
    <div>
      <select
        id="location"
        name="location"
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        ref={formRef}
        defaultValue="Bitte wählen"
        required
      >
        <option value="" disabled selected hidden>Bitte wählen</option>
        {options.map((el, i) => {
          return <option key={i}>{el.name}</option>;
        })}
      </select>
    </div>
  );
}
