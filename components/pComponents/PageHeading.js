const PageHeading = ({title, subtitle}) => {
  return (
    <div className="sm:flex-auto">
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        {subtitle}
      </p>
    </div>
  );
};

export default PageHeading