import { toast } from "react-toastify";
import moment from "moment";

// This function gets the data for presenting the component
// for each change in active page this function gets the information from the server and is called again

const getInitialData = async (
  setLoading,
  activePage,
  setAllCampaigns,
  setCount
) => {
  try {
    // shows loading spinner in frontend
    setLoading(true);
    //fetching data from server - either in the range of active page or per default from page 1
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/campaign/list` +
        (activePage ? `?page=${activePage}` : ""), {
          cache: 'no-store'
        }
    );
    const { data, count, message } = await res.json();

    if (data) {
      //set all Campaigns, add the count to display the pagination component correctly and stop the loading spinner
      setAllCampaigns({ data, mode: "page" });
      setCount(count);
      setLoading(false);
      return;
    } else {
      toast.error(message);
    }
  } catch (error) {
    toast.error(error);
  }
};

const returnStartDate = (item) => {
  if (!item.bookings || !item.bookings.length) return undefined;

  let earliestStartDate = new Date(item.bookings[0].start)

  for ( let i = 0; i < item.bookings.length; i++) {
    const checkDate = new Date(item.bookings[i].start)
    if ( checkDate < earliestStartDate)  earliestStartDate = checkDate
  }


  return moment(earliestStartDate).format("LL");
};
const returnEndDate = (item) => {
  if (!item.bookings || !item.bookings.length) return undefined;

  let latestEndDate = new Date(item.bookings[0].end)

  for ( let i = 0; i < item.bookings.length; i++) {
    const checkDate = new Date(item.bookings[i].end)
    if ( checkDate > latestEndDate)  latestEndDate = checkDate
  }


  return moment(latestEndDate).format("LL");
};

export { getInitialData, returnStartDate, returnEndDate };
