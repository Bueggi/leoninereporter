import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Rocket,
  BarChart3,
  Settings,
  ChevronRight,
  Eye,
  Euro,
  MousePointer2,
  Clock,
  Target,
  Layers,
} from "lucide-react";

const Report = ({ data }) => {
  const contentRef = useRef(null);
  const logoPath = "/HoTLogo_White.png";

  // --- 1. STATE FÜR ABFRAGE ---
  const [isGenerated, setIsGenerated] = useState(false);
  const [reportName, setReportName] = useState("");
  const [targetReach, setTargetReach] = useState(100000);
  const [targetBudget, setTargetBudget] = useState(10000);
  const [startDate, setStartDate] = useState("2026-02-02");
  const [endDate, setEndDate] = useState("2026-02-28");
  const [showCreatives, setShowCreatives] = useState(true);
  const [showLineItems, setShowLineItems] = useState(true);

  const [weeklyChecks, setWeeklyChecks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReportNameChange = async (val) => {
    setReportName(val);
    if (val.trim().length > 1) {
      try {
        const res = await fetch(`/api/reports/preset?query=${encodeURIComponent(val)}`);
        const result = await res.json();
        setSuggestions(result || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setReportName(preset.campaignName);
    setStartDate(moment(preset.startDate).format("YYYY-MM-DD"));
    setEndDate(moment(preset.endDate).format("YYYY-MM-DD"));
    setTargetReach(preset.targetReach);
    setTargetBudget(preset.targetBudget);
    setWeeklyChecks(
      preset.weeklyChecks.map((wc) => ({
        weekOffset: wc.weekOffset,
        targetReach: wc.targetReach,
        targetBudget: wc.targetBudget,
      }))
    );
    setShowSuggestions(false);
  };

  const handleAddWeeklyCheck = () => {
    const nextOffset = weeklyChecks.length;
    setWeeklyChecks([
      ...weeklyChecks,
      { weekOffset: nextOffset, targetReach: 25000, targetBudget: 2500 },
    ]);
  };

  const handleUpdateWeeklyCheck = (index, field, val) => {
    const updated = [...weeklyChecks];
    updated[index][field] = +val;
    setWeeklyChecks(updated);
  };

  const handleRemoveWeeklyCheck = (index) => {
    const updated = weeklyChecks.filter((_, i) => i !== index).map((check, i) => ({
      ...check,
      weekOffset: i,
    }));
    setWeeklyChecks(updated);
  };

  const handleGenerateReport = async () => {
    try {
      await fetch("/api/reports/preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: reportName,
          targetReach: +targetReach,
          targetBudget: +targetBudget,
          startDate,
          endDate,
          weeklyChecks,
        }),
      });
    } catch (err) {
      console.error("Error saving report preset:", err);
    }
    setIsGenerated(true);
  };

  // --- 2. PRINT LOGIK ---
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: reportName || "Kampagnen_Report",
  });

  // Falls Daten noch nicht geladen sind
  if (!data || !data.campaign) {
    return <div className="p-8 text-[#a3895d]">Lade Kampagnendaten...</div>;
  }

    const formatDate = (dateStr) => {

    return new Date(dateStr).toLocaleDateString("de-DE", {

      day: "2-digit",

      month: "2-digit",

    });

  };

  // --- 3. BERECHNUNGEN (Basierend auf Inputs) ---
  const currentReach = data.campaign.impressions;
  const currentRevenue = data.campaign.revenue;
  const reachProgress = Math.min(
    (currentReach / (Number(targetReach) || 1)) * 100,
    100,
  );
  const budgetProgress = Math.min(
    (currentRevenue / (Number(targetBudget) || 1)) * 100,
    100,
  );

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const totalDays =
    Math.ceil(Math.max(0, (end - start) / (1000 * 60 * 60 * 24))) || 0;
  const daysSinceStart = startDate
    ? Math.min(
        totalDays,
        Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)-1)),
      )
    : 0;
  const remainingDays = Math.max(0, totalDays - daysSinceStart);

  const lineItemKey = data.lineItems && Object.keys(data.lineItems).length > 0 ? Object.keys(data.lineItems)[0] : null;
  const chartData = lineItemKey ? data.lineItems[lineItemKey].reachByDate.map((item) => ({
    date: new Date(item.date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    }),
    impressions: item.reach,
  })) : [];

  const totalClicks = data.creatives ? Object.values(data.creatives).reduce((acc, c) => acc + c.totalClicks, 0) : 0;



  const chunkArray = (arr, size) => {
    return arr.reduce(
      (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
      [],
    );
  };
  
  // Create chunks only if toggle is enabled and data exists
  const creativeChunks = showCreatives && data.creatives ? chunkArray(Object.entries(data.creatives), 2) : [];
  const lineItemChunks = showLineItems && data.lineItems ? chunkArray(Object.entries(data.lineItems), 2) : [];
  
  // Budget Calculations
  const bookedBudget = Number(targetBudget) || 0;
  const pacingMultiplier = totalDays > 0 ? daysSinceStart / totalDays : 0;
  const shouldSpend = bookedBudget * pacingMultiplier; // Soll
  const actualSpend = currentRevenue; // Ist
  const deltaSpend = actualSpend - shouldSpend; // Ist vs Soll
  const deltaPercent = shouldSpend > 0 ? (deltaSpend / shouldSpend) * 100 : 0;

  // --- 4. SETUP VIEW (FORMULAR) ---
  if (!isGenerated) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#a3895d] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#121212] border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-2 border-b border-zinc-800 pb-4 text-[#a3895d]">
            <Settings size={20} />
            <h2 className="text-xl  uppercase tracking-widest">Report Setup</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1 relative" ref={suggestionsRef}>
              <label className="text-[10px] text-zinc-300 uppercase ">
                Kampagnen Name
              </label>
              <input
                type="text"
                placeholder="z.B. Brand Flight II"
                value={reportName}
                onChange={(e) => handleReportNameChange(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded p-2 text-[#a3895d] outline-none focus:border-[#a3895d]"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[#121212] border border-zinc-800 rounded-lg max-h-48 overflow-y-auto shadow-2xl divide-y divide-zinc-900">
                  {suggestions.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 hover:bg-[#a3895d] hover:text-black cursor-pointer transition-colors text-xs flex justify-between items-center"
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <span className="font-bold text-zinc-200">{preset.campaignName}</span>
                      <span className="text-[9px] text-[#a3895d] font-mono">
                        {moment(preset.startDate).format("DD.MM.YY")} - {moment(preset.endDate).format("DD.MM.YY")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-300 uppercase ">
                  Startdatum
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-[#a3895d] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-300 uppercase ">
                  Enddatum
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-[#a3895d] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-300 uppercase ">
                Target Impressions
              </label>
              <input
                type="number"
                value={targetReach}
                onChange={(e) => setTargetReach(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded p-2 text-[#a3895d] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-300 uppercase ">
                Ziel-Budget (€)
              </label>
              <input
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded p-2 text-[#a3895d] outline-none"
              />
            </div>

            {/* Editable Weekly Checks Table */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">
                  Wöchentliche Kontrollpunkte
                </label>
                <button
                  type="button"
                  onClick={handleAddWeeklyCheck}
                  className="text-[9px] bg-[#a3895d] text-black px-2 py-1 rounded hover:bg-[#8e764d]"
                >
                  + Woche hinzufügen
                </button>
              </div>

              {weeklyChecks.length > 0 ? (
                <div className="max-h-40 overflow-y-auto border border-zinc-800 rounded bg-black">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-[#121212] border-b border-zinc-800 text-zinc-400">
                      <tr>
                        <th className="p-2">Woche</th>
                        <th className="p-2 text-right">Ziel Imp.</th>
                        <th className="p-2 text-right">Ziel Budget (€)</th>
                        <th className="p-2 text-center">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {weeklyChecks.map((check, index) => (
                        <tr key={index}>
                          <td className="p-2 font-bold text-[#a3895d]">Woche {check.weekOffset + 1}</td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={check.targetReach}
                              onChange={(e) => handleUpdateWeeklyCheck(index, "targetReach", e.target.value)}
                              className="w-20 bg-zinc-950 border border-zinc-800 rounded p-1 text-right text-[#a3895d]"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={check.targetBudget}
                              onChange={(e) => handleUpdateWeeklyCheck(index, "targetBudget", e.target.value)}
                              className="w-20 bg-zinc-950 border border-zinc-800 rounded p-1 text-right text-[#a3895d]"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveWeeklyCheck(index)}
                              className="text-red-500 hover:text-red-400 text-[10px]"
                            >
                              Löschen
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-500 italic">Keine wöchentlichen Kontrollpunkte definiert.</p>
              )}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-8 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={showCreatives} 
                        onChange={(e) => setShowCreatives(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d] focus:ring-offset-black"
                    />
                    <span className="text-[10px] text-zinc-300 uppercase group-hover:text-[#a3895d] transition-colors">Creatives anzeigen</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={showLineItems} 
                        onChange={(e) => setShowLineItems(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d] focus:ring-offset-black"
                    />
                    <span className="text-[10px] text-zinc-300 uppercase group-hover:text-[#a3895d] transition-colors">Line Items anzeigen</span>
                </label>
            </div>

            <button
              onClick={handleGenerateReport}
              className="w-full bg-[#a3895d] text-black  py-3 rounded uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:bg-[#8e764d] transition-colors"
            >
              Report generieren <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 5. REPORT VIEW (LOCKED A4) ---
  const reportingDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-900 py-12 font-sans text-[#a3895d]">
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 0; }
            body { background: #050505 !important; -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
          .a4-container {
            width: 297mm;
            height: 210mm;
            margin: 0 auto;
            background: #050505;
            padding: 12mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            page-break-after: always;
            overflow: hidden;
          }
        `}
      </style>

      {/* Control Bar */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center no-print">
        <button
          onClick={() => setIsGenerated(false)}
          className="text-[10px] text-zinc-300 uppercase  hover:text-[#a3895d]"
        >
          ← Zurück zum Setup
        </button>
        <button
          onClick={() => handlePrint()}
          className="bg-[#a3895d] text-white text-[10px]  uppercase px-8 py-3 rounded-lg shadow-lg hover:bg-[#8e764d] transition-colors"
        >
          PDF Export starten
        </button>
      </div>

      <div ref={contentRef}>
        {/* Page 1: Summary */}
        <div className="a4-container">
          <header className="flex justify-between items-end border-b border-zinc-800 pb-4 h-[60px] shrink-0">
            <div className="flex items-center gap-4">
              <img src={logoPath} alt="Logo" className="h-8 w-auto" />
              <div className="h-8 w-px bg-zinc-800" />
              <h1 className="text-xl font-semibold text-[#a3895d] uppercase tracking-tight ">
                {reportName || "PERFORMANCE REPORT"}
              </h1>
            </div>
            <div className="text-right text-[9px] text-zinc-400 font-mono uppercase flex flex-col gap-1">
              <div className="flex items-center justify-end gap-4">
                <span>Start: <span className="text-zinc-200">{startDate}</span></span>
                <span>Ende: <span className="text-zinc-200">{endDate}</span></span>
              </div>
              <div>
                <span>Reporting: <span className="text-[#a3895d]">{reportingDate}</span></span>
              </div>
            </div>
          </header>

          <div className="flex-grow flex flex-col justify-between py-6 gap-6 min-h-0">
            <div className="grid grid-cols-3 gap-6 h-[250px] shrink-0">
              <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 col-span-2 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <Target size={16} className="text-[#a3895d]" />
                  <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">REACH PROGRESS</span>
                </div>
                <div className="flex items-center gap-10 flex-grow">
                  <div className="w-4/5 h-full flex flex-col justify-end">
                  <div className="w-full h-[160px] relative">
                    {" "}
                    {/* Kein overflow-hidden hier, damit wir sehen, wo die Zahl landet */}
                    {/* 1. Der Chart-Container füllt die 350px aus */}
                    <div className="w-full h-[300px] absolute top-0 left-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { value: reachProgress, fill: "#a3895d" },
                              { value: 100 - reachProgress, fill: "#1f1f23" },
                            ]}
                            cx="50%"
                            cy="50%" // Mittelpunkt des Bogens
                            startAngle={180}
                            endAngle={0}
                            innerRadius="75%"
                            outerRadius="100%"
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={false}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* 2. Die Zahl: Absolut zentriert basierend auf dem cy="60%" Wert oben */}
                    <div
                      className="absolute left-1/2 flex flex-col items-center"
                      style={{
                        top: "65%", // Moving up
                        transform: "translate(-50%, -10%)", 
                      }}
                    >
                      <span className="text-2xl font-bold text-[#a3895d] leading-none tracking-tighter drop-shadow-lg mb-1">
                        {reachProgress.toFixed(1)}%
                      </span>
                        <div className="flex flex-col items-center space-y-0.5">
                          <span className="text-sm font-medium text-zinc-200 leading-none">{Number(currentReach).toLocaleString()}</span>
                          <span className="text-[7px] text-zinc-500 uppercase tracking-[0.2em]">Delivered</span>
                        </div>
                      </div>
                    {/* Start/End Labels */}
                    <div className="absolute w-full -bottom-2 px-8 flex justify-between text-[9px] font-mono text-zinc-400 uppercase">
                      <span className="ml-2">0</span>
                      <span>{Number(targetReach).toLocaleString()}</span>
                    </div>
                    </div>
                  </div>
                <div className="self-center w-1/2 space-y-1.5 border-l border-zinc-900 pl-8 text-[9px] uppercase  text-zinc-300">
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span>25% View Through</span>
                    <span className="text-[#a3895d]">
                      {data.campaign.q1Pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span>50% View Through</span>
                    <span className="text-[#a3895d]">
                      {data.campaign.midPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span>75% View Through</span>
                    <span className="text-[#a3895d]">
                      {data.campaign.q3Pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>100% View Through</span>
                    <span className="text-[#a3895d]">
                      {data.campaign.vtr.toFixed(1)}%
                    </span>
                  </div>
                </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 h-full"> 
                {/* Time Card */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock size={16} className="text-[#a3895d]" />
                    <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">CAMPAIGN DURATION</span>
                  </div>
                  <div className="flex justify-around items-center flex-grow">
                    <div>
                      <div className="text-xl   text-[#a3895d]">{totalDays}</div>
                      <div className="text-[7px] text-zinc-300 uppercase ">
                        Laufzeit
                      </div>
                    </div>
                    <div>
                      <div className="text-xl   text-[#a3895d]">
                        {daysSinceStart}
                      </div>
                      <div className="text-[7px] text-zinc-300 uppercase ">
                        Seit Start
                      </div>
                    </div>
                    <div>
                      <div className="text-xl   text-[#a3895d]">
                        {remainingDays}
                      </div>
                      <div className="text-[7px] text-zinc-300 uppercase ">
                        Rest
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Card */}
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={16} className="text-[#a3895d]" />
                    <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">PERFORMANCE METRICS</span>
                  </div>
                  <div className="flex justify-around items-center flex-grow">
                    <div>
                      <div className="text-xl text-[#a3895d]">{totalClicks}</div>
                       <div className="text-[7px] text-zinc-300 uppercase ">
                        Clicks
                      </div>
                    </div>
                     <div>
                      <div className="text-xl text-[#a3895d] tracking-tighter">
                        {data.campaign.ctr.toFixed(2)}%
                      </div>
                      <div className="text-[7px] text-zinc-300 uppercase ">
                        CTR
                      </div>
                    </div>
                     <div>
                      <div className="text-xl text-[#a3895d]">
                        {data.campaign.vtr.toFixed(1)}%
                      </div>
                      <div className="text-[7px] text-zinc-300 uppercase ">
                        Avg. VTR
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW ROW: Impression Chart (Left) + Budget (Right) */}
            <div className="flex gap-6 h-[300px] shrink-0 min-h-0">
               {/* 1. Impression Chart - Takes 2/3 width */}
               <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 relative w-2/3 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={16} className="text-[#a3895d]" />
                    <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">IMPRESSION TREND</span>
                  </div>
                  <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1a1a1a"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#d4d4d8"
                          fontSize={9}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#d4d4d8"
                          fontSize={9}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Line
                          type="monotone"
                          dataKey="impressions"
                          stroke="#a3895d"
                          strokeWidth={3}
                          dot={{ r: 3, fill: "#a3895d" }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* 2. Budget Card - Takes 1/3 width, full height of this row */}
               <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 w-1/3 flex flex-col justify-between relative overflow-hidden group">
                  {/* Abstract Background Decoration using HoTLogo_White */}
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 opacity-[0.03] rotate-12 pointer-events-none grayscale invert">
                      <img 
                        src="/HoTLogo_White.png" 
                        alt="" 
                        className="w-full h-full object-contain" 
                      />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Euro size={16} className="text-[#a3895d]" />
                      <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">BUDGET UTILIZATION</span>
                    </div>
                    
                    <div className="mb-3 flex justify-end">
                       <span className="text-xl font-bold text-[#a3895d] leading-none">
                        {budgetProgress.toFixed(1)}%
                      </span>
                    </div>

                    <div className="relative h-2 w-full bg-[#d4d4d8] rounded-full overflow-hidden border border-zinc-900 shadow-inner mb-1">
                      <div
                        className="absolute left-0 top-0 h-full bg-[#a3895d]"
                        style={{ width: `${budgetProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Detailed Budget Metrics - Grid 2x2, moved higher up */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 relative z-10">
                      <div>
                          <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">Gebuchtes</div>
                          <div className="text-sm text-[#a3895d]">€ {bookedBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                      </div>
                      <div>
                          <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">Soll</div>
                          <div className="text-sm text-zinc-300">€ {shouldSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                      </div>
                      <div>
                          <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">Ist</div>
                          <div className={`text-sm ${actualSpend >= shouldSpend ? 'text-green-500' : 'text-red-500'}`}>€ {actualSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
                      </div>
                      <div>
                          <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">Delta</div>
                          <div className={`text-sm ${deltaSpend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {deltaSpend >= 0 ? '+' : ''}{deltaSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0})}
                          </div>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

      {/* Page 2: Weekly Performance Checks */}
      {weeklyChecks && weeklyChecks.length > 0 && (
        <div className="a4-container flex flex-col justify-between">
          <header className="flex justify-between items-end border-b border-zinc-800 pb-4 h-[60px] shrink-0">
            <div className="flex items-center gap-4">
              <img src={logoPath} alt="Logo" className="h-8 w-auto" />
              <div className="h-8 w-px bg-zinc-800" />
              <h1 className="text-xl font-semibold text-[#a3895d] uppercase tracking-tight ">
                WÖCHENTLICHE KONTROLLPUNKTE
              </h1>
            </div>
            <div className="text-right text-[9px] text-zinc-400 font-mono uppercase flex flex-col gap-1">
              <div className="flex items-center justify-end gap-4">
                <span>Start: <span className="text-zinc-200">{startDate}</span></span>
                <span>Ende: <span className="text-zinc-200">{endDate}</span></span>
              </div>
              <div>
                <span>Reporting: <span className="text-[#a3895d]">{reportingDate}</span></span>
              </div>
            </div>
          </header>

          <div className="flex-grow py-6 overflow-hidden flex flex-col justify-center">
            <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col h-[340px]">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <Clock size={16} className="text-[#a3895d]" />
                <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">IST VS. SOLL VERGLEICH</span>
              </div>

              <div className="flex-grow overflow-auto">
                <table className="w-full text-left text-xs text-zinc-350">
                  <thead className="text-[10px] text-zinc-450 uppercase tracking-widest border-b border-zinc-800">
                    <tr>
                      <th className="py-2">Woche</th>
                      <th className="py-2">Zeitraum</th>
                      <th className="py-2 text-right">Ziel Impressions</th>
                      <th className="py-2 text-right">Ist Impressions</th>
                      <th className="py-2 text-right">Delta Imp.</th>
                      <th className="py-2 text-right">Ziel Budget</th>
                      <th className="py-2 text-right">Ist Budget</th>
                      <th className="py-2 text-right">Delta Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-mono">
                    {weeklyChecks.map((check, idx) => {
                      const weekStart = moment(startDate).add(check.weekOffset * 7, "days");
                      const weekEnd = moment(startDate).add(check.weekOffset * 7 + 6, "days");
                      const isEndPastCampaign = weekEnd.isAfter(moment(endDate));
                      const finalEnd = isEndPastCampaign ? moment(endDate) : weekEnd;

                      // Calculate actuals
                      const actual = (data.daily || []).reduce(
                        (sum, day) => {
                          const d = moment(day.date);
                          if (d.isSameOrAfter(weekStart, "day") && d.isSameOrBefore(finalEnd, "day")) {
                            sum.reach += day.reach || 0;
                            sum.revenue += day.revenue || 0;
                          }
                          return sum;
                        },
                        { reach: 0, revenue: 0 }
                      );

                      const deltaReach = actual.reach - check.targetReach;
                      const deltaRevenue = actual.revenue - check.targetBudget;

                      return (
                        <tr key={idx} className="hover:bg-zinc-950">
                          <td className="py-2 font-bold text-[#a3895d]">Woche {check.weekOffset + 1}</td>
                          <td className="py-2 text-zinc-400 text-[10px]">
                            {weekStart.format("DD.MM.")} – {finalEnd.format("DD.MM.")}
                          </td>
                          <td className="py-2 text-right">{Number(check.targetReach).toLocaleString()}</td>
                          <td className="py-2 text-right text-zinc-200">{Number(actual.reach).toLocaleString()}</td>
                          <td className={`py-2 text-right font-bold ${deltaReach >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {deltaReach >= 0 ? "+" : ""}{deltaReach.toLocaleString()}
                          </td>
                          <td className="py-2 text-right">€ {Number(check.targetBudget).toLocaleString()}</td>
                          <td className="py-2 text-right text-zinc-200">€ {actual.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                          <td className={`py-2 text-right font-bold ${deltaRevenue >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {deltaRevenue >= 0 ? "+" : ""}€ {deltaRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creative Pages - 2 per Page */}
      {creativeChunks.map((chunk, pageIndex) => (
        <div key={`creative-page-${pageIndex}`} className="a4-container flex flex-col">
          <div className="flex-grow flex flex-col">
            {chunk.map(([name, creative]) => (
              <div 
                key={name} 
                className="h-[50%] w-full p-4 box-border"
              >
                <div className="h-full w-full bg-[#121212] border border-zinc-800 rounded-2xl flex overflow-hidden shadow-lg">
                    {/* Left: Chart - Wider (60%) */}
                    <div className="w-[60%] p-6 flex flex-col bg-gradient-to-br from-[#121212] to-black">
                      <div className="flex items-center gap-2 mb-6 shrink-0">
                        <Layers size={16} className="text-[#a3895d]" />
                        <h3 className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold truncate">
                          {name}
                        </h3>
                      </div>
                      <div className="flex-grow min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={creative.reachByDate}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#d4d4d8" 
                          fontSize={8} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={formatDate} 
                          dy={5}
                        />
                            <YAxis hide domain={["auto", "auto"]} />
                            <Line
                              type="monotone"
                              dataKey="reach"
                              stroke="#a3895d"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, fill: "#fff", stroke: "#a3895d" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Separator - Partial Height & Centered */}
                    <div className="w-px bg-zinc-800 h-[60%] self-center opacity-50" />

                    {/* Right: Stats - Narrower (40%) but pushed right */}
                    <div className="w-[40%] p-6 bg-[#121212] flex flex-col justify-center pl-8">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                        {/* Reach */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <Eye size={10} /> Total Reach
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            {creative.totalReach.toLocaleString()}
                          </p>
                        </div>

                        {/* Revenue */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <Euro size={10} /> Revenue
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            € {creative.totalRevenue.toFixed(2)}
                          </p>
                        </div>

                        {/* VTR */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <BarChart3 size={10} /> Avg. VTR
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            {creative.avgVTR.toFixed(1)}%
                          </p>
                        </div>

                        {/* Clicks */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <MousePointer2 size={10} /> Clicks
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            {creative.totalClicks}
                          </p>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Line Item Pages - 2 per Page (Exact clone of Creatives) */}
      {lineItemChunks.map((chunk, pageIndex) => (
        <div key={`lineitem-page-${pageIndex}`} className="a4-container flex flex-col">
          <div className="flex-grow flex flex-col">
            {chunk.map(([name, item]) => (
              <div 
                key={name} 
                className="h-[50%] w-full p-4 box-border"
              >
                <div className="h-full w-full bg-[#121212] border border-zinc-800 rounded-2xl flex overflow-hidden shadow-lg">
                    {/* Left: Chart - Wider (60%) */}
                    <div className="w-[60%] p-6 flex flex-col bg-gradient-to-br from-[#121212] to-black">
                      <div className="flex items-center gap-2 mb-6 shrink-0">
                        <Layers size={16} className="text-[#a3895d]" />
                        <h3 className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold truncate">
                          {name}
                        </h3>
                      </div>
                      <div className="flex-grow min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={item.reachByDate}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#d4d4d8" 
                          fontSize={8} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={formatDate} 
                          dy={5}
                        />
                            <YAxis hide domain={["auto", "auto"]} />
                            <Line
                              type="monotone"
                              dataKey="reach"
                              stroke="#a3895d"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, fill: "#fff", stroke: "#a3895d" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Separator - Partial Height & Centered */}
                    <div className="w-px bg-zinc-800 h-[60%] self-center opacity-50" />

                    {/* Right: Stats - Narrower (40%) but pushed right */}
                    <div className="w-[40%] p-6 bg-[#121212] flex flex-col justify-center pl-8">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                        {/* Reach */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <Eye size={10} /> Total Reach
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            {item.totalReach.toLocaleString()}
                          </p>
                        </div>

                        {/* Revenue */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <Euro size={10} /> Revenue
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            € {item.totalRevenue.toFixed(2)}
                          </p>
                        </div>

                        {/* VTR */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <BarChart3 size={10} /> Avg. VTR
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            {item.avgVTR.toFixed(1)}%
                          </p>
                        </div>

                        {/* Clicks */}
                        <div className="space-y-1 border-l-2 border-zinc-800 pl-4">
                          <p className="text-[9px] text-zinc-300 uppercase font-black flex items-center gap-1.5">
                            <MousePointer2 size={10} /> Clicks
                          </p>
                          <p className="text-xl text-[#a3895d] tracking-tighter">
                            {item.totalClicks}
                          </p>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default Report;
