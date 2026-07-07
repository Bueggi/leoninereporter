"use client";
import Papa from "papaparse";
import Report from "./Report";
import { useState } from "react";

export default function ReportParser() {
  const [results, setResults] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (output) => {
        // --- DYNAMISCHER DATUMS-FILTER ---
        // Erstellt einen String im Format "YYYY-MM-DD" für HEUTE
        const todayStr = new Date().toISOString().split("T")[0];

        // Behalte nur Daten, die VOR heute liegen
        const data = output.data.filter((row) => {
          if (!row.Date) return false;
          // Vergleich der Strings funktioniert bei ISO Format (YYYY-MM-DD) einwandfrei
          return row.Date < todayStr;
        });

        if (data.length === 0) {
          alert("Keine Daten bis gestern gefunden.");
          return;
        }

        // --- BERECHNUNG DER TOTALS (wie gehabt) ---
        const campaign = data.reduce(
          (acc, row) => {
            acc.impressions += row["Total impressions"] || 0;
            acc.revenue += row["Total CPM and CPC revenue"] || 0;
            acc.clicks += row["Total clicks"] || 0;
            acc.q1 += row["First quartiles"] || 0;
            acc.mid += row["Midpoints"] || 0;
            acc.q3 += row["Third quartiles"] || 0;
            acc.completes += row["Completes"] || 0;
            return acc;
          },
          {
            impressions: 0,
            revenue: 0,
            clicks: 0,
            q1: 0,
            mid: 0,
            q3: 0,
            completes: 0,
          },
        );

        const groupBy = (field) => {
          return data.reduce((acc, row) => {
            const key = row[field];
            if (!acc[key]) {
              acc[key] = {
                totalReach: 0,
                totalRevenue: 0,
                totalClicks: 0,
                completes: 0,
                reachByDate: [],
              };
            }
            acc[key].totalReach += row["Total impressions"] || 0;
            acc[key].totalRevenue += row["Total CPM and CPC revenue"] || 0;
            acc[key].totalClicks += row["Total clicks"] || 0;
            acc[key].completes += row["Completes"] || 0;

            const existingDate = acc[key].reachByDate.find((d) => d.date === row["Date"]);
            if (existingDate) {
              existingDate.reach += row["Total impressions"] || 0;
            } else {
              acc[key].reachByDate.push({
                date: row["Date"],
                reach: row["Total impressions"] || 0,
              });
            }

            return acc;
          }, {});
        };

        const lineItems = groupBy("Line Item");
        const creatives = groupBy("Creative");

        // Durchschnittswerte berechnen
        Object.values(lineItems).forEach(
          (item) => (item.avgVTR = (item.completes / item.totalReach) * 100),
        );
        Object.values(creatives).forEach(
          (item) => (item.avgVTR = (item.completes / item.totalReach) * 100),
        );

        const campaignDaily = data.reduce((acc, row) => {
          const date = row["Date"];
          if (!date) return acc;
          const existing = acc.find((d) => d.date === date);
          if (existing) {
            existing.reach += row["Total impressions"] || 0;
            existing.revenue += row["Total CPM and CPC revenue"] || 0;
          } else {
            acc.push({
              date,
              reach: row["Total impressions"] || 0,
              revenue: row["Total CPM and CPC revenue"] || 0,
            });
          }
          return acc;
        }, []);

        const dates = data.map((row) => row["Date"]).filter(Boolean);
        let csvMinDate = "";
        let csvMaxDate = "";
        if (dates.length > 0) {
          dates.sort();
          csvMinDate = dates[0];
          csvMaxDate = dates[dates.length - 1];
        }

        setResults({
          campaign: {
            ...campaign,
            vtr: (campaign.completes / campaign.impressions) * 100,
            ctr: (campaign.clicks / campaign.impressions) * 100,
            q1Pct: (campaign.q1 / campaign.impressions) * 100,
            midPct: (campaign.mid / campaign.impressions) * 100,
            q3Pct: (campaign.q3 / campaign.impressions) * 100,
            name: data[0]?.["Campaign"] || data[0]?.["Campaign name"] || data[0]?.["Kampagne"] || "",
            startDate: csvMinDate,
            endDate: csvMaxDate,
          },
          lineItems,
          creatives,
          daily: campaignDaily,
        });
      },
    });
  };

  return (
    <div className="p-10 font-sans">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Ad Report: Daten bis gestern</h1>
        <p className="text-gray-500">
          Heutige Daten werden automatisch gefiltert.
        </p>
      </div>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="mb-6 block"
      />

      {results && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-lg shadow">
              <p className="text-sm opacity-80">Total Impressions</p>
              <p className="text-2xl font-bold">
                {results.campaign.impressions.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-green-600 text-white rounded-lg shadow">
              <p className="text-sm opacity-80">Total revenue</p>
              <p className="text-2xl font-bold">
                {results.campaign.revenue.toFixed(2)} €
              </p>
            </div>
            <div className="p-4 bg-purple-600 text-white rounded-lg shadow">
              <p className="text-sm opacity-80">Avg. VTR</p>
              <p className="text-2xl font-bold">
                {results.campaign.vtr.toFixed(2)} %
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold border-t pt-4">
            Creatives Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results.creatives).map(([name, stat]) => (
              <div key={name} className="border p-4 rounded-xl bg-gray-50">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    Reach: <strong>{stat.totalReach.toLocaleString()}</strong>
                  </p>
                  <p>
                    Clicks: <strong>{stat.totalClicks}</strong>
                  </p>
                  <p>
                    Revenue: <strong>{stat.totalRevenue.toFixed(2)} €</strong>
                  </p>
                  <p>
                    VTR: <strong>{stat.avgVTR.toFixed(2)} %</strong>
                  </p>
                </div>
                <div className="mt-4 p-2 bg-white rounded border text-[10px] text-gray-400 max-h-24 overflow-auto">
                  Tägliche Reichweite: {JSON.stringify(stat.reachByDate)}
                </div>
              </div>
            ))}
          </div>
          <Report data={results} />
        </div>
      )}
    </div>
  );
}
