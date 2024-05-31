const FormSubHeading = ({ children }) => {
  // for type safety only allow strings
  return (
    <div className="col-span-1 md:col-span-3 text-xs leading-6 sm:order-none sm:w-auto sm:leading-7 text-indigo-600 font-bold">
      {children}
    </div>
  );
};

export default FormSubHeading;
