"use client";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import Statusbox from "../../pComponents/Statusbox";
import SelectField from "@components/pComponents/SelectField";
import { publishingOptions } from "@lib/dashboard/publishingOptions";

export default function Modal({ setOpen, allCampaigns, setAllCampaigns }) {
  // model Campaign {
  //   id           String     @id @default(uuid())
  //   createdAt    DateTime   @default(now())
  //   updatedAt    DateTime   @updatedAt
  //   name         String     @unique @default("")
  //   advertiser   Advertiser @relation(fields: [advertiserID], references: [id])
  //   advertiserID String     @default("")
  //   status       STATUS     @default(OFFER)
  //   creatorId    String
  //   offers       Offer[]
  //   creator      User       @relation(fields: [creatorId], references: [id])
  // }
  const nameRef = useRef();
  const chosenAdvertiserRef = useRef();
  const [status, setStatus] = useState(publishingOptions[0]);
  const [advertiserList, setAdvertiserList] = useState([]);

  // get initial states
  // useEffect for getting the advertisers as a value to the list
  useEffect(() => {
    getAdvertisers();
  }, []);

  const getAdvertisers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/list`
      );
      const { data, message } = await res.json();
      if (!res.ok) return toast.error(message);
      else return setAdvertiserList(data);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const advertiserID = advertiserList.filter(
      (el, i) => el.name === chosenAdvertiserRef.current.value
    );
    if (!advertiserID[0]) {
      return toast.error("Bitte wähle eine Kampagne aus");
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/campaign/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: nameRef.current.value,
            advertiserID: advertiserID[0].id,
            status: status.title,
          }),
        }
      );

      const { data, message } = await res.json();
      console.log("Kampagne wurde angelegt", data, message);
      if (!res.ok) toast.error(message);
      else toast.success(`Die Kampagne ${data.name} wurde angelegt`);

      setAllCampaigns({
        mode: allCampaigns.mode,
        data: [...allCampaigns.data, data],
      });
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleClick}>
      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
        <label
          htmlFor="advertisername"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Kampagnenname
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
              required
            />
          </div>
        </div>

        <label
          htmlFor="status"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Status
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <div className="flex rounded-md shadow-sm sm:max-w-md">
            <Statusbox selected={status} setSelected={setStatus} />
          </div>
        </div>

        <label
          htmlFor="status"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Advertiser
        </label>

        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <div className="flex rounded-md shadow-sm  sm:max-w-md">
            <SelectField
              title="Advertiser"
              options={advertiserList}
              formRef={chosenAdvertiserRef}
            />
          </div>
        </div>

        <div className="mt-2 sm:col-span-3 sm:mt-0">
          <button
            type="submit"
            className="mt-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Abschicken
          </button>
        </div>
      </div>
    </form>
  );
}
