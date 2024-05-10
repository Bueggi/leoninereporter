import { useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";

export default function EditOffer({ initialOffer, state, setState, setOpen }) {
  const start = moment(initialOffer.start).format("YYYY-MM-DD");
  const end = moment(initialOffer.end).format("YYYY-MM-DD");

  const [formState, setFormState] = useState({
    start,
    end,
    reach: +initialOffer.reach,
    product: initialOffer.product,
    rotation: initialOffer.rotation,
    tkp: +initialOffer.tkp,
  });

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
            start: moment(formState.start).format(),
            end: moment(formState.end).format(),
            reach: formState.reach,
            product: formState.product,
            tkp: formState.tkp,
            rotation: formState.rotation,
          }),
        }
      );

      if (!res.ok) return toast.error("Etwas hat nicht funktioniert");

      const { data, message } = await res.json();

      setState({
        ...state,
        offers: state.offers.map((offerGroup) => ({
          ...offerGroup,
          offers: offerGroup.offers.map((offer) =>
            offer.id === initialOffer.id ? data : offer
          ),
        })),
      });

      setOpen(false);

      toast.success("Das Angebot wurde erfolgreich angelegt");
      setOpen(false);
    } catch (error) {
      setOpen(false);
      toast.error(error);
    }
  };

  return (
    <form onSubmit={handleEditOfferClick}>
      <div className="grid grid-cols-1 md:grid-cols-3">
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
            value={formState.start}
            onChange={(e) =>
              setFormState({ ...formState, start: e.target.value })
            }
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
            value={formState.end}
            onChange={(e) =>
              setFormState({ ...formState, end: e.target.value })
            }
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
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
            value={formState.rotation}
            onChange={(e) =>
              setFormState({ ...formState, rotation: e.target.value })
            }
            className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
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
            value={formState.reach}
            onChange={(e) =>
              setFormState({ ...formState, reach: e.target.value })
            }
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
            value={formState.tkp}
            onChange={(e) =>
              setFormState({ ...formState, tkp: e.target.value })
            }
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
            value={formState.product}
            onChange={(e) =>
              setFormState({ ...formState, product: e.target.value })
            }
            className=" block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="NONSKIPPABLE">Nonskippable Short Ad (20&apos;)</option>
            <option value="SKIPPABLE">Skippable Ad</option>
            <option value="BUMPER">Bumper Ad (6&apos;)</option>
          </select>
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
