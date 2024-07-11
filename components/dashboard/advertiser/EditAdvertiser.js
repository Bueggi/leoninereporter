import { Input, Ueberschrift } from "@components/dashboard/forms/FormInputs";
import { useState } from "react";
import { toast } from "react-toastify";

const EditAdvertiser = ({ setOpen, state, setState }) => {
  const [formState, setFormState] = useState(state);

  const resetDefaults = () => {
    setFormState(state);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/${state.id}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formState,
          }),
        }
      );
      const { data, message } = await res.json();
      if (message) return toast.error(message);
      setState(data);
      toast.success("Der Advertiser wurde erfolgreich bearbeitet");
      return setOpen(false);
    } catch (error) {
      toast.error(error);
      return setOpen(false);
    }
  };
  return (
    <>
      <form
        className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6"
        onSubmit={handleClick}
      >
        <Input
          label={"Name"}
          type={"text"}
          value={formState}
          setValue={setFormState}
          keyName={"name"}
        />

        <div className="col-span-3 flex gap-4">
          <button
            type="submit"
            className="mt-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Abschicken
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="mt-8 rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Zurücksetzen
          </button>
        </div>
      </form>
    </>
  );
};

export default EditAdvertiser;
