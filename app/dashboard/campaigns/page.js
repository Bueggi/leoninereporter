"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";

// Components
import AddAdvertiser from "@components/dashboard/campaign/AddCampaign";
import DeleteAdvertiser from "@components/dashboard/campaign/DeleteCampaign";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import Modal from "@components/pComponents/Modal";
import Pagination from "@components/pComponents/Pagination";
import Searchbar from "@components/pComponents/Search";

// Libs
import calculateDate from "../../../lib/calculateDate";
import { getColor } from "@lib/dashboard/publishingOptions";
import { getInitialData, returnEndDate, returnStartDate } from "./lib";

const ListedCampaignsContent = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null); // Besser null als undefined
  
  // FIX 1: Initial State muss zur Struktur passen, um Crash zu vermeiden
  // Nutze 'const' statt 'let'
  const [allCampaigns, setAllCampaigns] = useState({ data: [], mode: "list" }); 
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const searchParams = useSearchParams();
  const activePage = searchParams.get("page") || 1; // State für activePage ist oft redundant, wenn es aus der URL kommt

  useEffect(() => {
    getInitialData(setLoading, activePage, setAllCampaigns, setCount);
  }, [activePage]);

  return (
    <>
      {/* Modals */}
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
                        {/* Header Column Helper Component wäre hier cool um Redundanz zu sparen */}
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Erstellt am</th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Status</th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Budget</th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Start</th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Ende</th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Advertiser</th>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">Bearbeiten</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Optional chaining (?.) schützt vor Crash, falls data undefined ist */}
                      {allCampaigns?.data?.map((item) => (
                        <tr key={item.id} className="even:bg-white odd:bg-slate-200">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {/* FIX: Env Variable entfernt */}
                            <Link href={`/dashboard/campaigns/${item.id}`}>
                              {item.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {moment(item.createdAt).format("LL")}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex flex-row align-middle items-center">
                              {/* FIX: 'class' zu 'className' geändert */}
                              <span
                                className={`flex w-3 h-3 me-3 ${getColor("bg", item.status, 700)} rounded-full`}
                              ></span>
                              {item.status}
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.budget ? item.budget : "-"}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex flex-col">
                              {returnStartDate(item)}
                              <span className="font-light text-xs">
                                {returnStartDate(item) ? calculateDate(returnStartDate(item)) : "-"}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex flex-col">
                              {returnEndDate(item)}
                              <span className="font-light text-xs">
                                {returnEndDate(item) ? calculateDate(returnEndDate(item)) : "-"}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.advertiser}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            
                            {/* FIX: Button im Link entfernt. Nur Link benutzen. */}
                            <Link
                              href={`/dashboard/campaigns/${item.id}`}
                              className="inline-block rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mr-4"
                            >
                                <PencilIcon className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">, {item.name}</span>
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setIdToDelete(item.id);
                                setDeleteModalOpen(true);
                              }}
                              className="inline-block rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">, {item.name}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {allCampaigns.mode !== "search" && (
                    <Pagination
                      count={count}
                      activePage={activePage}
                      // Pagination Komponente sollte idealerweise via URL navigieren, nicht via State
                      // Da du aber activePage aus der URL liest, reicht hier ein Router push in der Komponente
                      // oder du übergibst eine Funktion, die router.push macht.
                    />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Wrapper Component für Suspense (sehr gut gelöst von dir!)
const ListedCampaigns = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ListedCampaignsContent />
    </Suspense>
  );
};

export default ListedCampaigns;