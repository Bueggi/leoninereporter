"use client";
import { toast } from "react-toastify";
import InfluencerCard from "../../lib/dashboard/InfluencefrCard";
import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
let influencers = require("./influencerInfo.json");

const InfluencerList = () => {
  // initial states
  const [male, setMale] = useState(0);
  const [female, setFemale] = useState(0);
  const [sortBy, setSortBy] = useState(null);

  // filtere die Influencer nach Demographics
  let filteredInfluencers = influencers
    .filter((el) => el.demographics.gender.male > male)
    .filter((el) => el.demographics.gender.female > female);

  if (sortBy) {
    filteredInfluencers = filteredInfluencers.sort((a, b) => {
      return b.demographics.age[sortBy] - a.demographics.age[sortBy];
    });
  }

  return (
    <div className="flex flex-col xl:flex-row">
      <div className="flex-1">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-10">
          Influencer Finder
        </h1>
        <div className="flex flex-row gap-4 mb-4">
          <h2 className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight">
            Filteroptionen
          </h2>
          <button
            type="button"
            className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <TrashIcon
              className="h-5 w-5"
              aria-hidden="true"
              onClick={() => {
                setMale(0);
                setFemale(0);
                setSortBy(null);
              }}
            />
          </button>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row gap-8 mb-8">
            <div className="flex flex-col">
              <input
                type="range"
                id="male"
                name="male"
                min="0"
                max="100"
                value={male}
                onChange={(e) => setMale(e.target.value)}
              />
              <label for="volume">min. male Audience ({male}%)</label>
            </div>
            <div className="flex flex-col">
              <input
                type="range"
                id="male"
                name="male"
                min="0"
                max="100"
                value={female}
                onChange={(e) => setFemale(e.target.value)}
              />
              <label for="female">min. female Audience ({female}%)</label>
            </div>
          </div>

          <h2 className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight">
            Sortieren
          </h2>

          <span className="isolate inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                sortBy === "<18" ? "bg-indigo-300" : null
              }`}
              name="<18"
              onClick={(e) => setSortBy(e.target.name)}
            >
              &lt;18
            </button>
            <button
              type="button"
              className={`relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                sortBy === "18-24" ? "bg-indigo-300" : null
              }`}
              name="18-24"
              onClick={(e) => setSortBy(e.target.name)}
            >
              18-24
            </button>
            <button
              type="button"
              className={`relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                sortBy === "25-34" ? "bg-indigo-300" : null
              }`}
              name="25-34"
              onClick={(e) => setSortBy(e.target.name)}
            >
              25-34
            </button>
            <button
              type="button"
              className={`relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                sortBy === "35-44" ? "bg-indigo-300" : null
              }`}
              name="35-44"
              onClick={(e) => setSortBy(e.target.name)}
            >
              35-44
            </button>
            <button
              type="button"
              className={`relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                sortBy === "45-54" ? "bg-indigo-300" : null
              }`}
              name="45-54"
              onClick={(e) => setSortBy(e.target.name)}
            >
              45-54
            </button>
            <button
              type="button"
              className={`relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                sortBy === "55-64" ? "bg-indigo-300" : null
              }`}
              name="55-64"
              onClick={(e) => setSortBy(e.target.name)}
            >
              55-64
            </button>
            <button
              type="button"
              className={`relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                sortBy === "65+" ? "bg-indigo-300" : null
              }`}
              name="65+"
              onClick={(e) => setSortBy(e.target.name)}
            >
              &gt;65
            </button>
          </span>
        </div>
      </div>
      <div className="container mx-auto  py-2 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredInfluencers.map((el, i) => {
            return <InfluencerCard key={i} influencer={el}></InfluencerCard>;
          })}
        </div>
      </div>
    </div>
  );
};

export default InfluencerList;
