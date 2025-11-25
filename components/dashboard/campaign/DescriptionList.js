import { returnEndDate, returnStartDate } from "app/dashboard/campaigns/lib";
import moment from "moment";
import { getColor } from "@lib/dashboard/publishingOptions";

export default function DescriptionList({ campaign }) {
  const {
    createdAt,
    updatedAt,
    status,
    advertiser,
    contact,
    contactEmail,
    anrede,
  } = campaign;
  console.log(campaign);
  const start = returnStartDate(campaign);
  const end = returnEndDate(campaign);
  const information = [
    {
      title: "Erstellungsdatum",
      value: moment(createdAt).format("LL"),
      show: true,
    },
    {
      title: "Zuletzt bearbeitet",
      value: moment(updatedAt).format("LL"),
      show: true,
    },
    { title: "Status", value: status, show: true, color: status },
    {
      title: "Advertiser",
      value: advertiser && advertiser.name ? advertiser.name : null,
      show: true,
    },
    {
      title: "Kontakt" + " / Anrede: " + anrede,
      value: contact && contactEmail ? contact + " / " + contactEmail : null,
      show: contact.length || anrede.length ? true : false,
    },
    { title: "Start", value: start, show: start ? true : false },
    { title: "Ende", value: end, show: end ? true : false },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      {information.map((information, i) => (
        <Description information={information} key={i} />
      ))}
    </div>
  );
}

const Description = ({ information }) => {
  const color = getColor(information.color) || "white";

  if (!information.show) return;
  return (
    <div
      className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
      style={{ backgroundColor: color }}
    >
      <div className="flex-shrink-0"></div>
      <div className="min-w-0 flex-1">
        <a href="#" className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-900">
            {information.value}
          </p>
          <p className="truncate text-sm text-gray-500">{information.title}</p>
        </a>
      </div>
    </div>
  );
};
