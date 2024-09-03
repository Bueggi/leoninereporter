import moment from "moment";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const OfferDisplay = ({
  el,
  i,
  setEditOfferModal,
  setOfferToEdit,
  deleteOffer,
}) => {
  return (
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
          <PencilIcon className="h-5 w-5" aria-hidden="true" />
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
          {moment(el.start).format("L")} -{moment(el.end).format("L")}
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
          {((+el.tkp / 1000) * +el.reach).toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Rotation:</span>
          {el.rotation}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Plattform:</span>
          {el.platform}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Placement:</span>
          {el.placement}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Frequency Cap:</span>
          {el.frequencyCap}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Alter:</span>
          {el.age}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Geschlecht:</span>
          {el.targeting}
        </div>
      </div>
    </div>
  );
};

export default OfferDisplay;
