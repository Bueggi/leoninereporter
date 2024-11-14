"use client";

import Papa from "papaparse";
import { useState } from "react";

const campaignReports = () => {
  // const [data, setData] = useState();
  // // const [reportData, setReportData] = useState({});

  // const getTotalData = (data) => {
  //   const totalBudget =
  //     data &&
  //     data.reduce((acc, val) => {
  //       if (val["Total CPM and CPC revenue (€)"] && val.Creative !== "Total") {
  //         const parsedVal = parseFloat(
  //           val["Total CPM and CPC revenue (€)"].replace(".", ",")
  //         );
  //         console.log(val["Total CPM and CPC revenue (€)"].replace(".", ","))

  //         return acc + parsedVal;
  //       }
  //     }, 0);

  //   console.log(totalBudget, "totalBudget");
  // };

  // const handleChangeCSVChange = (e) => {
  //   const file = e.target.files[0];
  //   const reader = new FileReader();

  //   // Event listener on reader when the file
  //   // loads, we parse it and set the data.
  //   reader.onload = async ({ target }) => {
  //     const csv = Papa.parse(target.result, {
  //       header: true,
  //     });
  //     setData(csv.data);
  //   };
  //   reader.readAsText(file); // Diese Zeile startet das Einlesen
  // };
  // console.log(getTotalData(data), "data");

  return (
    <div>
      {/* <input
        type="file"
        name="fileInput"
        accept=".csv"
        onChange={handleChangeCSVChange}
      ></input>
      <button
        onClick={() => {
          const input = document.getElementsByName("fileInput")[0];
          input.value = null;
          return;
        }}
      >
        Auswahl loeschen
      </button> */}
    </div>
  );
};

export default campaignReports;
