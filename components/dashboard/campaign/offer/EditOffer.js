import { useRef, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import FormSubHeading from "@components/pComponents/FormSubHeading";
import adFormatNames from "@lib/dashboard/AdFormatNames";

export default function EditOffer({ initialOffer, state, setState, setOpen }) {
  // Refs für Felder, die nicht von Checkboxen abhängig sind
  const startRef = useRef();
  const endRef = useRef();
  const reachRef = useRef();
  const productRef = useRef();
  const rotationRef = useRef();
  const tkpRef = useRef();
  const frequencyCapRef = useRef();
  const upchargeTKPRef = useRef();

  // Checkbox-abhängige Felder initialisieren basierend auf initialOffer
  const [fieldActive, setFieldActive] = useState({
    age: !!initialOffer.age,
    targeting: !!initialOffer.targeting,
    platform: !!initialOffer.platform,
    placement: !!initialOffer.placement,
  });

  const [fieldValues, setFieldValues] = useState({
    age: initialOffer.age || "",
    targeting: initialOffer.targeting || "",
    platform: initialOffer.platform || "",
    placement: initialOffer.placement || "",
    plz: initialOffer.plz || "",
  });

  // Handler für Checkbox-Wechsel
  const handleCheckboxChange = (field) => (e) => {
    setFieldActive((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  // Handler für Eingabefeldänderungen
  const handleInputChange = (field) => (e) => {
    setFieldValues((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Berechnet die Anzahl der aktiven und gefüllten Upcharge-Felder
  const upchargeCount = ["age", "targeting", "platform", "placement"].reduce(
    (count, key) => {
      if (fieldActive[key] && fieldValues[key].trim() !== "") {
        return count + 1;
      }
      return count;
    },
    0
  );

  // Utility-Funktion für dynamische Klassen basierend auf Aktivierungsstatus
  const inputClass = (isActive) =>
    `mt-1 rounded-md border py-1.5 shadow-sm 
     ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm 
     ${
       isActive
         ? "text-gray-900 placeholder:text-gray-400 bg-white"
         : "text-gray-500 placeholder:text-gray-500 bg-gray-100 cursor-not-allowed"
     }`;

  const handleEditOfferClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/offer/${initialOffer.id}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: moment(startRef.current.value).format(),
            end: moment(endRef.current.value).format(),
            reach: reachRef.current.value,
            product: productRef.current.value,
            tkp: tkpRef.current.value,
            rotation: rotationRef.current.value,
            frequencyCap: frequencyCapRef.current.value,
            age: fieldActive.age ? fieldValues.age : null,
            targeting: fieldActive.targeting ? fieldValues.targeting : null,
            platform: fieldActive.platform ? fieldValues.platform : null,
            placement: fieldActive.placement ? fieldValues.placement : null,
            plz: fieldValues.plz,
            upchargeCount,
            upchargeTKP: upchargeTKPRef.current.value,
          }),
        }
      );

      const { data, message } = await res.json();
      if (!res.ok) return toast.error(message);

      setState({
        ...state,
        offers: state.offers.map((offerGroup) => ({
          ...offerGroup,
          offers: offerGroup.offers.map((offer) =>
            offer.id === initialOffer.id ? data : offer
          ),
        })),
      });

      toast.success("Das Angebot wurde erfolgreich bearbeitet");
      setOpen(false);
    } catch (error) {
      toast.error(error);
      setOpen(false);
    }
  };

  return (
    <form onSubmit={handleEditOfferClick}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormSubHeading>Kampagneninformationen</FormSubHeading>

        {/* Start */}
        <div className="mt-2">
          <label
            htmlFor="start"
            className="block text-sm font-medium text-gray-900"
          >
            Start
          </label>
          <input
            type="date"
            name="start"
            ref={startRef}
            defaultValue={moment(initialOffer.start).format("YYYY-MM-DD")}
            className="rounded-md border py-1.5 text-gray-900 shadow-sm 
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            required
          />
        </div>

        {/* Ende */}
        <div className="mt-2">
          <label
            htmlFor="ende"
            className="block text-sm font-medium text-gray-900"
          >
            Ende
          </label>
          <input
            required
            type="date"
            name="ende"
            ref={endRef}
            defaultValue={moment(initialOffer.end).format("YYYY-MM-DD")}
            className="rounded-md border py-1.5 text-gray-900 shadow-sm 
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        {/* Basisinformationen */}
        <FormSubHeading>Basisinformationen</FormSubHeading>

        {/* Frequency Cap */}
        <div className="mt-2">
          <label
            htmlFor="impressions"
            className="block text-sm font-medium text-gray-900"
          >
            Frequency Cap
          </label>
          <input
            required
            type="text"
            name="impressions"
            ref={frequencyCapRef}
            defaultValue={initialOffer.frequencyCap}
            className="rounded-md border py-1.5 text-gray-900 shadow-sm 
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        {/* Impressions */}
        <div className="mt-2">
          <label
            htmlFor="impressions"
            className="block text-sm font-medium text-gray-900"
          >
            Impressions
          </label>
          <input
            required
            type="number"
            name="impressions"
            ref={reachRef}
            defaultValue={initialOffer.reach}
            className="rounded-md border py-1.5 text-gray-900 shadow-sm 
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        {/* TKP */}
        <div className="mt-2">
          <label
            htmlFor="tkp"
            className="block text-sm font-medium text-gray-900"
          >
            TKP
          </label>
          <input
            required
            type="number"
            step={0.1}
            ref={tkpRef}
            name="tkp"
            defaultValue={initialOffer.tkp}
            className="rounded-md border py-1.5 text-gray-900 shadow-sm 
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        {/* Produktfeld */}
        <div className="mt-2">
          <label
            htmlFor="product"
            className="block text-sm font-medium text-gray-900"
          >
            Product
          </label>
          <select
            name="product"
            ref={productRef}
            defaultValue={initialOffer.product}
            className="mt-1 block w-full rounded-md border py-1.5 
                       text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          >
            {adFormatNames.map((adFormat, index) => (
              <option key={index} value={adFormat.name}>
                {adFormat.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Rotation */}
        <div className="mt-2">
          <label
            htmlFor="rotation"
            className="block text-sm font-medium text-gray-900"
          >
            Rotation
          </label>
          <input
            required
            type="text"
            name="rotation"
            ref={rotationRef}
            defaultValue={initialOffer.rotation}
            className="rounded-md border py-1.5 text-gray-900 shadow-sm 
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        {/* Geographie */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-900">
            Geographie
          </label>
          <input
            type="text"
            name="plz"
            value={fieldValues.plz}
            onChange={handleInputChange("plz")}
            className={inputClass(true)}
          />
        </div>

        <FormSubHeading>Upcharges</FormSubHeading>

        {/* Placement */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-900">
            Placement
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fieldActive.placement}
              onChange={handleCheckboxChange("placement")}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Aktivieren</span>
          </label>
          <input
            type="text"
            name="placement"
            value={fieldValues.placement}
            onChange={handleInputChange("placement")}
            disabled={!fieldActive.placement}
            className={inputClass(fieldActive.placement)}
          />
        </div>

        {/* Plattform */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-900">
            Plattform
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fieldActive.platform}
              onChange={handleCheckboxChange("platform")}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Aktivieren</span>
          </label>
          <input
            type="text"
            name="platform"
            value={fieldValues.platform}
            onChange={handleInputChange("platform")}
            disabled={!fieldActive.platform}
            className={inputClass(fieldActive.platform)}
          />
        </div>

        {/* Geschlecht (Targeting) */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-900">
            Geschlecht
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fieldActive.targeting}
              onChange={handleCheckboxChange("targeting")}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Aktivieren</span>
          </label>
          <input
            type="text"
            name="targeting"
            value={fieldValues.targeting}
            onChange={handleInputChange("targeting")}
            disabled={!fieldActive.targeting}
            className={inputClass(fieldActive.targeting)}
          />
        </div>

        {/* Alterstargeting */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-900">
            Alterstargeting
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fieldActive.age}
              onChange={handleCheckboxChange("age")}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Aktivieren</span>
          </label>
          <input
            type="text"
            name="age"
            value={fieldValues.age}
            onChange={handleInputChange("age")}
            disabled={!fieldActive.age}
            className={inputClass(fieldActive.age)}
          />
        </div>

        {/* UpchargeTKP */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-900">
            Upcharge TKP
          </label>
          <input
            type="number"
            step={0.01}
            name="upchargeTKP"
            ref={upchargeTKPRef}
            defaultValue={initialOffer.upchargeTKP}
            className="mt-1 rounded-md border py-1.5 text-gray-900 shadow-sm 
                       ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
          />
        </div>

        <div className="mt-4 col-span-1 md:col-span-3">
          <strong>Aktive Upcharge-Felder: {upchargeCount}</strong>
        </div>

        <div className="col-span-3">
          <button
            type="submit"
            className="mt-12 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm 
                       font-semibold text-white shadow-sm hover:bg-indigo-500 
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                       focus-visible:outline-indigo-600"
          >
            Speichern
          </button>
        </div>
      </div>
    </form>
  );
}
