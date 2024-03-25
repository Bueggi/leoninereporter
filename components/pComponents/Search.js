import { CheckCircleIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";

export default function Searchbar({setLoading, model, setAllResults }) {
    return (
      <div>
        <label htmlFor="search" className="block text-sm font-medium leading-6 text-gray-900">
          Suche
        </label>
        <div className="relative mt-2 flex items-center">
          <input
            type="text"
            name="search"
            id="search"
            className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <button
        type="button"
        className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >

        Suchen
      </button>
          </div>
        </div>
      </div>
    )
  }