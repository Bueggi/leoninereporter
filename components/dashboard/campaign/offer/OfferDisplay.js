import moment from "moment";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import adFormatNames from "@lib/dashboard/AdFormatNames";

const MetricChip = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-xs font-medium text-slate-700">{value}</span>
    </div>
  );
};

const OfferDisplay = ({
  el,
  i,
  setEditOfferModal,
  setOfferToEdit,
  setOfferToEditPricingModel,
  deleteOffer,
  campaign,
  setCampaign,
  pricingModel = "TKP",
}) => {
  const displayName =
    adFormatNames.filter((formats) => formats.name === el.product)[0]
      ?.displayName ?? el.product;

  const summe =
    pricingModel === "CPCV"
      ? (el.tkp * el.reach).toLocaleString("de-DE", {
          style: "currency",
          currency: "EUR",
        })
      : ((+el.tkp / 1000) * +el.reach).toLocaleString("de-DE", {
          style: "currency",
          currency: "EUR",
        });

  const tkpLabel = pricingModel === "CPCV" ? "CPCV" : "TKP";

  const tkp = el.tkp.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 10,
  });

  const reach = el.reach.toLocaleString("de-DE");
  const zeitraum = `${moment(el.start).format("L")} – ${moment(el.end).format("L")}`;

  return (
    <div
      className="group relative my-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
      key={i}
    >
      {/* Header */}
      <div className="flex items-start justify-between bg-slate-800 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
            Produkt
          </p>
          <p className="text-sm font-bold text-white leading-tight">
            {displayName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={() => {
              setOfferToEdit(el);
              setOfferToEditPricingModel(pricingModel);
              setEditOfferModal(true);
            }}
            className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-emerald-500 transition-colors duration-150"
            title="Bearbeiten"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => deleteOffer(el.id, campaign, setCampaign)}
            className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-red-500 transition-colors duration-150"
            title="Löschen"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <div className="flex flex-col items-center py-2.5 px-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Reichweite
          </span>
          <span className="mt-0.5 text-sm font-bold text-slate-800">{reach}</span>
        </div>
        <div className="flex flex-col items-center py-2.5 px-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {tkpLabel}
          </span>
          <span className="mt-0.5 text-sm font-bold text-slate-800">{tkp}</span>
        </div>
        <div className="flex flex-col items-center py-2.5 px-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Summe
          </span>
          <span className="mt-0.5 text-sm font-bold text-indigo-600">{summe}</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <div className="col-span-2">
          <MetricChip label="Zeitraum" value={zeitraum} />
        </div>
        <MetricChip label="Rotation" value={el.rotation} />
        <MetricChip label="Plattform" value={el.platform} />
        <MetricChip label="Placement" value={el.placement} />
        <MetricChip label="Frequency Cap" value={el.frequencyCap} />
        <MetricChip label="Alter" value={el.age} />
        <MetricChip label="Geschlecht" value={el.targeting} />
      </div>
    </div>
  );
};

export default OfferDisplay;