"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Switch } from "@headlessui/react";
import { publishingOptions } from "@lib/dashboard/publishingOptions";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const EditCampaign = ({ campaign, setCampaign, setOpen }) => {
  const [state, setState] = useState({
    ...campaign,
    advertiserName: campaign.advertiser.name,
  });
  const [advertisers, setAdvertisers] = useState();
  const [isServiceplan, setIsServiceplan] = useState(state.isServiceplan);
  const publishingLabels = publishingOptions.map((el) => el.title);

  // gets all advertisers from the database
  const getAdvertisers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/list/all`
      );
      const { data, message } = await res.json();
      if (message) return toast.error(message);
      setAdvertisers(data);
    } catch (error) {
      toast.error(error);
    }
  };
  // get Advertisers from database and set them to the state
  useEffect(() => {
    getAdvertisers();
  }, []);

  const advertiserLabels = advertisers && advertisers.map((el) => el.name);

  // handle the submit of the form
  const handleClick = async () => {
    try {
      const advertiserID = advertisers.filter(
        (el) => el.name === state.advertiserName
      );

      const updatedCampaign = {
        name: state.name,
        advertiserID: advertiserID[0].id,
        ordernumber: state.ordernumber,
        isServiceplan: state.isServiceplan,
        product: isServiceplan ? state.product : null,
        onlineCampaign: isServiceplan ? state.onlineCampaign : null,
        productfamily: isServiceplan ? state.productfamily : null,
        customergroup: isServiceplan ? state.customergroup : null,
        customer: isServiceplan ? state.customer : null,
        status: state.status,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/campaign/${campaign.id}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCampaign),
        }
      );
      const { data, message } = await res.json();
      if (message) return toast.error(message);

      setState(data);
      setCampaign({
        ...data,
        bookings: campaign.bookings,
        offers: campaign.offers,
      });
      setOpen(false);
      return toast.success("Die Kampagne wurde erfolgreich gespeichert");
    } catch (error) {
      toast(error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <Ueberschrift label="Kampagneninformationen" />
      <Input
        label="Kampagnenname"
        value={state}
        setValue={setState}
        type="text"
        keyName="name"
      />

      <Dropdown
        label="Advertiser"
        options={advertiserLabels}
        value={state && state.advertiser.name}
        setState={setState}
        state={state}
        keyName="advertiserName"
      />
      <Dropdown
        label="Status"
        options={publishingLabels}
        value={state && state.status}
        setState={setState}
        state={state}
        keyName="status"
      />
      <Ueberschrift label="Abrechnungsinformationen" />
      <div className="col-span-3 flex justify-between">
        <p className="block text-sm font-medium leading-6 text-gray-900">
          Serviceplan Buchung
        </p>
        <Toggle enabled={isServiceplan} setEnabled={setIsServiceplan} />
      </div>
      {isServiceplan && (
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <Input
            label="Konzern"
            type="text"
            value={state}
            setValue={setState}
            keyName="customergroup"
          />
          <Input
            label="Kunde"
            type="text"
            value={state}
            setValue={setState}
            keyName="customer"
          />
          <Input
            label="Produktfamilie"
            value={state}
            setValue={setState}
            type="text"
            keyName="productfamily"
          />
          <Input
            label="Produkt"
            value={state}
            setValue={setState}
            type="text"
            keyName="product"
          />
          <Input
            label="Ordernummer"
            value={state}
            setValue={setState}
            type="text"
            keyName="ordernumber"
          />
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-indigo-600 mt-8 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Abschicken
      </button>
    </div>
  );
};

export const Input = ({ label, type, value, setValue, keyName }) => {
  return (
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          type={type}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={value[keyName] ? value[keyName] : ""}
          onChange={(e) => {
            setValue({ ...value, [`${keyName}`]: e.target.value });
          }}
        />
      </div>
    </div>
  );
};

export const Ueberschrift = ({ label }) => {
  return (
    <div className="col-span-1 md:col-span-3 text-xs leading-6 sm:order-none sm:w-auto sm:leading-7 text-indigo-600 font-bold">
      {label}
    </div>
  );
};

export const Toggle = ({ enabled, setEnabled }) => {
  return (
    <div>
      <Switch
        checked={enabled}
        onChange={() => setEnabled(!enabled)}
        className={classNames(
          enabled ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
    </div>
  );
};

export const Dropdown = ({
  label,
  options,
  setState,
  state,
  keyName,
  value,
}) => {
  return (
    <div>
      <label
        htmlFor="location"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <select
        id="location"
        name="location"
        value={state[keyName]}
        onChange={(e) => setState({ ...state, [`${keyName}`]: e.target.value })}
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
      >
        {options && options.map((el, i) => <option key={i}>{el}</option>)}
      </select>
    </div>
  );
};

export default EditCampaign;
