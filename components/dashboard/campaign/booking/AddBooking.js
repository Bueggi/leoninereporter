import adFormatNames from "@lib/dashboard/AdFormatNames";
import { useRef } from "react";
import { toast } from "react-toastify";

export default function AddBooking({ campaignID, state, setState, setOpen }) {
  const dispoRef = useRef();
  const startRef = useRef();
  const endRef = useRef();
  const reachRef = useRef();
  const productRef = useRef();
  const rotationRef = useRef();
  const tkpRef = useRef();
  const targetingRef = useRef();
  const outputRef = useRef();

  const handleAddBookingClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/bookings/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: startRef.current.value,
            end: endRef.current.value,
            reach: reachRef.current.value,
            product: productRef.current.value,
            tkp: tkpRef.current.value,
            rotation: rotationRef.current.value,
            targeting: targetingRef.current.value,
            dispo: dispoRef.current.value,
            output: outputRef.current.value,
            campaignID,
          }),
        }
      );
      if (!res.ok) return toast.error("Etwas hat nicht funktioniert");

      const { data, message } = await res.json();

      setState({
        ...state,
        bookings: [...state.bookings, data],
      });

      toast.success("Die Buchung wurde erfolgreich angelegt");
      setOpen(false);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleAddBookingClick}>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="col-span-1 md:col-span-3 text-xs leading-6 sm:order-none sm:w-auto sm:leading-7 text-indigo-600 font-bold">
            Rahmeninformationen
          </div>
          <div className="mt-2">
            <label
              htmlFor="dispo"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Dispo
            </label>
            <input
              type="text"
              name="dispo"
              ref={dispoRef}
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-3 text-xs leading-6 sm:order-none sm:w-auto sm:leading-7 text-indigo-600 font-bold mt-4">
            Laufzeit
          </div>
          <div className="mt-2">
            <label
              htmlFor="start"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Start
            </label>
            <input
              type="date"
              name="start"
              ref={startRef}
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="ende"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Ende
            </label>
            <input
              required
              type="date"
              name="ende"
              ref={endRef}
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="col-span-1 md:col-span-3 text-xs leading-6 sm:order-none sm:w-auto sm:leading-7 text-indigo-600 font-bold mt-4">
            Finanzielles
          </div>
          <div className="mt-2">
            <label
              htmlFor="impressions"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Impressions
            </label>
            <input
              required
              type="number"
              name="impressions"
              ref={reachRef}
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="tkp"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              TKP
            </label>
            <input
              required
              type="number"
              step="0.1"
              ref={tkpRef}
              name="tkp"
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="product"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Product
            </label>
            <select
              name="product"
              ref={productRef}
              className=" block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {adFormatNames.map((el) => {
                return <option value={el.name}>{el.displayName}</option>;
              })}
            </select>
          </div>
          <div className="col-span-1 md:col-span-3 text-xs leading-6 sm:order-none sm:w-auto sm:leading-7 text-indigo-600 font-bold mt-4">
            Targetinginformationen
          </div>
          <div className="mt-2">
            <label
              htmlFor="rotation"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Rotation
            </label>
            <input
              required
              type="text"
              name="rotation"
              ref={rotationRef}
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="mt-2">
            <label
              htmlFor="dispo"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Targeting
            </label>
            <input
              type="text"
              name="targeting"
              ref={targetingRef}
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="output"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Ausspielung
            </label>
            <input
              type="text"
              name="output"
              ref={outputRef}
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-12 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
