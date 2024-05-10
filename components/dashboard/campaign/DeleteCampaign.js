import { toast } from "react-toastify";

const DeleteAdvertiser = ({ id, setOpen, allCampaigns, setAllCampaigns }) => {
  const handleClick = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/campaign/${id}/delete`,
        {
          method: "DELETE",
        }
      );
      const { data, message } = await res.json();

      if (!res.ok) return toast.error(message);
      else toast.success("Der Eintrag wurde erfolgreich gelöscht");

      const filteredCampaigns = allCampaigns.data.filter((el) => el.id !== id);

      setAllCampaigns({ mode: allCampaigns.mode, data: filteredCampaigns });
      return setOpen(false);
    } catch (error) {
      return toast.error(error);
    }
  };
  return (
    <>
      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Kampagne Löschen
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Diese Aktion kann nicht mehr rückgängig gemacht werden. Willst du
            den Kampagne mit der ID {id} wirklich löschen?
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
