"use client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import { PlusIcon, TrashIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import EmptyState from "@components/pComponents/EmptyState";
import EditIndividualOfferNumber from "../../../../components/dashboard/campaign/pComponents/EditIndividualOfferNumber";

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
import { useSession } from "next-auth/react";

import dynamic from "next/dynamic";

const DownloadPDFButton = dynamic(
  () => import("@components/dashboard/campaign/DownloadPDF"),
  {
    ssr: false,
    loading: () => (
      <button className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white cursor-wait">
        <DocumentArrowDownIcon className="h-3.5 w-3.5" />
        PDF...
      </button>
    ),
  }
);

export default function Campaigns({ params: { id } }) {
  const [campaign, setcampaign] = useState({});
  const [loading, setLoading] = useState(true);
  const [addOfferModalOpen, setAddOfferModalOpen] = useState(false);
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [editOfferModal, setEditOfferModal] = useState(false);
  const [chosenOfferGroupID, setChosenOfferGroupID] = useState();
  const [offerToEdit, setOfferToEdit] = useState();
  const [addBookingModal, setAddBookingModal] = useState(false);
  const [offerArray, setOfferArray] = useState([]);

  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {},
  });

  useEffect(() => {
    if (session !== "loading") getcampaign(id, setcampaign, setLoading);
  }, [id, session]);

  if (loading) return <LoadingSpinner />;
  if (!campaign) return notFound();

  const color = publishingOptions.find((el) => el.title === campaign.status);

  return (
    <div className="space-y-10">
      {/* Modals */}
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

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Kampagne
          </p>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
            {campaign.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setEditCampaignModalOpen(true)}
          className="inline-flex items-center gap-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <CheckCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Kampagne bearbeiten
        </button>
      </div>

      <DescriptionList campaign={campaign} />

      {/* Angebotsgruppen Section */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold text-gray-900">Angebotsgruppen</h3>
          <button
            type="button"
            onClick={() => addOfferGroup(campaign.id, campaign, setcampaign)}
            className="rounded-full bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-500 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-indigo-600 font-medium mb-6">
          Jede Angebotsgruppe ist ein separates Angebot an den Kunden. Sollten
          also zwei verschiedene Angebote mit unterschiedlichen Konfigurationen
          an den Kunden rausgehen, werden mehrere Angebotsgruppen benötigt.
        </p>

        <div className="grid grid-cols-3 gap-6">
          {campaign.offers && campaign.offers.length ? (
            campaign.offers.map((el, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between bg-slate-800 px-4 py-3 gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Gruppe {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setChosenOfferGroupID(el.id);
                        setAddOfferModalOpen(true);
                      }}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 transition-colors duration-150"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Angebot
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
                        trade={campaign.trade}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => deleteOfferGroup(el.id, campaign, setcampaign)}
                      className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-red-500 hover:text-white transition-colors duration-150"
                      title="Angebotsgruppe löschen"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Offers */}
                <div className="flex-1 px-3 py-3 bg-slate-50">
                  {el.offers.length > 0 ? (
                    el.offers.map((offer, j) => (
                      <OfferDisplay
                        el={offer}
                        i={j}
                        key={j}
                        setOfferToEdit={setOfferToEdit}
                        deleteOffer={deleteOffer}
                        setEditOfferModal={setEditOfferModal}
                        campaign={campaign}
                        setCampaign={setcampaign}
                      />
                    ))
                  ) : (
                    <EmptyState title="Es wurden noch keine Angebote in dieser Gruppe angelegt" />
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-4 py-3 bg-white">
                  <EditIndividualOfferNumber
                    initialNumber={el.individualOfferNumber}
                    initialUseIndividual={el.usesIndividualOfferNumber}
                    element={el}
                    offerGroupId={el.id}
                    setCampaign={setcampaign}
                    campaign={campaign}
                  />
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="Es wurden noch keine Offers angelegt" />
          )}
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-bold text-gray-900">Bookings</h3>
          <button
            type="button"
            onClick={() => setAddBookingModal(true)}
            className="rounded-full bg-indigo-600 p-1.5 text-white shadow-sm hover:bg-indigo-500 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {!campaign.bookings || !campaign.bookings.length ? (
          <EmptyState title="Es wurden noch keine Buchungen angelegt" />
        ) : (
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
        {offerArray.map((el) => el)}
      </div>
    </div>
  );
}