"use client";
import { toast } from "react-toastify";
import { useRef, useState } from "react";
import RefTextInput, {
  StateTextInput,
} from "@components/pComponents/inputs/RefTextInput";
import RefNumberInput from "@components/pComponents/inputs/RefNumberInputs";
import Toggle from "@components/pComponents/Toggle";
import FormSubHeading from "@components/pComponents/FormSubHeading";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

export default function AddCreator({ setOpen, allCreators, setAllCreators }) {
  const [channelIDs, setchannelIDs] = useState(['']);
  const anbindungRef = useRef("TALENT");
  const channelName = useRef();
  const companyRef = useRef();
  const goalRef = useRef(3);
  const imageRef = useRef();
  const invoiceAddressRef = useRef();
  const managementRef = useRef();
  const paymentGoalRef = useRef(14);
  const reverseChargeRef = useRef(false);
  const shareRef = useRef(10);
  const taxableRef = useRef();

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: channelName.current.value,
            channelIDs,
            share: shareRef.current.value,
            company: companyRef.current.value,
            goal: goalRef.current.value,
            image: imageRef.current.value,
            anbindung: anbindungRef.current.value || "OWNED",
            taxable: taxableRef.current.value,
            management: managementRef.current.value,
            invoiceAddress: invoiceAddressRef.current.value,
            paymentGoal: paymentGoalRef.current.value,
            reverseCharge: reverseChargeRef.current.value,
          }),
        }
      );

      const { data, message } = await res.json();

      if (!res.ok) return toast.error(message);
      else toast.success(`Der Creator ${data.channelName} wurde angelegt`);
      setAllCreators({
        count: allCreators.count++,
        data: [...allCreators.data, data],
      });
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <form
        className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6"
        onSubmit={handleClick}
      >
        <FormSubHeading>CreatorInformationen</FormSubHeading>
        <RefTextInput title="Name" ref={channelName} required={"required"} />
        {channelIDs.map((el, i) => {
          return (
            <StateTextInput
              title="ChannelIDs"
              placeholder={"ChannelID des Creators"}
              value={el}
              index={i}
              setState={setchannelIDs}
              state={channelIDs}
            />
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

        <RefTextInput title="Company" ref={companyRef} required={"required"} />

        <Toggle ref={anbindungRef} label="Talent" />
        <RefTextInput
          title="Link zum Bild"
          ref={imageRef}
          required={"required"}
        />
        <FormSubHeading>Zahlungsinformationen</FormSubHeading>

        <RefTextInput
          title="Steuerpflichtig in"
          ref={taxableRef}
          required={"required"}
        />
        <Toggle ref={anbindungRef} label="Reverse Charge" />
        <RefTextInput
          title="Abrechnungsadresse"
          ref={invoiceAddressRef}
          required={"required"}
        />
        <RefNumberInput
          title="Zahlungsziel in Tagen"
          ref={paymentGoalRef}
          sign=""
          placeholder="60"
          required={"required"}
        />

        <RefTextInput title="Management" ref={managementRef} />

        <FormSubHeading>Auszahlungsinformationen</FormSubHeading>

        <RefNumberInput
          title="Share"
          sign="%"
          placeholder="10"
          ref={shareRef}
          required={"required"}
        />
        <RefNumberInput
          title="Goal"
          ref={goalRef}
          sign="%"
          placeholder="103"
          required={"required"}
        />

        <button
          type="submit"
          className="mt-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Abschicken
        </button>
      </form>
    </>
  );
}
