"use client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import { PlusIcon } from "@heroicons/react/24/outline";
import EmptyState from "@components/pComponents/EmptyState";

import OfferDisplay from "@components/dashboard/campaign/offer/OfferDisplay";

import { publishingOptions } from "@lib/dashboard/publishingOptions";
import {
  deleteOfferGroup,
  getcampaign,
  addOfferGroup,
  deleteOffer,
} from "./lib";
import Modal from "@components/pComponents/Modal";
import AddOffer from "@components/dashboard/campaign/offer/AddOffer";
import EditOffer from "@components/dashboard/campaign/offer/EditOffer";
import AddBooking from "@components/dashboard/campaign/booking/AddBooking";
import TableView from "@components/dashboard/campaign/booking/TableView";
import DescriptionList from "@components/dashboard/campaign/DescriptionList";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import EditCampaign from "@components/dashboard/campaign/EditCampaign";
import DownloadPDFButton from "@components/dashboard/campaign/DownloadPDF";

import { useSession } from "next-auth/react";

export default function Campaigns({ params: { id } }) {
  // State für dieses Component:
  // 1. Der campaign, den wir bearbeiten wollen / dessen Informationen wir einsehen wollen

  const [campaign, setcampaign] = useState({});
  const [loading, setLoading] = useState(true);
  const [addOfferModalOpen, setAddOfferModalOpen] = useState(false);
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [editOfferModal, setEditOfferModal] = useState(false);
  const [chosenOfferGroupID, setChosenOfferGroupID] = useState();
  const [offerToEdit, setOfferToEdit] = useState();
  const [addBookingModal, setAddBookingModal] = useState(false);
  const [offerArray, setOfferArray] = useState([]);
  // get the userSession
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
    },
  });

  // Beim Mount des Components wird der campaign aus der Datenbank geladen

  useEffect(() => {
    if (session !== "loading") getcampaign(id, setcampaign, setLoading);
  }, [id, session]);

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
          <EditCampaign
            campaign={campaign}
            setCampaign={setcampaign}
            setOpen={setEditCampaignModalOpen}
          />
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
        <div>{campaign.name}</div>
        <button
          type="button"
          onClick={() => setEditCampaignModalOpen(true)}
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
          {campaign.offers && campaign.offers.length ? (
            campaign.offers.map((el, i) => {
              return (
                <>
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

                        {status !== "loading" && (
                          <DownloadPDFButton
                            offer={el}
                            campaignName={campaign.name}
                            advertiser={campaign.advertiser}
                            contact={campaign.contact}
                            contactEmail={campaign.contactEmail}
                            user={session.user.name}
                            userEmail={session.user.email}
                            anrede={campaign.anrede}
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-12">
                      {el.offers.length > 0 &&
                        el.offers.map((el, i) => (
                          <OfferDisplay
                            el={el}
                            i={i}
                            key={i}
                            setOfferToEdit={setOfferToEdit}
                            deleteOffer={deleteOffer}
                            setEditOfferModal={setEditOfferModal}
                            campaign={campaign}
                            setCampaign={setcampaign}
                          />
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
                </>
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
