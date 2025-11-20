"use client";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Papa from "papaparse";
import { useState } from "react";
import { toast } from "react-toastify";

const AddReports = () => {
  const [chosenFile, setChosenFile] = useState();
  const handleChangeFile = (e) => {
    setChosenFile(e.target.files[0]);
  };
  const handleSendFile = (e) => {
    e.preventDefault();
    if (!chosenFile) return toast.error("Kein File wurde ausgewählt");
    console.log(
      Papa.parse(chosenFile, {
        delimiter: ",",
        complete: (result) => {
          const output = Object.entries(result.data).map(([key, value]) => ({
            key,
            value,
          }));
          console.log(output);
        },
      })
    );

    // console.log(e.target.files[0])
    // const data = Papa.parse(csv);
    // console.log(data);
  };
  return (
    <div>
      <form onSubmit={handleSendFile}>
        <div className="col-span-full">
          <label
            htmlFor="cover-photo"
            className="block text-sm/6 font-medium text-gray-900"
          >
            CSV Datei des Abrechnungsmonats
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
              <PhotoIcon
                aria-hidden="true"
                className="mx-auto size-12 text-gray-300"
              />
              <div className="mt-4 flex text-sm/6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={handleChangeFile}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs/5 text-gray-600">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>

        <button type="submit">Abschicken</button>
      </form>
    </div>
  );
};

export default AddReports;
