"use client";
import { notFound } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import EmptyState from "@components/pComponents/EmptyState";
import InformationField from "@components/pComponents/dashboard/campaigns/InformationField";
import moment from "moment";

import Badge from "@components/pComponents/Badge";
import { publishingOptions } from "@lib/dashboard/publishingOptions";
import {
  deleteOfferGroup,
  getcampaign,
  addOfferGroup,
  deleteOffer,
  exportAsPODF,
} from "./lib";
import Modal from "@components/pComponents/Modal";
import AddOffer from "@components/dashboard/campaign/offer/AddOffer";
import EditOffer from "@components/dashboard/campaign/offer/EditOffer";
import AddBooking from "@components/dashboard/campaign/booking/AddBooking";
import TableView from "@components/dashboard/campaign/booking/TableView";
import DescriptionList from "@components/dashboard/campaign/DescriptionList";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import EditCampaign from '@components/dashboard/campaign/EditCampaign'

// Hilfsfunktion von Tailwind, um Klassennamen zu mergen
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Campaigns({ params: { id } }) {
  // State für dieses Component:
  // 1. Der campaign, den wir bearbeiten wollen / dessen Informationen wir einsehen wollen

  const [campaign, setcampaign] = useState({});
  const [loading, setLoading] = useState(true);
  const [addOfferModalOpen, setAddOfferModalOpen] = useState(false);
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(true);
  const [editOfferModal, setEditOfferModal] = useState(false);
  const [chosenOfferGroupID, setChosenOfferGroupID] = useState();
  const [offerToEdit, setOfferToEdit] = useState();
  const [addBookingModal, setAddBookingModal] = useState(false);
  const [offerArray, setOfferArray] = useState([]);

  // Beim Mount des Components wird der campaign aus der Datenbank geladen
  useEffect(() => {
    getcampaign(id, setcampaign, setLoading);
  }, []);

  // Solange die Kampagne geladen wird, zeige einen Loading State
  if (loading) return <LoadingSpinner />;
  if (!campaign) return notFound();

  // finde die richtige Farbe fuer den Badge
  const color = publishingOptions.find((el) => el.title === campaign.status);

  return (
    <div>
      {/* Das Modal, um Inhalte hinzuzufügen */}
      {addOfferModalOpen && (
        <Modal open={addOfferModalOpen} setOpen={setAddOfferModalOpen}>
          <AddOffer
            setOpen={setAddOfferModalOpen}
            offerGroupID={chosenOfferGroupID}
            state={campaign}
            setState={setcampaign}
          />
        </Modal>
      )}
      {editCampaignModalOpen && (
        <Modal open={editCampaignModalOpen} setOpen={setEditCampaignModalOpen}>
          <EditCampaign campaign={campaign} setCampaign={setcampaign}/>
        </Modal>
      )}
      {/* Das Modal, das die Offers bearbeitet */}
      {editOfferModal && (
        <Modal open={editOfferModal} setOpen={setEditOfferModal}>
          <EditOffer
            setOpen={setEditOfferModal}
            initialOffer={offerToEdit}
            state={campaign}
            setState={setcampaign}
          />
        </Modal>
      )}
      {/* Das Modal, das die Bookings erstellt */}
      {addBookingModal && (
        <Modal open={addBookingModal} setOpen={setAddBookingModal}>
          <AddBooking
            setOpen={setAddBookingModal}
            campaignID={campaign.id}
            state={campaign}
            setState={setcampaign}
          />
        </Modal>
      )}

      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex justify-between mb-12">
        <div>
          {campaign.name}
        </div>
        <button
          type="button"
          onClick={()=>setEditCampaignModalOpen(true)}
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <CheckCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Kampagne bearbeiten
        </button>
      </h2>

      <DescriptionList campaign={campaign} />
      <div className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight mt-12">
        <div className="flex flex-row gap-4">
          Angebotsgruppen
          <button
            type="button"
            onClick={() => addOfferGroup(campaign.id, campaign, setcampaign)}
            className="rounded-full bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="text-base font-semibold leading-7 text-indigo-600">
          Jede Angebotsgruppe ist ein separates Angebot an den Kunden. Sollten
          also zwei verschiedene Angebote mit unterschiedlichen Konfigurationen
          an den Kunden rausgehen, werden mehrere Angebotsgruppen benötigt.
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-3 gap-8">
          {campaign.offers.length ? (
            campaign.offers.map((el, i) => {
              return (
                <div
                  className="relative border border-slate-400 px-4 py-2 rounded-md bg-slate-100"
                  key={i}
                >
                  <div className=" absolute inset-x-0 top-0 h-12 bg-slate-400 mb-12">
                    <div className="flex flex-row justify-around mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          deleteOfferGroup(el.id, campaign, setcampaign)
                        }
                        className="rounded bg-red-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Angebotsgruppe löschen
                      </button>
                      <button
                        onClick={() => {
                          setChosenOfferGroupID(el.id);
                          setAddOfferModalOpen(true);
                        }}
                        type="button"
                        className="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Neus Angebot
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          exportAsPODF(el, setOfferArray, campaign.name)
                        }
                        className="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        PDF erstellen
                      </button>
                    </div>
                  </div>

                  <div className="mt-12">
                    {el.offers.length > 0 &&
                      el.offers.map((el, i) => (
                        <div className="relative" key={i}>
                          <div className="absolute top-2 -right-2 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setOfferToEdit(el);
                                setEditOfferModal(true);
                              }}
                              className="rounded-full border border-black bg-emerald-400 p-1 text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                            >
                              <PencilIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-black bg-red-400 p-1 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            >
                              <TrashIcon
                                onClick={() => {
                                  deleteOffer(el.id, campaign, setcampaign);
                                }}
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                          <div className="rounded-md border-slate-700 border px-2 py-1 my-2 bg-slate-200 text-xs grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="font-bold">Zeitraum:</span>
                              {moment(el.start).format("L")} -
                              {moment(el.end).format("L")}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold">Reichweite:</span>
                              {el.reach.toLocaleString("de-DE")}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold">TKP:</span>
                              {el.tkp.toLocaleString("de-DE", {
                                style: "currency",
                                currency: "EUR",
                              })}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold">Summe:</span>
                              {((+el.tkp / 1000) * +el.reach).toLocaleString(
                                "de-DE",
                                { style: "currency", currency: "EUR" }
                              )}
                            </div>
                            <div className="col-span-2 flex flex-col">
                              <span className="font-bold">Rotation:</span>
                              {el.rotation}
                            </div>
                          </div>
                        </div>
                      ))}
                    {!el.offers.length && (
                      <EmptyState
                        title={
                          "Es wurden noch keine Angebote in dieser Gruppe angelegt"
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState title={"Es wurden noch keine Offers angelegt"} />
          )}
        </div>
      </div>
      <div className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight mt-12">
        <div className="flex flex-row gap-4">
          Bookings
          <button
            type="button"
            onClick={() => {
              setAddBookingModal(true);
            }}
            className="rounded-full bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div>
        {/* Wenn es keine Buchungen gibt, soll ein Empty State angezeigt werden */}
        {(!campaign.bookings || !campaign.bookings.length) && (
          <EmptyState title={"Es wurden noch keine Buchungen angelegt"} />
        )}
        {/* Wenn es Buchungen gibt, werden diese in der Tabelle angezeigt */}
        {campaign.bookings && !!campaign.bookings.length && (
          <TableView
            data={campaign.bookings}
            keys={[
              "Disponummer",
              "Start",
              "Ende",
              "Reichweite",
              "TKP",
              "Produkt",
              "Rotation",
              "Targeting",
              "Ausspielung",
            ]}
            state={campaign}
            setState={setcampaign}
          />
        )}
      </div>
      <div id="pdFID">
        {offerArray.map((el) => {
          return el;
        })}
      </div>
    </div>
  );
}
