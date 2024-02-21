import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const InfluencerCard = () => {
  const data = {
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    labels: ["Red", "Blue", "Yellow"],
    datasets: [
      {
        label: "My First Dataset",
        data: [300, 50, 100],
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  return (
    <div className="">

    <div className="shadow-xl w-80 h-80  bg-white border border-black rounded card-zoom">
      <div className="card-zoom-image bg-cover hover:scale-150 w-full h-full bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>
      <h1 className="card-zoom-text">JP Performance GmbH</h1>
      <div className="absolute bottom-0 w-full h-1/3 bg-slate-400 bg-opacity-50">
        <h1 className="mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">60% male</h1>
        <h1 className="mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">40% female</h1>
      </div>
    </div>
    </div>
  );
};

export default InfluencerCard;
