"use client";
import { toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";

export default function Modal({ params: { id } }) {
  // State für dieses Component:
  // 1. Der Advertiser, den wir bearbeiten wollen / dessen Informationen wir einsehen wollen
  const [advertiser, setAdvertiser] = useState({});
  const [loading, setLoading] = useState(false);

  // Beim Mount des Components wird der Advertiser aus der Datenbank geladen
  useEffect(() => {
    getAdvertiser();
  }, []);

  // 1. Greife auf die Datenbank zu - Frage den Advertiser aus der URL ab
  // 2. Wenn der Advertiser existiert, wird er in den State des Components geladen
  // 3. Wenn der Advertiser nicht existiert, wird ein Fehlerstatus ausgegeben
  const getAdvertiser = async () => {
    setLoading(true);
    const chosenAdvertiserRes = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/${id}/list`
    );
    const { data, message } = await chosenAdvertiserRes.json();

    if (!chosenAdvertiserRes.ok) return toast.error(message);
    setAdvertiser(data);
    setLoading(false);
  };

  const handleClick = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/${id}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: advertiser.name,
          }),
        }
      );

      const { data, message } = await res.json();

      if (!res.ok) toast.error(message);
      else toast.success(`Der Advertiser ${data.name} wurde gespeichert`);
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
              value={advertiser?.name}
              onChange={(e) =>
                setAdvertiser({ ...advertiser, name: e.target.value })
              }
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
    </div>
  );
}
