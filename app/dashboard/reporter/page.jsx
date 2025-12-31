"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { HiddenChartFactory } from "@components/dashboard/reporter/HiddenChartFactory";
import { ReportDocument } from "@components/dashboard/reporter/ReportDocument";

// PDFViewer Client-Only importieren
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  {
    ssr: false,
    loading: () => <div className="text-white p-4">Lade PDF Engine...</div>,
  }
);

export default function ReportPage() {
  const [isClient, setIsClient] = useState(false);

  // 1. Initiale Daten (Damit das PDF nicht beim ersten Laden crasht)
  const [formData, setFormData] = useState({
    campaignName: "Sommer Kampagne 2024",
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    bookedReach: 50000,
    deliveredImpressions: 32500,
    bookedBudget: 15000,
    spentBudget: 9400,
  });

  // State für die generierten Chart-Bilder
  const [chartImages, setChartImages] = useState({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- 2. CONFIG: HIER PASSIERT DIE MAGIE ---
  // Wir verknüpfen die formData mit der Chart-Config.
  // WICHTIG: formData muss im Dependency Array stehen!
  const chartsConfig = useMemo(() => {
    // Berechnungen für die Charts
    const openReach = Math.max(
      0,
      formData.bookedReach - formData.deliveredImpressions
    );

    return [
      {
        id: "reachChart",
        type: "doughnut",
        data: {
          labels: ["Geliefert", "Offen"],
          datasets: [
            {
              data: [formData.deliveredImpressions, openReach], // <--- LIVE DATEN
              backgroundColor: ["#ab8353", "#333333"],
            },
          ],
        },
        options: {
          rotation: -90,
          circumference: 180,
        },
      },
      {
        id: "budgetChart",
        type: "bar",
        data: {
          labels: ["Gebucht", "Invest"],
          datasets: [
            {
              data: [formData.bookedBudget, formData.spentBudget], // <--- LIVE DATEN
              backgroundColor: "#ab8353",
            },
          ],
        },
      },
      // Trend Chart (Hier als Dummy, könnte auch aus formData kommen)
      {
        id: "trendChart",
        type: "line",
        data: {
          labels: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
          datasets: [
            {
              data: [120, 190, 30, 50, 20, 300, 400], // Könnte auch dynamisch sein
              borderColor: "#ab8353",
              tension: 0.4,
            },
          ],
        },
      },
    ];
  }, [formData]); // <--- WICHTIG: Re-Calculate wenn Form sich ändert

  // --- 3. DER SAMMLER ---
  const handleChartReady = (id, base64) => {
    setChartImages((prev) => {
      // Performance: State nur updaten, wenn sich das Bild wirklich geändert hat
      if (prev[id] === base64) return prev;
      return { ...prev, [id]: base64 };
    });
  };

  // Input Handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Check ob alle benötigten Charts da sind
  const allChartsReady = chartsConfig.every((config) => chartImages[config.id]);

  if (!isClient) return null; // Hydration Fix

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- LINKE SEITE: FORMULAR --- */}
      <div className="w-1/3 p-6 bg-white border-r overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          📊 Report Config
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Kampagne</label>
            <input
              name="campaignName"
              value={formData.campaignName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Start</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Ende</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <label className="block text-sm font-bold mb-1">
              Reichweite (Gebucht)
            </label>
            <input
              type="number"
              name="bookedReach"
              value={formData.bookedReach}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              Impressions (Ist)
            </label>
            <input
              type="number"
              name="deliveredImpressions"
              value={formData.deliveredImpressions}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <hr className="border-gray-200" />

          <div>
            <label className="block text-sm font-bold mb-1">
              Budget (Gebucht)
            </label>
            <input
              type="number"
              name="bookedBudget"
              value={formData.bookedBudget}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              Budget (Spent)
            </label>
            <input
              type="number"
              name="spentBudget"
              value={formData.spentBudget}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* --- HIDDEN CHART FACTORY --- 
            Dieser Bereich ist unsichtbar, aber essenziell. 
            Er reagiert auf changes in chartsConfig (durch formData changes).
        */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          {chartsConfig.map((config) => (
            <HiddenChartFactory
              key={config.id} // Wichtig: Key muss stabil sein
              id={config.id}
              type={config.type}
              data={config.data}
              onReady={handleChartReady}
            />
          ))}
        </div>
      </div>

      {/* --- RECHTE SEITE: PDF PREVIEW --- */}
      <div className="flex-1 bg-gray-700 flex justify-center items-center p-8">
        {!allChartsReady ? (
          <div className="text-white animate-pulse">
            ⚙️ Generiere Charts... ({Object.keys(chartImages).length}/
            {chartsConfig.length})
          </div>
        ) : (
          <div className="w-full h-full shadow-2xl rounded-lg overflow-hidden">
            <PDFViewer width="100%" height="100%">
              <ReportDocument data={formData} charts={chartImages} />
            </PDFViewer>
          </div>
        )}
      </div>
    </div>
  );
}
