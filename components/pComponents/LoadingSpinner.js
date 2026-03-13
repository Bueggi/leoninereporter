const LoadingSpinner = ({ text = "Lade Daten..." }) => {
  return (
    <div className="min-w-full flex flex-col items-center justify-center py-20 pb-32">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/30 animate-pulse"></div>
        
        {/* Spinner rings */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
      
      {/* Loading Text */}
      <p className="mt-6 text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default LoadingSpinner;