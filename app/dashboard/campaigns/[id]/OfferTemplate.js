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

const OfferTemplate = ({ offer }) => {
  console.log(offer)
  return (
    <div id="testID" className="w-full text-xl">
      <div className="mx-auto p-8 px-16 items-center align-middle justify-center w-[2208px] h-[1556px]">
        <div className="mt-2 flex items-center text-lg text-gray-500">
          Angebotsnummer {offer.offernumber}
        </div>
        <div className="mt-2 flex text-lg items-center text-gray-500 mb-8">
          Datum des Angebots: {moment(moment.now()).format("LL")}
        </div>
        <div className="flex flex-row gap-4 justify-center align-middle items-center">
          <div className="min-w-0 flex-1">
            <div className="flex justify-between">
              <h2 className="text-5xl flex flex-col font-bold leading-tight text-gray-900 sm:truncate sm:tracking-tight mb-12">
                Angebot für Kampagne{" "}
                <span className="text-[#AB8353] mb-4">KAMPAGNENNAME</span>
              </h2>
              \
              <div>
                <Image src="/HoTLogo.png" width={200} height={200} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-20 mt-16">
              <div className="mt-2 flex align-middle text-large text-gray-500">
                Product: Home of Talents // Relevant Commitment
              </div>
              <div className="mt-2 flex align-middle text-large text-gray-500 basis-1/4">
                Budget:{" "}
                {offer.offers.reduce(
                  (accumulator, currentValue) =>
                    accumulator +
                    (currentValue.reach * currentValue.tkp) / 1000,
                  0
                )}
              </div>

               <div className="mt-2 flex align-middle text-large text-gray-500 basis-1/4">
                Zeitraum:{" "}
                {moment(
                  offer.offers.reduce((accumulator, currentValue) => {
                    if (accumulator === 0) return currentValue.start;
                    return accumulator > currentValue.start;
                  }, 0)
                ).format("L")}{" "}
                -{" "}
                {moment(
                  offer.offers.reduce((accumulator, currentValue) => {
                    if (accumulator === 0) return currentValue.end;
                    return accumulator < currentValue.end;
                  }, 0)
                ).format("L")}
              </div>
              <div className="mt-2 flex align-middle text-large text-gray-500 basis-1/4">
                Rotation: {offer.offers.reduce((acc, el) => {
                  if (acc.indexOf(el) !== -1) return acc;
                  return [...acc, el.rotation];
                }, [])}
              </div>
              <div className="mt-2 flex align-middle text-large text-gray-500 basis-1/4">
                Targeting:{" "}
                {offer.offers.reduce((acc, el) => {
                  if (acc.indexOf(el) !== -1) return acc;
                  return [...acc, el.output];
                }, [])}
              </div> 
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 text-xl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-2xl font-semibold text-gray-900 sm:pl-6"
                        >
                          Home of Talents Media
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-2xl font-semibold text-gray-900"
                        >
                          TKP (net)
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-2xl font-semibold text-gray-900"
                        >
                          AIs
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-2xl font-semibold text-gray-900"
                        >
                          Budget (net)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3  font-medium text-gray-900 sm:pl-6">
                          Non Skip Short Ad
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "NONSKIPPABLE")
                              return accumulator;
                            if (accumulator === 0) return currentValue.tkp;
                            return (accumulator + currentValue.tkp) / 2;
                          }, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "NONSKIPPABLE")
                              return accumulator;

                            return accumulator + currentValue.reach;
                          }, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "NONSKIPPABLE")
                              return accumulator;
                            return (
                              accumulator +
                              currentValue.reach * (currentValue.tkp / 1000)
                            );
                          }, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3  font-medium text-gray-900 sm:pl-6">
                          Skippable Ad
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "SKIPPABLE")
                              return accumulator;
                            if (accumulator === 0) return currentValue.tkp;
                            return (accumulator + currentValue.tkp) / 2;
                          }, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "SKIPPABLE")
                              return accumulator;

                            return accumulator + currentValue.reach;
                          }, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "SKIPPABLE")
                              return accumulator;
                            return (
                              accumulator +
                              currentValue.reach * (currentValue.tkp / 1000)
                            );
                          }, 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3  font-medium text-gray-900 sm:pl-6">
                          Bumper
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "BUMPER")
                              return accumulator;
                            if (accumulator === 0) return currentValue.tkp;
                            return (accumulator + currentValue.tkp) / 2;
                          }, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "BUMPER")
                              return accumulator;

                            return accumulator + currentValue.reach;
                          }, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  text-gray-500">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            if (currentValue.product !== "BUMPER")
                              return accumulator;
                            return (
                              accumulator +
                              currentValue.reach * (currentValue.tkp / 1000)
                            );
                          }, 0)}
                        </td>
                      </tr>
                      <tr className="bg-slate-600 text-white font-bold">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3  font-medium  sm:pl-6">
                          TOTAL
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  "></td>
                        <td className="whitespace-nowrap px-3 py-4  ">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            return accumulator + currentValue.reach;
                          }, 0)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4  ">
                          {offer.offers.reduce((accumulator, currentValue) => {
                            return (
                              accumulator +
                              currentValue.reach * (currentValue.tkp / 1000)
                            );
                          }, 0)}
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
    </div>
  );
};

export default OfferTemplate;
