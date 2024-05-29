import { toast } from "react-toastify";
const getAllAdvertisers = async (
  setAllAdvertisers,
  setCount,
  setLoading,
  activePage
) => {
  setLoading(true);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_HOSTURL}/api/advertiser/list?page=${activePage}`
  );
  const { data, count, message } = await res.json();
  if (data) {
    setAllAdvertisers({ data, mode: "page" });
    setCount(count);
    setLoading(false);
    return;
  } else {
    toast.error(message);
  }
};

export { getAllAdvertisers };
