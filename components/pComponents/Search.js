"use client";

import { useRef } from "react";
import { toast } from "react-toastify";

export default function Searchbar({ setLoading, model, setAllResults }) {
  const searchstring = useRef();
  const handleClick = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      console.log('MODEL KOMMT AN', model)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/${model}/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchstring: searchstring.current.value }),
        }
      );
      const { data, message } = await res.json();
      console.log('RESULT IN SEARCH', data, message)
      if (data) {
        setLoading(false);
        return setAllResults({ data, mode: "search" });
      } else {
        setAllResults([]);
        toast.error(message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      return toast.error(error);
    }
  };
  return (
    <div>
      <label
        htmlFor="search"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Suche
      </label>
      <div className="relative mt-2 flex items-center">
        <input
          type="text"
          name="search"
          id="search"
          ref={searchstring}
          className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <button
            onClick={handleClick}
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Suchen
          </button>
        </div>
      </div>
    </div>
  );
}
