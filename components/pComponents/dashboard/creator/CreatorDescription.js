import Badge from "@components/pComponents/Badge";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import moment from "moment";

export default function CreatorDescription({ creator }) {
  const { channelName, channelID, image, anbindung, share, goal, createdAt } =
    creator;
  return (
    <div className="container max-w-xl  border-2 border-black rounded-md my-20">
      <div className="lg:col-start-3 lg:row-end-1 py-4">
        <h2 className="sr-only">Zusammenfassung</h2>
        <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
          <dl className="flex flex-wrap">
            {/* <div className="flex-auto pl-6 pt-6">
            <dt className="text-sm font-semibold leading-6 text-gray-900">Amount</dt>
            <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">$10,560.00</dd>
          </div>
          <div className="flex-none self-end px-6 pt-4">
            <dt className="sr-only">Status</dt>
            <dd className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Paid
            </dd>
          </div> */}

            <div className="w-full grid grid-cols-2">
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Client</span>
                  <UserCircleIcon
                    className="h-6 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </dt>
                <dd className="text-sm font-medium leading-6 text-gray-900">
                  {channelID}
                </dd>
              </div>

              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Im Netzwerk seit</span>
                  <CalendarDaysIcon
                    className="h-6 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </dt>
                <dd className="text-sm leading-6 text-gray-500">
                  <time dateTime="2023-01-31">
                    {moment(createdAt).format("LL")}
                  </time>
                </dd>
              </div>

              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Status</span>
                  <CreditCardIcon
                    className="h-6 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </dt>
                <dd className="text-sm leading-6 text-gray-500">
                  <Badge color="green" label={anbindung} />
                </dd>
              </div>
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Status</span>
                  <CreditCardIcon
                    className="h-6 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </dt>
                <dd className="text-sm leading-6 text-gray-500">{share}%</dd>
              </div>
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Status</span>
                  <CreditCardIcon
                    className="h-6 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </dt>
                <dd className="text-sm leading-6 text-gray-500">{goal}%</dd>
              </div>
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Status</span>
                  <CreditCardIcon
                    className="h-6 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </dt>
                <dd className="text-sm leading-6 text-gray-500">{anbindung}</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
