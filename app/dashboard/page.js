"use client";
import { toast } from "react-toastify";
import InfluencerCard from "../lib/dashboard/InfluencefrCard";

const Dashboard = () => {
  const useButton = async () => {
    const res = await fetch("/api/users", { method: "POST" });
    const data = await res.json();

    if (data.success) return console.log(data.data);
    else {
      toast.error(data.message);
      return console.log(data.message);
    }
  };

  const mapArray = [1, 2, 3, 4, 5, 6, 7, 8, 8];
  return (
    <div>
      <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Influencer Finder
      </h1>
      <div className="container bg-slate-200 py-2 px-4">
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mapArray.map((el, i) => {
            return <InfluencerCard key={i}></InfluencerCard>;
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
