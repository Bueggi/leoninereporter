"use client";
import gutschriften from "./gutschriften.json";

import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import ReportTemplate from "./InvoiceTemplate";

function Gutschrften() {
  const [timeframe, setTimeframe] = useState("Juni 2023");
  const [order, setOrder] = useState("Beispielbrand");
  const [info, setInfo] = useState([
    {
      dispo: 4123134,
      booking: "1.918,30 €",
      rate: "€13,00",
      impressions: 147.562,
    },
  ]);

  const reducedGutschriften = gutschriften.reduce((acc, el) => {
    const { timeframe, impressions, rate, booking, dispo, order } = el;
    if (!acc[order]) {
      acc[order] = {};
      acc[order][timeframe] = [];
      acc[order][timeframe].push({ dispo, booking, rate, impressions });
      return acc;
    } else {
      if (!acc[order][timeframe]) {
        acc[order][timeframe] = [];
        acc[order][timeframe].push({ dispo, booking, rate, impressions });
        return acc;
      } else {
        acc[order][timeframe].push({ dispo, booking, rate, impressions });
        return acc;
      }
    }
  }, {});

  const reportTemplateRef = useRef(null);

  const handleGeneratePdf = (order, timeframe) => {
    const doc = new jsPDF("p", "px", "a1", true);
    // Adding the fonts.
    doc.setFont("Inter-Regular", "normal");

    doc.html(reportTemplateRef.current, {
      async callback(doc) {
        await doc.save("./Gutschriften/" + order + "_" + timeframe);
      },
    });
  };

  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  const handleGenerateReports = async () => {
    const gutschriftKeys = Object.keys(reducedGutschriften);
    for (let i = 0; i < gutschriftKeys.length; i++) {
      const order = gutschriftKeys[i];

      const months = Object.keys(reducedGutschriften[order]);
      for (let j = 0; j < months.length; j++) {
        const monat = months[j];
        const info = reducedGutschriften[order][monat];

        setOrder(order);
        setInfo(info);
        setTimeframe(monat);

        await delay(1000);
        handleGeneratePdf(order, monat);
        await delay(5000);
      }
    }
  };
  return (
    <div>
      <button className="button" onClick={() => handleGenerateReports()}>
        tadaaa
      </button>
      <div
        ref={reportTemplateRef}
        className="px-36 py-8 w-[1262px] flex justify-center h-[1787px]"
      >
        <ReportTemplate order={order} info={info} timeframe={timeframe} />
      </div>
    </div>
  );
}

export default Gutschrften;
