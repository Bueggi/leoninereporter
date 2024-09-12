"use client";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CursorArrowRaysIcon,
  EnvelopeOpenIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import CreatorDescription from "@components/pComponents/dashboard/creator/CreatorDescription";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import Modal from "@components/pComponents/Modal";
import EditCreator from "@components/dashboard/creator/EditCreator";

export default function CreatorDetails({ params: { id } }) {
  // State für dieses Component:
  // 1. Der creator, den wir bearbeiten wollen / dessen Informationen wir einsehen wollen
  const [creator, setCreator] = useState({});
  const [loading, setLoading] = useState(true);
  const [editCreatorModalOpen, setEditCreatorModalOpen] = useState(false);

  // Beim Mount des Components wird der creator aus der Datenbank geladen
  useEffect(() => {
    getCreator();
  }, []);

  // 1. Greife auf die Datenbank zu - Frage den creator aus der URL ab
  // 2. Wenn der creator existiert, wird er in den State des Components geladen
  // 3. Wenn der creator nicht existiert, wird ein Fehlerstatus ausgegeben
  const getCreator = async () => {
    try {
      setLoading(true);
      const chosenCreatorRes = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/${id}/list`
      );
      const { data, message } = await chosenCreatorRes.json();
      if (!chosenCreatorRes.ok) return toast.error(message);
      setCreator(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Etwas ist schief gelaufen");
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

  if (!creator) return notFound();

  const {
    channelName,
    channelIDs,
    share,
    demographics,
    company,
    goal,
    image,
    anbindung,
    taxable,
    management,
    invoiceAddress,
    paymentGoal,
    reverseCharge,
  } = creator;

  const creatorList = [
    { title: "Creatorname", value: channelName },
    { title: "ChannelIDs", value: channelIDs.join(',') },
    { title: "Firma", value: company },
    { title: "Rechnungsadresse", value: invoiceAddress },
    { title: "Management", value: management },
    { title: "Anbindung", value: anbindung },
    { title: "Goal", value: goal + "%" },
    { title: "Share", value: share + "%" },
    { title: "Reverse Charge", value: reverseCharge },
    { title: "Steuerpflichtig in Deutschland", value: taxable },
    { title: "Zahlungsziel", value: paymentGoal },
  ];

  console.log(channelIDs)

  return (
    <div className="">
      {/* Modal for editing the creator */}
      {editCreatorModalOpen && (
        <Modal open={editCreatorModalOpen} setOpen={setEditCreatorModalOpen}>
          <EditCreator
            setOpen={setEditCreatorModalOpen}
            state={creator}
            setState={setCreator}
          />
        </Modal>
      )}
      <div className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex justify-between mb-12">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Informationen über {creator.channelName}
        </h2>
        <button
          type="button"
          onClick={() => setEditCreatorModalOpen(true)}
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <CheckCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Creator bearbeiten
        </button>
      </div>
      {/* <InformationBullet /> */}

      <div className="grid grid-cols-1  md:grid-cols-4 gap-8">
        {creatorList.map((el, i) => {
          return (
            creatorList[i].value !== null && (
              <div className="">
                <div className="flex flex-col">
                  <p className="text-xl font-bold">{el.value}</p>
                  <h3 className="text-sm font-light text-slate-600">
                    {el.title}
                  </h3>
                </div>
              </div>
            )
          );
        })}
      </div>

        {/* <h3 className="text-base font-semibold leading-6 text-gray-900">
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
        </dl> */}
    </div>
  );
}
