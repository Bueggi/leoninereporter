"use client";
import { toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import SelectField from "@components/pComponents/SelectField";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";

export default function Modal({ params: { id } }) {
  // State für dieses Component:
  // 1. Der creator, den wir bearbeiten wollen / dessen Informationen wir einsehen wollen
  const [creator, setCreator] = useState({});
  const [loading, setLoading] = useState(false);
  const bla = useRef();

  // Beim Mount des Components wird der creator aus der Datenbank geladen
  useEffect(() => {
    getInitialData();
  }, []);

  // 1. Greife auf die Datenbank zu - Frage den creator aus der URL ab
  // 2. Wenn der creator existiert, wird er in den State des Components geladen
  // 3. Wenn der creator nicht existiert, wird ein Fehlerstatus ausgegeben
  const getInitialData = async () => {
    setLoading(true);
    const chosenCreator = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/${id}/list`
    );
    const { data, message } = await chosenCreator.json();

    if (!chosenCreator.ok) return toast.error(message);
    setCreator(data);
    setLoading(false);
  };

  const handleClick = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/${id}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channelName: creator.channelName,
            channelID: creator.channelID,
            share: creator.share,
            company: creator.company,
            goal: creator.goal,
            demographics: creator.demographics,
            anbindung: creator.anbindung,
            image: creator.image,
          }),
        }
      );

      const { data, message } = await res.json();

      if (!res.ok) return toast.error(message);
      else
        return toast.success(
          `Der creator ${data.channelName} wurde gespeichert`
        );
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Bearbeite den Eintrag
      </h2>
      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
        <label
          htmlFor="channelName"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Channel Name
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
            <input
              type="text"
              name="channelName"
              id="channelName"
              autoComplete="channelName"
              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={creator?.channelName}
              onChange={(e) =>
                setCreator({ ...creator, channelName: e.target.value })
              }
            />
          </div>
        </div>
        <label
          htmlFor="channelID"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Channel ID
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
            <input
              type="text"
              name="channelID"
              id="channelID"
              autoComplete="channelID"
              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={creator?.channelID}
              onChange={(e) =>
                setCreator({ ...creator, channelID: e.target.value })
              }
            />
          </div>
        </div>
        <label
          htmlFor="channelImage"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Channel Image
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
            <input
              type="text"
              name="channelImage"
              id="channelImage"
              autoComplete="channelImage"
              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={creator?.image}
              onChange={(e) =>
                setCreator({ ...creator, image: e.target.value })
              }
            />
          </div>
        </div>
        <label
          htmlFor="share"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Share
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
            <input
              type="number"
              name="share"
              id="share"
              autoComplete="share"
              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={creator?.share}
              onChange={(e) =>
                setCreator({ ...creator, share: e.target.value })
              }
            />
          </div>
        </div>
        <label
          htmlFor="advertisername"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Goal
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
            <input
              type="number"
              name="goal"
              id="goal"
              autoComplete="goal"
              className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={creator?.goal}
              onChange={(e) => setCreator({ ...creator, goal: e.target.value })}
            />
          </div>
        </div>
        <label
          htmlFor="advertisername"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Anbindung
        </label>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
          <SelectField
            options={[{ name: "TALENT" }, { name: "OWNED" }]}
            ref={bla}
          />
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="mt-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Abschicken
        </button>
      </div>
    </div>
  );
}
