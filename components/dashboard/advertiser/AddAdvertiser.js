"use client";
import { toast } from "react-toastify";
import { useRef } from "react";

export default function Modal({ setOpen, allAdvertisers, setAllAdvertisers }) {
  const nameRef = useRef();
  const riskFeeRef = useRef();
  const addressRef = useRef();
  const plzRef = useRef();
  const cityRef = useRef();
  const countryRef = useRef();
  const handleClick = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: nameRef.current.value,
            riskFee: riskFeeRef.current.value,
            address: addressRef.current.value,
            plz: plzRef.current.value,
            country: countryRef.current.value,
            city: cityRef.current.value
          }),
        }
      );

      const { data, message } = await res.json();

      if (!res.ok) return toast.error(message);
      else toast.success(`Der Advertiser ${data.name} wurde angelegt`);
      setAllAdvertisers({
        data: [{ ...data, _count: { campaigns: 0 } }, ...allAdvertisers.data],
        mode: "page",
      });
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Advertiser Name
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="advertisername"
            id="advertisername"
            autoComplete="advertisername"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            ref={nameRef}
            placeholder="Name des Advertisers"
            required
          />
        </div>
      </div>

      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Adresse
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="advertiserRiskFee"
            id="advertiserRiskFee"
            autoComplete="advertiserRiskFee"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            ref={addressRef}
            required
          />
        </div>
      </div>

      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Polstleitzahl
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="advertiserRiskFee"
            id="advertiserRiskFee"
            autoComplete="advertiserRiskFee"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            ref={plzRef}
            required
          />
        </div>
      </div>

      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Stadt
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="advertiserRiskFee"
            id="advertiserRiskFee"
            autoComplete="advertiserRiskFee"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            ref={cityRef}
            required
          />
        </div>
      </div>
      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Land
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="advertiserRiskFee"
            id="advertiserRiskFee"
            autoComplete="advertiserRiskFee"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            ref={countryRef}
            required
          />
        </div>
      </div>

      <label
        htmlFor="advertisername"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Risk Fee in %
      </label>
      <div className="mt-2 sm:col-span-2 sm:mt-0">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="number"
            name="advertiserRiskFee"
            id="advertiserRiskFee"
            autoComplete="advertiserRiskFee"
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            ref={riskFeeRef}
            placeholder="12.5"
            step={0.01}
            required
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="mt-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Abschicken
      </button>
    </div>
  );
}
