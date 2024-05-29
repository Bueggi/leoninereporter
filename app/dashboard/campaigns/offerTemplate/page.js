import Image from "next/image";
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from "@heroicons/react/20/solid";
import moment from "moment";
import { Fragment } from "react";

const OfferTemplate = () => {
  return (
    <div className="p-8" id="testID">
          <div className="mt-2 flex items-center text-xs text-gray-500">
            Angebotsnummer 123
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500 mb-8">
            Datum des Angebots: {moment(moment.now()).format("LL")}
          </div>
      <div className="flex flex-row gap-4 justify-center align-middle items-center">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl flex flex-col font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Angebot für Kampagne{" "}
            <span className="text-[#AB8353]">KAMPAGNENNAME</span>
          </h2>
          <div className="mt-1 flex gap-4">
            <div className="mt-2 flex items-center justify-center align-middle text-sm text-gray-500">
              <MapPinIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              Produkt: Home of Talents // Relevant Commitment
            </div>
            <div className="mt-2 flex items-center justify-center align-middle text-sm text-gray-500">
              <CurrencyDollarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              Budget: 11.000€
            </div>

            <div className="mt-2 flex items-center justify-center align-middle text-sm text-gray-500">
              <CalendarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              Zeitraum: {moment(moment.now()).format("L")} -{" "}
              {moment(moment.now()).format("L")}
            </div>
            <div className="mt-2 flex items-center justify-center align-middletext-sm text-gray-500">
              <CalendarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              Rotation: Premium Rotation Home of Talents
            </div>
            <div className="mt-2 flex items-center justify-center align-middle text-sm text-gray-500">
              <MapPinIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              Targeting: DE
            </div>
          </div>
        </div>
        <Image src="/HoTLogo.png" width={150} height={150} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Home of Talents Media
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        TKP (net)
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        AIs
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Budget (net)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        Non Skip Short Ad
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        13,50€
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        100.000
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        1.350,00€
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        Skippable Ad
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        -
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        -
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        -
                      </td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        Bumper
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        -
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        -
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        -
                      </td>
                    </tr>
                    <tr className="bg-slate-600 text-white">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium  sm:pl-6">
                        TOTAL
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm ">
                        13,50
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm ">
                        100.000
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm ">
                        1.350,00 €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferTemplate;
