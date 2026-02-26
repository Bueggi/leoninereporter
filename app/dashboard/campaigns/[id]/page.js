"use client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import { PlusIcon } from "@heroicons/react/24/outline";
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
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import EditCampaign from "@components/dashboard/campaign/EditCampaign";
import { useSession } from "next-auth/react";

import dynamic from "next/dynamic";

const DownloadPDFButton = dynamic(
  () => import("@components/dashboard/campaign/DownloadPDF"),
  {
    ssr: false,
    loading: () => (
      <button className="rounded bg-white/20 px-2 py-1 text-sm font-semibold text-white cursor-wait">
        PDF Modul...
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
    <div>
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
        <div className="flex flex-row gap-4 items-center">
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
                <div
                  className="border border-slate-400 rounded-md bg-slate-100 overflow-hidden"
                  key={i}
                >
                  {/* Card Header – kein absolute positioning mehr, normaler flow */}
                  <div className="flex flex-row justify-around items-center bg-slate-400 px-3 py-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        deleteOfferGroup(el.id, campaign, setcampaign)
                      }
                      className="rounded bg-red-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 whitespace-nowrap"
                    >
                      Angebotsgruppe löschen
                    </button>
                    <button
                      onClick={() => {
                        setChosenOfferGroupID(el.id);
                        setAddOfferModalOpen(true);
                      }}
                      type="button"
                      className="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-nowrap"
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
                        trade={campaign.trade}
                      />
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="px-4 py-3">
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

                  {/* Card Footer */}
                  <div className="px-4 pb-3">
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
              );
            })
          ) : (
            <EmptyState title={"Es wurden noch keine Offers angelegt"} />
          )}
        </div>
      </div>

      <div className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight mt-12">
        <div className="flex flex-row gap-4 items-center">
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
        {(!campaign.bookings || !campaign.bookings.length) && (
          <EmptyState title={"Es wurden noch keine Buchungen angelegt"} />
        )}
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