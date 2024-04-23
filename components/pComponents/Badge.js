export default function Badge({color, label}) {
    if (!color) {
        color = 'red'
    }

    const colorString = 'bg-'+color+'-500'
    const textColorString = 'text-'+color+'-900'
  return (
    <>
    
      <span className={`inline-flex items-center gap-x-1.5 rounded-full  px-2 py-1 text-xs font-medium ${textColorString} ${colorString}`}>
        <svg
          className={`h-1.5 w-1.5 fill-${color}-500`}
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <circle cx={3} cy={3} r={3} />
        </svg>
        {label}
      </span>
    </>
  );
}
