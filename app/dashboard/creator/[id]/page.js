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
    getCreator();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  // Fallback, falls der Creator nicht gefunden wird
  if (!creator || Object.keys(creator).length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold">Creator nicht gefunden</h2>
        <p className="mt-4 text-gray-600">
          Der angeforderte Creator existiert nicht oder konnte nicht geladen
          werden.
        </p>
      </div>
    );
  }

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
    { title: "Firma", value: company },
    { title: "Rechnungsadresse", value: invoiceAddress },
    { title: "Management", value: management },
    { title: "Anbindung", value: anbindung },
    { title: "Goal", value: goal + "%" },
    { title: "Share", value: share + "%" },
    { title: "Reverse Charge", value: reverseCharge ? "Ja" : "Nein" },
    { title: "Steuerpflichtig in Deutschland", value: taxable },
    { title: "Zahlungsziel", value: paymentGoal },
  ];

  return (
    <div className="">
      {/* Modal für das Bearbeiten des Creators */}
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
      {/* Creator Informationen */}

      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-base/7 font-semibold text-indigo-600">
            Informationen über den Creator
          </h2>
          <p className="mt-2 max-w-lg text-pretty text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
            {creator.channelName}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
            <div className="relative lg:col-span-3">
              <div className="absolute inset-px max-h rounded-lg bg-white max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] lg:rounded-tl-[calc(2rem+1px)]">
                <div className="p-10 pt-4">
                  <h3 className="text-sm/4 font-semibold text-indigo-600">
                    Allgemein
                  </h3>
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    Adresse & Management
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
                      <CreatorInfos
                        titel={"Ansprechpartner"}
                        information={creator.channelName}
                      />
                      <CreatorInfos
                        titel={"Managment"}
                        information={creator.management}
                      />
                      <CreatorInfos
                        titel={"Firma"}
                        information={creator.company}
                      />
                      <CreatorInfos
                        titel={"Rechnungsadresse"}
                        information={`${creator.invoiceAddress}, ${creator.city}, ${creator.country}`}
                      />
                    </div>
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]" />
            </div>
            <div className="relative lg:col-span-3">
              <div className="absolute inset-px rounded-lg bg-white lg:rounded-tr-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
                <div className="p-10 pt-4">
                  <h3 className="text-sm/4 font-semibold text-indigo-600">
                    Finanzinformationen
                  </h3>
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    Goal & Share
                  </p>

                  <div className="px-4 py-6 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
                    <CreatorInfos
                      titel={"Share"}
                      information={`${creator.share} %`}
                    />
                    <CreatorInfos
                      titel={"Ziel"}
                      information={`${creator.goal} %`}
                    />
                    <CreatorInfos
                      titel={"Zahlungsziel"}
                      information={`${creator.paymentGoal} Tage`}
                    />

                    <CreatorInfos
                      titel={"Reverse Charge"}
                      information={
                        creator.reverseCharge
                          ? "Ja, anwenden"
                          : "Nicht anwenden"
                      }
                    />
                    <CreatorInfos
                      titel={"Steuerpflicht in DE"}
                      information={creator.taxable ? "Ja" : "Nein"}
                    />

                    <CreatorInfos
                      titel={"Firma"}
                      information={creator.company}
                    />
                    <CreatorInfos
                      titel={"Adresse"}
                      information={creator.invoiceAddress}
                    />
                    <CreatorInfos
                      titel={"Adresse"}
                      information={creator.invoiceAddress}
                    />
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tr-[2rem]" />
            </div>
            {/* <div className="relative lg:col-span-2">
              <div className="absolute inset-px rounded-lg bg-white lg:rounded-bl-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-bl-[calc(2rem+1px)]">
                <img
                  alt=""
                  src="https://tailwindui.com/plus/img/component-images/bento-01-speed.png"
                  className="h-80 object-cover object-left"
                />
                <div className="p-10 pt-4">
                  <h3 className="text-sm/4 font-semibold text-indigo-600">
                    Speed
                  </h3>
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    Built for power users
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                    Sed congue eros non finibus molestie. Vestibulum euismod
                    augue.
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-bl-[2rem]" />
            </div> */}
            {/* <div className="relative lg:col-span-2">
              <div className="absolute inset-px rounded-lg bg-white" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                <img
                  alt=""
                  src="https://tailwindui.com/plus/img/component-images/bento-01-integrations.png"
                  className="h-80 object-cover object-center"
                />
                <div className="p-10 pt-4">
                  <h3 className="text-sm/4 font-semibold text-indigo-600">
                    Integrations
                  </h3>
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    Connect your favorite tools
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                    Maecenas at augue sed elit dictum vulputate, in nisi aliquam
                    maximus arcu.
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5" />
            </div> */}
            {/* <div className="relative lg:col-span-2">
              <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-br-[calc(2rem+1px)]">
                <img
                  alt=""
                  src="https://tailwindui.com/plus/img/component-images/bento-01-network.png"
                  className="h-80 object-cover object-center"
                />
                <div className="p-10 pt-4">
                  <h3 className="text-sm/4 font-semibold text-indigo-600">
                    Network
                  </h3>
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    Globally distributed CDN
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                    Aenean vulputate justo commodo auctor vehicula in malesuada
                    semper.
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]" />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export const CreatorInfos = ({ titel, information }) => {
  return (
    <div>
      <dt className="text-sm/6 font-medium text-gray-900">{titel}</dt>
      <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
        {information}
      </dd>
    </div>
  );
};
