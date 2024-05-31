import { useRef } from "react";
import { toast } from "react-toastify";
import FormSubHeading from "@components/pComponents/FormSubHeading";

export default function AddOffer({ offerGroupID, state, setState, setOpen }) {
  const startRef = useRef();
  const endRef = useRef();
  const reachRef = useRef();
  const productRef = useRef();
  const rotationRef = useRef();
  const tkpRef = useRef();
  const outputRef = useRef();
  const targetingRef = useRef();

  const handleAddOfferClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/offer/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: startRef.current.value,
            end: endRef.current.value,
            reach: reachRef.current.value,
            product: productRef.current.value,
            tkp: tkpRef.current.value,
            rotation: rotationRef.current.value,
            targeting: targetingRef.current.value,
            output: outputRef.current.value,
            offerGroupID,
          }),
        }
      );
      if (!res.ok) return toast.error("Etwas hat nicht funktioniert");

      const { data, message } = await res.json();

      setState({
        ...state,
        offers: state.offers.map((el) => {
          if (el.id !== offerGroupID) return el;
          else return { ...el, offers: [...el.offers, data] };
        }),
      });

      toast.success("Das Angebot wurde erfolgreich angelegt");
      setOpen(false);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <form onSubmit={handleAddOfferClick}>
      <div className="grid grid-cols-1 md:grid-cols-3">
        <FormSubHeading>Laufzeit</FormSubHeading>

        <div className="mt-2">
          <label
            htmlFor="start"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Start
          </label>
          <input
            type="date"
            name="start"
            ref={startRef}
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            required
          />
        </div>
        <div className="mt-2">
          <label
            htmlFor="ende"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Ende
          </label>
          <input
            required
            type="date"
            name="ende"
            ref={endRef}
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <FormSubHeading>Finanzielles</FormSubHeading>
        <div className="mt-2">
          <label
            htmlFor="impressions"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Impressions
          </label>
          <input
            required
            type="number"
            name="impressions"
            ref={reachRef}
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mt-2">
          <label
            htmlFor="tkp"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            TKP
          </label>
          <input
            required
            type="number"
            step={0.1}
            ref={tkpRef}
            name="tkp"
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>

        <div className="mt-2">
          <label
            htmlFor="product"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Product
          </label>
          <select
            name="product"
            ref={productRef}
            className=" block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="NONSKIPPABLE">
              Nonskippable Short Ad (20&apos;)
            </option>
            <option value="SKIPPABLE">Skippable Ad</option>
            <option value="BUMPER">Bumper Ad (6&apos;)</option>
          </select>
        </div>

        <FormSubHeading>Targetinginformationen</FormSubHeading>

        <div className="mt-2">
          <label
            htmlFor="rotation"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Rotation
          </label>
          <input
            required
            type="text"
            name="rotation"
            ref={rotationRef}
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mt-2">
          <label
            htmlFor="rotation"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Targeting
          </label>
          <input
            type="text"
            name="targeting"
            ref={targetingRef}
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mt-2">
          <label
            htmlFor="output"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Ausspielung
          </label>
          <input
            type="text"
            name="output"
            ref={outputRef}
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>

        <button
          type="submit"
          className="mt-12 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Speichern
        </button>
      </div>
    </form>
  );
}
