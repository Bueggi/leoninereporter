"use client";
import { toast } from "react-toastify";
import { useRef } from "react";
import RefTextInput from "@components/pComponents/inputs/RefTextInput";
import RefNumberInput from "@components/pComponents/inputs/RefNumberInputs";
import Toggle from "@components/pComponents/Toggle";

export default function AddCreator({ setOpen, allCreators, setAllCreators }) {
  const nameRef = useRef();
  const channelIDRef = useRef();
  const companyRef = useRef();
  const anbindungRef = useRef("TALENT");
  const shareRef = useRef(10);
  const goalRef = useRef(3);
  const managementRef = useRef();
  const channelIDsRef = useRef([]);
  const taxableRef = useRef();
  const imageRef = useRef();
  const invoiceAddressRef = useRef();
  const paymentGoalRef = useRef(14);
  const reverseChargeRef = useRef(false);



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
            name: nameRef.current.value,
            channelID: channelIDRef.current.value,
            share: shareRef.current.value,
            company: companyRef.current.value,
            goal: goalRef.current.value,
            image: imageRef.current.value,
            anbindung: anbindungRef.current.value || "OWNED",
            taxable: taxableRef.current.value,
            management: managementRef.current.value,
            invoiceAddress: invoiceAddressRef.current.value,
            paymentGoal: paymentGoalRef.current.value,
            reverseCharge: reverseChargeRef.current.value
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
        <RefTextInput title="Name" ref={nameRef} required={"required"} />
        <RefTextInput
          title="ChannelID"
          ref={channelIDRef}
          required={"required"}
        />
        <RefTextInput title="Company" ref={companyRef} required={"required"} />
        {/* <RefTextInput
        title="Anbindung"
        ref={anbindungRef}
        required={"required"}
      /> */}
        <Toggle ref={anbindungRef} label="Talent" />
        <RefTextInput
          title="Link zum Bild"
          ref={imageRef}
          required={"required"}
        />
        <RefTextInput
          title="Management"
          ref={managementRef}
        />
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
        <RefNumberInput
          title="Zahlungsziel"
          ref={paymentGoalRef}
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
