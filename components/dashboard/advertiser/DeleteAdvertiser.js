import { toast } from "react-toastify";

const DeleteAdvertiser = ({
  id,
  setOpen,
  allAdvertisers,
  setAllAdvertisers,
}) => {
  const handleClick = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/${id}/delete`,
        {
          method: "DELETE",
        }
      );
      const { data, message } = await res.json();

      if (!res.ok) return toast.error(message);
      const filteredAdvertisers = allAdvertisers.data.filter(
        (el) => el.id !== id
      );

      setAllAdvertisers({ data: filteredAdvertisers, mode: "page" });
      toast.success("Der Eintrag wurde erfolgreich gelöscht");
      return setOpen(false);
    } catch (error) {
      toast.error(error);
    }
  };
  return (
    <>
      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Advertiser Löschen
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Diese Aktion kann nicht mehr rückgängig gemacht werden. Willst du
            den Advertiser mit der ID {id} wirklich löschen?
          </p>
        </div>
      </div>

      <div className="mt-5 sm:ml-4 sm:mt-4 sm:flex ">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
          onClick={handleClick}
        >
          Ja, bitte löschen
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </button>
      </div>
    </>
  );
};

export default DeleteAdvertiser;
