"use client";
import AddAdvertiser from "@components/dashboard/campaign/AddCampaign";
import DeleteAdvertiser from "@components/dashboard/campaign/DeleteCampaign";
import { useEffect, useState } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import Modal from "@components/pComponents/Modal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import Pagination from "@components/pComponents/Pagination";
import { useSearchParams } from "next/navigation";
import Searchbar from "@components/pComponents/Search";
import { toast } from "react-toastify";
import calculateDate from "../../../lib/calculateDate";
import { getColor } from "@lib/dashboard/publishingOptions";

const ListAdvertisers = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState();
  let [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState();
  // get active page from url query parameter
  const searchParams = useSearchParams();
  const [activePage, setActivePage] = useState(searchParams.get("page") || 1);

  const getInitialData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTURL}/api/campaign/list` +
          (activePage ? `?page=${activePage}` : "")
      );
      const { data, count, message } = await res.json();
      if (data) {
        setAllCampaigns({ data, mode: "page" });
        setCount(count);
        setLoading(false);
        return;
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getInitialData();
  }, [activePage]);

  return (
    <>
      {/* Das Modal, um Inhalte hinzuzufügen */}
      {addModalOpen && (
        <Modal open={addModalOpen} setOpen={setAddModalOpen}>
          <AddAdvertiser
            setOpen={setAddModalOpen}
            allCampaigns={allCampaigns}
            setAllCampaigns={setAllCampaigns}
          />
        </Modal>
      )}
      {deleteModalOpen && (
        <Modal open={deleteModalOpen} setOpen={setDeleteModalOpen}>
          <DeleteAdvertiser
            id={idToDelete}
            setOpen={setDeleteModalOpen}
            allCampaigns={allCampaigns}
            setAllCampaigns={setAllCampaigns}
          />
        </Modal>
      )}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Kampagnen
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Hier sind alle Kampagnen aufgeführt, mit denen wir gerade arbeiten
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add campaign
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            {loading && <LoadingSpinner />}
            {/* Table for results */}
            {!loading && (
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="max-w-md mb-12">
                  <Searchbar
                    model="campaign"
                    setAllResults={setAllCampaigns}
                    setLoading={setLoading}
                  />
                </div>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-7 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 drop-shadow-2xl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left  text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Erstellt am
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left  text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left  text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Budget
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left  text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Start
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left  text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Ende
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left  text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Advertiser
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Bearbeiten
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 ">
                      {allCampaigns.data.map((item, i) => (
                        <tr key={i} className="even:bg-white odd:bg-slate-200">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <Link
                              href={`${process.env.NEXT_PUBLIC_HOSTURL}/dashboard/campaigns/${item.id}`}
                            >
                              {item.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {moment(item.createdAt).format("LL")}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex flex-row align-middle items-center">
                              <span
                                class={`flex w-3 h-3 me-3 ${getColor(
                                  "bg",
                                  item.status,
                                  700
                                )} rounded-full`}
                              ></span>
                              {item.status}
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.budget ? item.budget : "-"}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex flex-col">
                              {moment(item.end).format("LL")}{" "}
                              <span className="font-light text-xs">
                                {calculateDate(item.start)}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex flex-col">
                              {moment(item.end).format("LL")}{" "}
                              <span className="font-light text-xs">
                                {calculateDate(item.end)}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.advertiser}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a
                              href={`${process.env.NEXT_PUBLIC_HOSTURL}/dashboard/campaign/${item.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <button
                                type="button"
                                className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              >
                                <PencilIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                              <span className="sr-only">, {item.name}</span>
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setIdToDelete(item.id);
                                setDeleteModalOpen(true);
                              }}
                              className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              <TrashIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                            <span className="sr-only">, {item.name}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Zeige die Pagination
                Aber zeige sie nur dann, wenn die Ergebnisse nicht durch die Suche zustandegekommen sind
                Hintergrund: Ich vermute, dass die Anzahl der Suchergebnisse nicht häuäfig größer als 20 ist, daher akzeptiere ich ggf. den höheren ServerLoad durch die Suche
                Mittelfristig kann man aber auch noch eine "SearchPagination" implementieren oder eine Pagination, die unabhängig von dem Modus funktioniert */}
                {allCampaigns.mode !== "search" && (
                  <Pagination
                    count={count}
                    activePage={activePage}
                    setActivePage={setActivePage}
                  />
                )}
              </div>
            )}
            {/* Table end */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListAdvertisers;
