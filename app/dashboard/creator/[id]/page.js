"use client";
import { toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CursorArrowRaysIcon,
  EnvelopeOpenIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import InformationBullet from '@components/pComponents/InformationBullet'
import CreatorDescription from '@components/pComponents/dashboard/creator/CreatorDescription'

export default function Modal({ params: { id } }) {
  // State für dieses Component:
  // 1. Der creator, den wir bearbeiten wollen / dessen Informationen wir einsehen wollen
  const [creator, setCreator] = useState({});
  const [loading, setLoading] = useState(true);

  // Beim Mount des Components wird der creator aus der Datenbank geladen
  useEffect(() => {
    getAdvertiser();
  }, []);

  // 1. Greife auf die Datenbank zu - Frage den creator aus der URL ab
  // 2. Wenn der creator existiert, wird er in den State des Components geladen
  // 3. Wenn der creator nicht existiert, wird ein Fehlerstatus ausgegeben
  const getAdvertiser = async () => {
    try {
      setLoading(true);
      const chosenAdvertiserRes = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/${id}/list`
      );
      const { data, message } = await chosenAdvertiserRes.json();
      if (!chosenAdvertiserRes.ok) return toast.error(message);
      setCreator(data);
      setLoading(false);
    } catch (error) {
      setLoading(false)
      toast.error('Etwas ist schief gelaufen')
    }
   
  };

  if (loading) return <LoadingSpinner />;


  const stats = [
    {
      id: 1,
      name: "Anzahl Kampagnen",
      stat: "71,897",
      icon: UsersIcon,
      change: "122",
      changeType: "increase",
    },
    {
      id: 2,
      name: "Letzte Auszahlung",
      stat: "58.16%",
      icon: EnvelopeOpenIcon,
      change: "5.4%",
      changeType: "increase",
    },
    {
      id: 3,
      name: "Avg. Click Rate",
      stat: "24.57%",
      icon: CursorArrowRaysIcon,
      change: "3.2%",
      changeType: "decrease",
    },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Informationen über {creator.channelName}
        {console.log(creator)}
      </h2>
      {/* <InformationBullet /> */}
      <CreatorDescription creator={creator}/>
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        Diese Statistiken sind noch nicht programmiert, sondern nur Dummies
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.stat}
              </p>
              <p
                className={classNames(
                  item.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600",
                  "ml-2 flex items-baseline text-sm font-semibold"
                )}
              >
                {item.changeType === "increase" ? (
                  <ArrowUpIcon
                    className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                    aria-hidden="true"
                  />
                )}

                <span className="sr-only">
                  {" "}
                  {item.changeType === "increase"
                    ? "Increased"
                    : "Decreased"}{" "}
                  by{" "}
                </span>
                {item.change}
              </p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all<span className="sr-only"> {item.name} stats</span>
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}