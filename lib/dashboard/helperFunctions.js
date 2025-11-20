const inputClass = (isActive) =>
  `mt-1 rounded-md border py-1.5 shadow-sm 
     ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm 
     ${
       isActive
         ? "text-gray-900 placeholder:text-gray-400 bg-white"
         : "text-gray-500 placeholder:text-gray-500 bg-gray-100 cursor-not-allowed"
     }`;

export { inputClass };
