import moment from "moment";
import { toast } from "react-toastify";
import EditBooking from "@components/dashboard/campaign/booking/EditBooking";
import Modal from "@components/pComponents/Modal";
import { useState } from "react";

export default function TableView({ data, keys, state, setState }) {
  const [editBookingModalOpen, setEditBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState();
  const handleDeleteClick = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/bookings/${id}/delete`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) return toast.error("Etwas hat nicht funktioniert");

      const { data, message } = await res.json();

      const filteredBookings = state.bookings.filter(
        (booking) => booking.id !== id
      );

      setState({
        ...state,
        bookings: filteredBookings,
      });

      toast.success("Die Buchung wurde erfolgreich gelöscht");
    } catch (error) {
      toast.error(error);
    }
  };


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {editBookingModalOpen && (
        <Modal open={editBookingModalOpen} setOpen={setEditBookingModalOpen}>
          <EditBooking
            initialBooking={selectedBooking}
            setOpen={setEditBookingModalOpen}
            state={state}
            setState={setState}
          />
        </Modal>
      )}
      <div className="sm:flex sm:items-center"></div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {keys.map((key, i) => {
                    if (i === 0) {
                      return (
                        <th key={i}
                          scope="col"
                          className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          {key}
                        </th>
                      );
                    }
                    return (
                      <th key={i}
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        {key}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                      {entry.dispo}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                      {moment(entry.start).format("L")}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                      {moment(entry.end).format("L")}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                      {new Intl.NumberFormat("de-DE").format(entry.reach)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(entry.tkp)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                      {entry.product}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                      {entry.rotation}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                      {entry.targeting}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                      {entry.output}
                    </td>
                    <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <a
                        onClick={() => {
                          setEditBookingModalOpen(true);
                          setSelectedBooking(entry);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </a>
                    </td>
                    <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <a
                        onClick={() => {
                          handleDeleteClick(entry.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Löschen
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
