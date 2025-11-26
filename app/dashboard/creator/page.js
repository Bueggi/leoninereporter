"use client";
import AddCreator from "@components/dashboard/creator/AddCreator";
import DeleteCreator from "@components/dashboard/creator/DeleteCreator";
import { useEffect, useState, Suspense } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import Modal from "@components/pComponents/Modal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import Pagination from "@components/pComponents/Pagination";
import { useSearchParams } from "next/navigation";
import EmptyState from "@components/pComponents/EmptyState";
import Searchbar from "@components/pComponents/Search";
import Badge from "@components/pComponents/Badge";
import PageHeading from "@components/pComponents/PageHeading";
import { toast } from "react-toastify";
import { STRING_LITERAL_DROP_BUNDLE } from "next/dist/shared/lib/constants";

const ListCreatorContent = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState();
  const [allCreators, setAllCreators] = useState({
    data: [],
    count: 0,
    mode: "page",
  });
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  // get active page from url query parameter
  const searchParams = useSearchParams();
  const [activePage, setActivePage] = useState(searchParams.get("page") || 1);

  useEffect(() => {
    const getInitialData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_HOSTURL}/api/creator/list?page=${activePage}`
        );
        const { data, count, message } = await res.json();
        if (data) {
          setAllCreators({ data, count, mode: "page" });
          setCount(count);
          setLoading(false);
        } else {
          toast.error(message || "Fehler beim Laden der Daten");
          setLoading(false);
        }
      } catch (error) {
        toast.error(error.message || "Ein unbekannter Fehler ist aufgetreten");
        setLoading(false);
      }
    };
    getInitialData();
  }, [activePage]);

  return (
    <>
      {/* Modal zum Hinzufügen von Inhalten */}
      {addModalOpen && (
        <Modal open={addModalOpen} setOpen={setAddModalOpen}>
          <AddCreator
            setOpen={setAddModalOpen}
            allCreators={allCreators}
            setAllCreators={setAllCreators}
          />
        </Modal>
      )}
      {/* Modal zum Löschen von Inhalten */}
      {deleteModalOpen && (
        <Modal open={deleteModalOpen} setOpen={setDeleteModalOpen}>
          <DeleteCreator
            id={idToDelete}
            setOpen={setDeleteModalOpen}
            allCreators={allCreators}
            setAllCreators={setAllCreators}
          />
        </Modal>
      )}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <PageHeading
            title="Creator"
            subtitle="Eine Liste der Creator, mit denen wir zusammenarbeiten"
          />
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Creator hinzufügen
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            {loading && <LoadingSpinner />}
            {/* Tabelle für Ergebnisse */}
            {!loading &&
              (!allCreators.data.length ? (
                <EmptyState title="Es gibt keine Creator in der Datenbank" />
              ) : (
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="max-w-md mb-12">
                    <Searchbar
                      model="creator"
                      setAllResults={(results) => {
                        setAllCreators({
                          data: results,
                          count,
                          mode: "search",
                        });
                        setLoading(false);
                      }}
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
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Erstellt am
                          </th>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Anbindung
                          </th>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Channels
                          </th>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Bearbeiten
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {allCreators.data.map((item) => (
                          <tr
                            key={item.id}
                            className="even:bg-white odd:bg-slate-200"
                          >
                            {/* Name */}
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <Link
                                href={`/dashboard/creator/${item.id}`}
                                className="hover:underline"
                              >
                                {item.channelName}
                              </Link>
                            </td>
                            {/* Erstellt am */}
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {moment(item.createdAt).format("LL")}
                            </td>
                            {/* Anbindung */}
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <Badge
                                label={item.anbindung}
                                color={
                                  item.anbindung === "OWNED" ? "green" : "red"
                                }
                              />
                            </td>
                            {/* Channels */}
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                              {item.channelIDs && item.channelIDs.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {item.channelIDs.map((channel, idx) => (
                                    <li key={idx}>
                                      <span className="font-medium">
                                        {channel.channelName}
                                      </span>
                                      : <span>{channel.channelID}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span>Keine Channels</span>
                              )}
                            </td>
                            {/* Bearbeiten */}
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <Link href={`/dashboard/creator/${item.id}/edit`}>
                                <button
                                  type="button"
                                  className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mr-4"
                                >
                                  <PencilIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                  <span className="sr-only">Bearbeiten</span>
                                </button>
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIdToDelete(item.id);
                                  setDeleteModalOpen(true);
                                }}
                                className="rounded-full bg-red-600 p-2 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                              >
                                <TrashIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Löschen</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination anzeigen, wenn nicht im Suchmodus */}
                  {allCreators.mode !== "search" && (
                    <Suspense fallback={<LoadingSpinner />}>
                      <Pagination
                        count={count}
                        activePage={activePage}
                        setActivePage={setActivePage}
                      />
                    </Suspense>
                  )}
                </div>
              ))}
            {/* Ende der Tabelle */}
          </div>
        </div>
      </div>
    </>
  );
};

const ListCreator = () => {
  return (
    <Suspense fallback={LoadingSpinner}>
      <ListCreatorContent />
    </Suspense>
  );
};

export default ListCreator;
