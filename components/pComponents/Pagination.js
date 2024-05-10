import Link from "next/link";

export default function Pagination({ count, activePage, setActivePage }) {
  const pages = Array(
    Math.ceil(count / process.env.NEXT_PUBLIC_MAX_RESULTS)
  ).fill(0);
  return (
    <div className="flex items-center justify-center border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between justify-center">
        <div>
          <nav
            className="isolate  items-center justify-center inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {pages.map((el, i) => {
              if (activePage !== i + 1) {
                return (
                  <button
                    onClick={() => setActivePage(i + 1)}
                    type="button"
                    key={i}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    {i + 1}
                  </button>
                );
              } else {
                return (
                  <span
                    key={i}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {i + 1}
                  </span>
                );
              }
            })}

            {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
          </nav>
        </div>
      </div>
    </div>
  );
}
