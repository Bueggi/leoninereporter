import { Input, Ueberschrift } from "@components/dashboard/forms/FormInputs";
import { useState } from "react";
import { toast } from "react-toastify";

const EditCreator = ({ setOpen, state, setState }) => {
  const [formState, setFormState] = useState(state);

  const resetDefaults = () => {
    setFormState(state);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/${state.id}/edit`,
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
      return toast.success("Der Creator wurde erfolgreich bearbeitet");
    } catch (error) {
      toast.error(error);
    }
  };
  return (
    <>
      <form
        className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6"
        onSubmit={handleClick}
      >
        <Ueberschrift label={"Creatorinformationen"} />
        <Input
          label={"Name"}
          type={"text"}
          value={formState}
          setValue={setFormState}
          keyName={"channelName"}
        />
        <Input
          label={"Channel ID"}
          type={"text"}
          value={formState}
          setValue={setFormState}
          keyName={"channelID"}
        />
        <Input
          label={"Firma"}
          type={"text"}
          value={formState}
          setValue={setFormState}
          keyName={"company"}
        />
        <Input
          label={"Link zum Bild"}
          type={"text"}
          value={formState}
          setValue={setFormState}
          keyName={"image"}
        />
        <Ueberschrift label={"Abrechnungsinformationen"} />
        <Input
          label={"Ziel (in %)"}
          type={"number"}
          value={formState}
          setValue={setFormState}
          keyName={"goal"}
        />{" "}
        <Input
          label={"Share (in %)"}
          type={"number"}
          value={formState}
          setValue={setFormState}
          keyName={"share"}
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

export default EditCreator;
