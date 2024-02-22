import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InfluencerCard = ({ influencer }) => {
  const options = {
    animation: false,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: "Age distribution",
      },
    },
  };

  const labels = [">18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: Object.values(influencer.demographics.age),
        borderColor: "rgb(134,25,143)",
        backgroundColor: "rgba(134,25,143,0.5)",
      },
    ],
  };

  return (
    <div className="">
      <div className="shadow-xl w-80 h-80  bg-white border border-black rounded card-zoom">
        <div className="card-zoom-image bg-cover hover:scale-150 w-full h-full bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]"></div>
        <h1 className="card-zoom-text">{influencer["Channel Name"]}</h1>
        <div className="absolute bottom-0 w-full h-1/3 bg-slate-400 bg-opacity-50 py-4 px-8 flex">
          <div>
            <h1 className="text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-2xl lg:text-xl dark:text-white">
              {influencer.demographics.gender.male}% male
            </h1>
            <h1 className="mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-xl dark:text-white">
              {influencer.demographics.gender.female}% female
            </h1>
          </div>
        </div>
      </div>
          <div className="h-44">
            <Bar options={options} data={data} />
          </div>
    </div>
  );
};

export default InfluencerCard;
