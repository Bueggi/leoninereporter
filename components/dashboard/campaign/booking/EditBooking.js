import { useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";

export default function EditBooking({
  initialBooking,
  state,
  setState,
  setOpen,
}) {
  const [booking, setBooking] = useState({
    ...initialBooking,
    start: moment(initialBooking.start).format("YYYY-MM-DD"),
    end: moment(initialBooking.end).format("YYYY-MM-DD"),
    reach: initialBooking.reach,
  });

  const handleEditBookingClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/bookings/${initialBooking.id}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ booking }),
        }
      );
      const { data, message } = await res.json();
      if (!res.ok) return toast.error(message);

      const filteredBookings = state.bookings.map((el) => {
        if (el.id == initialBooking.id) {
          return data;
        } else return el;
      });

      setState({
        ...state,
        bookings: filteredBookings,
      });

      toast.success("Die Buchung wurde erfolgreich bearbeitet");
      setOpen(false);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleEditBookingClick}>
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
              value={booking.dispo}
              onChange={(e) =>
                setBooking({ ...booking, dispo: e.target.value })
              }
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
              value={booking.start}
              onChange={(e) =>
                setBooking({ ...booking, start: e.target.value })
              }
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
              value={booking.end}
              onChange={(e) => setBooking({ ...booking, end: e.target.value })}
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
              value={booking.reach}
              onChange={(e) =>
                setBooking({ ...booking, reach: e.target.value })
              }
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
              value={booking.tkp}
              onChange={(e) => setBooking({ ...booking, tkp: e.target.value })}
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
              value={booking.product}
              onChange={(e) =>
                setBooking({ ...booking, product: e.target.value })
              }
              className=" block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="NONSKIPPABLE">Nonskippable Short Ad (20&apos;)</option>
              <option value="SKIPPABLE">Skippable Ad</option>
              <option value="BUMPER">Bumper Ad (6&apos;)</option>
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
              value={booking.rotation}
              onChange={(e) =>
                setBooking({ ...booking, rotation: e.target.value })
              }
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
              value={booking.targeting}
              onChange={(e) =>
                setBooking({ ...booking, targeting: e.target.value })
              }
              className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="dispo"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Ausspielung
            </label>
            <input
              type="text"
              name="output"
              value={booking.output}
              onChange={(e) =>
                setBooking({ ...booking, output: e.target.value })
              }
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
