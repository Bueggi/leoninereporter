"use client";
import { toast } from "react-toastify";
import { useRef, useState } from "react";
import RefTextInput, {
  StateObjectInput,
} from "@components/pComponents/inputs/RefTextInput";
import RefNumberInput from "@components/pComponents/inputs/RefNumberInputs";
import Toggle from "@components/pComponents/Toggle";
import FormSubHeading from "@components/pComponents/FormSubHeading";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

export default function AddCreator({ setOpen, allCreators, setAllCreators }) {
  const [channelIDs, setChannelIDs] = useState([
    { channelName: "", channelID: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Refs für Eingabefelder
  const anbindungRef = useRef("OWNED");
  const channelNameRef = useRef();
  const companyRef = useRef();
  const goalRef = useRef();
  const invoiceAddressRef = useRef();
  const managementRef = useRef();
  const paymentGoalRef = useRef();
  const reverseChargeRef = useRef(false);
  const shareRef = useRef();
  const cityRef = useRef();
  const countryRef = useRef();
  const taxableRef = useRef();

  const validateInputs = () => {
    const newErrors = {};
    if (!channelNameRef.current.value)
      newErrors.channelName = "Channel Name ist erforderlich";
    if (channelIDs.some((el) => !el.channelName || !el.channelID))
      newErrors.channelIDs = "Channel Name und ID sind erforderlich";
    if (!companyRef.current.value)
      newErrors.company = "Company ist erforderlich";
    if (!taxableRef.current.value)
      newErrors.taxable = "Steuerpflichtiges Land ist erforderlich";
    if (!invoiceAddressRef.current.value)
      newErrors.invoiceAddress = "Rechnungsadresse ist erforderlich";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    setLoading(true);
    try {
      console.log(shareRef.current.value)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelName: channelNameRef.current.value,
            channelIDs,
            company: companyRef.current.value,
            goal: goalRef.current.value,
            anbindung: anbindungRef.current.value,
            taxable: taxableRef.current.value,
            management: managementRef.current.value,
            invoiceAddress: invoiceAddressRef.current.value,
            paymentGoal: paymentGoalRef.current.value,
            reverseCharge: reverseChargeRef.current.value,
            share: shareRef.current.value,
            city: cityRef.current.value,
            country: countryRef.current.value,
          }),
        }
      );

      const { data, message } = await res.json();
      if (!res.ok) return toast.error(message);
      console.log(data, message)
      

      toast.success(
        `Der Creator ${data.channelName} wurde erfolgreich angelegt`
      );
      setAllCreators({
        count: allCreators.count + 1,
        data: [...allCreators.data, data],
      });
      setOpen(false);
    } catch (error) {
      toast.error("Fehler beim Hinzufügen: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeChannelID = (i) => {
    const newChannelIDs = [...channelIDs];
    newChannelIDs.splice(i, 1);
    setChannelIDs(newChannelIDs);
  };

  return (
    <form className="grid grid-cols-3 gap-4 py-6" onSubmit={handleSubmit}>
      <FormSubHeading>Creator Informationen</FormSubHeading>
      <RefTextInput title="Vertragspartner" ref={channelNameRef} required />
      <RefTextInput title="Firma" ref={companyRef} />

      <div className=" grid grid-cols-3 col-span-3 gap-4">
        <div>
          <RefTextInput
            title="Abrechnungsadresse"
            ref={invoiceAddressRef}
            required
          />
        </div>
        <div>
          <RefTextInput title="Stadt" ref={cityRef} />
        </div>
        <div>
          <RefTextInput title="Land" ref={countryRef} />
        </div>
      </div>
      <RefTextInput title="Management" ref={managementRef} />
      <FormSubHeading>Angebundene Channels</FormSubHeading>

      {channelIDs.map((el, i) => (
        <div className="col-span-3 relative" key={i}>
          <div className="flex gap-4">
            <StateObjectInput
              title="Channel Name"
              value={el}
              index={i}
              field="channelName"
              setState={setChannelIDs}
              state={channelIDs}
            />
            <StateObjectInput
              title="Channel ID"
              value={el}
              index={i}
              field="channelID"
              setState={setChannelIDs}
              state={channelIDs}
            />
          </div>
          <MinusCircleIcon
            className="w-6 h-6 text-red-500 cursor-pointer absolute right-3 top-2"
            onClick={() => removeChannelID(i)}
          />
        </div>
      ))}
      <PlusCircleIcon
        className="w-8 h-8 text-green-500 cursor-pointer col-span-3"
        onClick={() =>
          setChannelIDs([...channelIDs, { channelName: "", channelID: "" }])
        }
      />

      <Toggle ref={anbindungRef} label="Anbindung (Talent/Owned)" />

      <FormSubHeading>Zahlungsinformationen</FormSubHeading>
      <RefTextInput title="Steuerpflichtig in" ref={taxableRef} required />
      <Toggle ref={reverseChargeRef} label="Reverse Charge" />

      <RefNumberInput title="Zahlungsziel in Tagen" ref={paymentGoalRef} />
      <RefNumberInput title="Share (%)" ref={shareRef} />
      <RefNumberInput title="Goal (%)" ref={goalRef} />

      <button
        type="submit"
        disabled={loading}
        className="col-span-3 mt-4 bg-indigo-600 text-white p-3 rounded"
      >
        {loading ? "Wird gesendet..." : "Creator hinzufügen"}
      </button>
    </form>
  );
}
