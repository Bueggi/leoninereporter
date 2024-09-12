import {
  Input,
  Toggle,
  Ueberschrift,
} from "@components/dashboard/forms/FormInputs";
import { StateTextInput } from "@components/pComponents/inputs/RefTextInput";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { toast } from "react-toastify";

const EditCreator = ({ setOpen, state, setState }) => {
  const [formState, setFormState] = useState(state);
  const [channelIDs, setchannelIDs] = useState(formState.channelIDs);

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
            channelName: formState.channelName,
            channelIDs: channelIDs,
            share: formState.share,
            company: formState.company,
            goal: formState.goal,
            image: formState.image,
            anbindung: formState.anbindung || "OWNED",
            taxable: formState.taxable,
            management: formState.management,
            invoiceAddress: formState.invoiceAddress,
            paymentGoal: formState.paymentGoal,
            reverseCharge: formState.reverseCharge,
          }),
        }
      );
      const { data, message } = await res.json();
      if (message) return toast.error(message);
      setState(data);
      return toast.success("Der Creator wurde erfolgreich bearbeitet");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeChannelID = (i) => {
    const newChannelIDs = channelIDs;
    newChannelIDs.splice(i, 1);
    return setchannelIDs([...newChannelIDs]);
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
          keyName={"channelName"}
          setValue={setFormState}
        />
        <Input
          label={"Firma"}
          type={"text"}
          value={formState}
          keyName={"company"}
          setValue={setFormState}
        />
        <Toggle
          label="Channel ist Talent"
          enabled={formState.anbindung === "TALENT"}
          setEnabled={(enabled) =>
            setFormState((prev) => ({
              ...prev,
              anbindung: enabled ? "TALENT" : "OWNED",
            }))
          }
        />
        <Input
          label={"Link zum Bild"}
          type={"text"}
          value={formState}
          keyName={"image"}
          setValue={setFormState}
        />

        {channelIDs.map((el, i) => {
          return (
            <>
              <div className="block col-span-3 relative">
                <StateTextInput
                  title="ChannelIDs"
                  placeholder={"ChannelID des Creators"}
                  value={el}
                  index={i}
                  setState={setchannelIDs}
                  state={channelIDs}
                />
                <div className="absolute bottom-1 right-48">
                  <MinusCircleIcon
                    className="w-8 h-8 text-indigo-700"
                    onClick={() => removeChannelID(i)}
                  />
                </div>
              </div>
            </>
          );
        })}

        <div className="col-span-3 flex justify-center">
          <span>
            <a>
              <PlusCircleIcon
                className="w-8 h-8 text-indigo-700"
                onClick={() => {
                  setchannelIDs([...channelIDs, ""]);
                }}
              />
            </a>
          </span>
        </div>

        <Ueberschrift label={"Zahlungsinformationen"} />
        <Input
          label={"Steuerpflichtig in"}
          type={"text"}
          value={formState}
          keyName={"taxable"}
          setValue={setFormState}
        />
        <Toggle
          label="Reverse Charge"
          enabled={formState}
          keyName={"reverseCharge"}
          setEnabled={(enabled) =>
            setFormState((prev) => ({ ...prev, reverseCharge: enabled }))
          }
        />
        <Input
          label={"Abrechnungsadresse"}
          type={"text"}
          value={formState}
          keyName={"invoiceAddress"}
          setValue={setFormState}
        />
        <Input
          label={"Zahlungsziel in Tagen"}
          type={"number"}
          value={formState}
          keyName={"paymentGoal"}
          setValue={setFormState}
        />
        <Input
          label={"Management"}
          type={"text"}
          value={formState}
          keyName={"management"}
          setValue={setFormState}
        />

        <Ueberschrift label={"Auszahlungsinformationen"} />
        <Input
          label={"Share (in %)"}
          type={"number"}
          value={formState}
          keyName={"share"}
          setValue={setFormState}
        />
        <Input
          label={"Goal (in %)"}
          type={"number"}
          value={formState}
          keyName={"goal"}
          setValue={setFormState}
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
