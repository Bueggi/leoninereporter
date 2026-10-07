"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Papa from "papaparse";
import moment from "moment";
import Report from "./Report";
import {
  exportCampaignToExcel,
  exportCampaignToCSV,
  exportBulkCampaignsToExcel,
  calculateBudgetMetrics,
  getGermanDateString,
  sanitizeFileName,
} from "./exportUtils";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Euro,
  Eye,
  MousePointer2,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  ArrowUpRight,
  Edit3,
  SlidersHorizontal,
  X,
  FileUp,
  BarChart3,
  Check,
  FilePieChart,
  LayoutGrid,
  Trash2,
  RotateCcw,
  FolderCheck,
  AlertTriangle,
} from "lucide-react";

const normalizeDateStr = (dateVal) => {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    const m = moment(dateVal);
    return m.isValid() ? m.format("YYYY-MM-DD") : "";
  }
  const str = String(dateVal).trim();
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // German format: DD.MM.YYYY or DD.MM.YY (e.g. 30.08.2026, 30.08.26, 7.9.2026)
  const deMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (deMatch) {
    const day = deMatch[1].padStart(2, "0");
    const month = deMatch[2].padStart(2, "0");
    let year = deMatch[3];
    if (year.length === 2) {
      year = "20" + year;
    }
    const isoCandidate = `${year}-${month}-${day}`;
    if (moment(isoCandidate, "YYYY-MM-DD", true).isValid()) {
      return isoCandidate;
    }
  }

  // Slash format: DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let year = slashMatch[3];
    if (year.length === 2) year = "20" + year;
    const p1 = slashMatch[1].padStart(2, "0");
    const p2 = slashMatch[2].padStart(2, "0");
    const isoCandidate = `${year}-${p2}-${p1}`;
    if (moment(isoCandidate, "YYYY-MM-DD", true).isValid()) {
      return isoCandidate;
    }
  }

  const formats = [
    "DD.MM.YYYY",
    "DD.MM.YY",
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "MM/DD/YYYY",
    "YYYY/MM/DD",
  ];
  for (const fmt of formats) {
    const m = moment(str, fmt, true);
    if (m.isValid()) return m.format("YYYY-MM-DD");
  }

  const mFallback = moment(str);
  if (mFallback.isValid()) return mFallback.format("YYYY-MM-DD");

  return str;
};

const getRowDate = (r) => {
  if (!r) return "";
  const raw =
    r["Date"] ??
    r["date"] ??
    r["Datum"] ??
    r["Day"] ??
    r["Tag"] ??
    r["Date / Time"] ??
    r["Date/Time"] ??
    "";
  return normalizeDateStr(raw);
};

const getRowCampaignName = (r) => {
  if (!r) return "Unbekannte Kampagne";
  const raw =
    r["Order"] ??
    r["Campaign"] ??
    r["Campaign name"] ??
    r["Campaign Name"] ??
    r["Kampagne"] ??
    r["Kampagnenname"] ??
    r["order_name"] ??
    "Unbekannte Kampagne";
  return String(raw).trim();
};

export default function ReportParser() {
  // Main mode switcher: "single" (Einzelreporting) vs "bulk" (Massenreporting)
  const [reportingMode, setReportingMode] = useState("single");

  // -------------------------------------------------------------
  // 1. STATE FÜR EINZELREPORTING (Klassischer Modus)
  // -------------------------------------------------------------
  const [singleResults, setSingleResults] = useState(null);
  const [singleFileName, setSingleFileName] = useState("");
  const singleFileInputRef = useRef(null);

  const handleSingleFileUpload = (file) => {
    if (!file) return;
    setSingleFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (output) => {
        const data = output.data.filter((row) => Boolean(getRowDate(row)));

        if (data.length === 0) {
          alert("Keine gültigen Daten in der CSV-Datei gefunden.");
          return;
        }

        const campaign = data.reduce(
          (acc, row) => {
            acc.impressions += Number(row["Total impressions"] || row["Impressions"] || 0);
            acc.revenue += Number(
              row["Total revenue"] ??
                row["Total CPM and CPC revenue"] ??
                row["Total CPM and CPC revenue (€)"] ??
                row["Revenue"] ??
                0
            );
            acc.clicks += Number(row["Total clicks"] || row["Clicks"] || 0);
            acc.q1 += Number(row["First quartiles"] || 0);
            acc.mid += Number(row["Midpoints"] || 0);
            acc.q3 += Number(row["Third quartiles"] || 0);
            acc.completes += Number(row["Completes"] || 0);
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
          }
        );

        const groupBy = (field) => {
          return data.reduce((acc, row) => {
            const key = row[field] || (field === "Line Item" ? row["adgapid_booking"] : "Standard");
            if (!key) return acc;
            if (!acc[key]) {
              acc[key] = {
                totalReach: 0,
                totalRevenue: 0,
                totalClicks: 0,
                completes: 0,
                reachByDate: [],
              };
            }
            const impressions = Number(row["Total impressions"] || row["Impressions"] || 0);
            const revenue = Number(
              row["Total revenue"] ??
                row["Total CPM and CPC revenue"] ??
                row["Total CPM and CPC revenue (€)"] ??
                row["Revenue"] ??
                0
            );
            const clicks = Number(row["Total clicks"] || row["Clicks"] || 0);
            const completes = Number(row["Completes"] || 0);

            acc[key].totalReach += impressions;
            acc[key].totalRevenue += revenue;
            acc[key].totalClicks += clicks;
            acc[key].completes += completes;

            const rDate = getRowDate(row);
            const existingDate = acc[key].reachByDate.find((d) => d.date === rDate);
            if (existingDate) {
              existingDate.reach += impressions;
            } else {
              acc[key].reachByDate.push({
                date: rDate,
                reach: impressions,
              });
            }

            return acc;
          }, {});
        };

        const lineItems = groupBy("Line Item");
        const creatives = groupBy("Creative");

        Object.values(lineItems).forEach((item) => {
          item.avgVTR = item.totalReach > 0 ? (item.completes / item.totalReach) * 100 : 0;
          item.reachByDate.sort((a, b) => (a.date > b.date ? 1 : -1));
        });
        Object.values(creatives).forEach((item) => {
          item.avgVTR = item.totalReach > 0 ? (item.completes / item.totalReach) * 100 : 0;
          item.reachByDate.sort((a, b) => (a.date > b.date ? 1 : -1));
        });

        const campaignDailyMap = {};
        data.forEach((row) => {
          const date = getRowDate(row);
          if (!date) return;
          if (!campaignDailyMap[date]) {
            campaignDailyMap[date] = { date, reach: 0, revenue: 0 };
          }
          campaignDailyMap[date].reach += Number(row["Total impressions"] || row["Impressions"] || 0);
          campaignDailyMap[date].revenue += Number(
            row["Total revenue"] ??
              row["Total CPM and CPC revenue"] ??
              row["Total CPM and CPC revenue (€)"] ??
              row["Revenue"] ??
              0
          );
        });
        const campaignDaily = Object.values(campaignDailyMap).sort((a, b) => (a.date > b.date ? 1 : -1));

        const dates = data.map((row) => getRowDate(row)).filter(Boolean).sort();
        let csvMinDate = "";
        let csvMaxDate = "";
        if (dates.length > 0) {
          csvMinDate = dates[0];
          csvMaxDate = dates[dates.length - 1];
        }

        const impressions = campaign.impressions;
        setSingleResults({
          campaign: {
            ...campaign,
            vtr: impressions > 0 ? (campaign.completes / impressions) * 100 : 0,
            ctr: impressions > 0 ? (campaign.clicks / impressions) * 100 : 0,
            q1Pct: impressions > 0 ? (campaign.q1 / impressions) * 100 : 0,
            midPct: impressions > 0 ? (campaign.mid / impressions) * 100 : 0,
            q3Pct: impressions > 0 ? (campaign.q3 / impressions) * 100 : 0,
            name:
              data[0]?.["Campaign"] ||
              data[0]?.["Campaign name"] ||
              data[0]?.["Kampagne"] ||
              data[0]?.["Order"] ||
              "",
            startDate: csvMinDate,
            endDate: csvMaxDate,
          },
          lineItems,
          creatives,
          daily: campaignDaily,
          rawRows: data,
        });
      },
    });
  };

  // -------------------------------------------------------------
  // 2. STATE FÜR MASSENREPORTING (Weekly Multi-Campaign Hub)
  // -------------------------------------------------------------
  const [bulkCsvFile, setBulkCsvFile] = useState(null);
  const [bulkFileName, setBulkFileName] = useState("");
  const [presets, setPresets] = useState([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);

  const [rawCampaignsData, setRawCampaignsData] = useState(null);
  const [unconfiguredForms, setUnconfiguredForms] = useState({});
  const [savingMap, setSavingMap] = useState({});

  const [selectedCampaigns, setSelectedCampaigns] = useState(new Set());
  const [bulkReachTab, setBulkReachTab] = useState("active_vorwoche"); // "active_vorwoche" | "inactive_vorwoche"
  const [bulkStatusFilter, setBulkStatusFilter] = useState("configured"); // "configured" | "unconfigured" | "all"
  const [bulkSearchQuery, setBulkSearchQuery] = useState("");

  const [showCreatives, setShowCreatives] = useState(true);
  const [showLineItems, setShowLineItems] = useState(true);
  const [useIndividualExportOptions, setUseIndividualExportOptions] = useState(true);
  const [campaignOptionsMap, setCampaignOptionsMap] = useState({});

  const getCampaignOptions = (campaignName) => {
    if (!useIndividualExportOptions) {
      return {
        showCreatives,
        showLineItems,
      };
    }
    return (
      campaignOptionsMap[campaignName] || {
        showCreatives,
        showLineItems,
      }
    );
  };

  const toggleCampaignOption = async (campaignName, key) => {
    const currentOpts = campaignOptionsMap[campaignName] || {
      showCreatives,
      showLineItems,
    };
    const updatedOpts = {
      ...currentOpts,
      [key]: !currentOpts[key],
    };

    setCampaignOptionsMap((prev) => ({
      ...prev,
      [campaignName]: updatedOpts,
    }));

    const existingPreset = (presets || []).find(
      (p) => p.campaignName.toLowerCase() === campaignName.toLowerCase()
    );

    if (existingPreset) {
      try {
        await fetch("/api/reports/preset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignName: existingPreset.campaignName,
            targetReach: existingPreset.targetReach,
            targetBudget: existingPreset.targetBudget,
            startDate: existingPreset.startDate,
            endDate: existingPreset.endDate,
            showCreatives: updatedOpts.showCreatives,
            showLineItems: updatedOpts.showLineItems,
          }),
        });
      } catch (err) {
        console.error("Fehler beim Speichern der Export-Optionen:", err);
      }
    }
  };

  const [bulkViewMode, setBulkViewMode] = useState("hub"); // "hub" | "single_report" | "bulk_report"
  const [currentSingleCampaign, setCurrentSingleCampaign] = useState(null);

  const [editingPreset, setEditingPreset] = useState(null);
  const [editFormData, setEditFormData] = useState({
    campaignName: "",
    startDate: "",
    endDate: "",
    targetReach: "",
    targetBudget: "",
  });

  const bulkFileInputRef = useRef(null);
  const isInitialSelectionDone = useRef(false);

  const handleClearSingleCsv = () => {
    setSingleResults(null);
    setSingleFileName("");
    if (singleFileInputRef.current) {
      singleFileInputRef.current.value = "";
    }
  };

  const handleClearBulkCsv = () => {
    setRawCampaignsData(null);
    setBulkCsvFile(null);
    setBulkFileName("");
    setSelectedCampaigns(new Set());
    isInitialSelectionDone.current = false;
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  };

  const loadPresets = async () => {
    setIsLoadingPresets(true);
    try {
      const res = await fetch("/api/reports/preset?all=true");
      if (res.ok) {
        const data = await res.json();
        const loadedPresets = Array.isArray(data) ? data : [];
        setPresets(loadedPresets);

        const loadedOptionsMap = {};
        loadedPresets.forEach((p) => {
          if (p.campaignName) {
            loadedOptionsMap[p.campaignName] = {
              showCreatives: p.showCreatives !== undefined ? p.showCreatives : true,
              showLineItems: p.showLineItems !== undefined ? p.showLineItems : true,
            };
          }
        });
        setCampaignOptionsMap((prev) => ({ ...loadedOptionsMap, ...prev }));
      }
    } catch (err) {
      console.error("Fehler beim Laden der Presets:", err);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const handleBulkFileUpload = (file) => {
    if (!file) return;
    setBulkCsvFile(file);
    setBulkFileName(file.name);
    isInitialSelectionDone.current = false;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (output) => {
        const rows = output.data.filter((r) => getRowDate(r));

        if (rows.length === 0) {
          alert("Keine gültigen Daten in der CSV-Datei gefunden.");
          return;
        }

        const campaignsMap = {};

        rows.forEach((row) => {
          const campaignName = getRowCampaignName(row);

          if (!campaignsMap[campaignName]) {
            campaignsMap[campaignName] = {
              name: campaignName,
              rows: [],
            };
          }
          campaignsMap[campaignName].rows.push(row);
        });

        const parsedCampaigns = {};
        const initialUnconfiguredForms = {};

        Object.entries(campaignsMap).forEach(([name, { rows: cRows }]) => {
          const totals = cRows.reduce(
            (acc, row) => {
              const impressions = Number(row["Total impressions"] || row["Impressions"] || 0);
              const revenue = Number(
                row["Total revenue"] ??
                  row["Total CPM and CPC revenue"] ??
                  row["Total CPM and CPC revenue (€)"] ??
                  row["Revenue"] ??
                  0
              );
              const clicks = Number(row["Total clicks"] || row["Clicks"] || 0);
              const q1 = Number(row["First quartiles"] || 0);
              const mid = Number(row["Midpoints"] || 0);
              const q3 = Number(row["Third quartiles"] || 0);
              const completes = Number(row["Completes"] || 0);

              acc.impressions += impressions;
              acc.revenue += revenue;
              acc.clicks += clicks;
              acc.q1 += q1;
              acc.mid += mid;
              acc.q3 += q3;
              acc.completes += completes;
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
            }
          );

          const creatives = cRows.reduce((acc, row) => {
            const cName = row["Creative"] || "Standard Creative";
            if (!acc[cName]) {
              acc[cName] = {
                totalReach: 0,
                totalRevenue: 0,
                totalClicks: 0,
                completes: 0,
                reachByDate: [],
              };
            }
            const impressions = Number(row["Total impressions"] || row["Impressions"] || 0);
            const revenue = Number(
              row["Total revenue"] ??
                row["Total CPM and CPC revenue"] ??
                row["Total CPM and CPC revenue (€)"] ??
                row["Revenue"] ??
                0
            );
            const clicks = Number(row["Total clicks"] || row["Clicks"] || 0);
            const completes = Number(row["Completes"] || 0);

            acc[cName].totalReach += impressions;
            acc[cName].totalRevenue += revenue;
            acc[cName].totalClicks += clicks;
            acc[cName].completes += completes;

            const date = getRowDate(row);
            if (date) {
              const existingDate = acc[cName].reachByDate.find((d) => d.date === date);
              if (existingDate) {
                existingDate.reach += impressions;
              } else {
                acc[cName].reachByDate.push({ date, reach: impressions });
              }
            }
            return acc;
          }, {});

          const lineItems = cRows.reduce((acc, row) => {
            const lName =
              row["Line Item"] ||
              row["Line item"] ||
              row["adgapid_booking"] ||
              row["Creative target ad unit size"] ||
              row["Creative"] ||
              "Line Item";

            if (!acc[lName]) {
              acc[lName] = {
                totalReach: 0,
                totalRevenue: 0,
                totalClicks: 0,
                completes: 0,
                reachByDate: [],
              };
            }
            const impressions = Number(row["Total impressions"] || row["Impressions"] || 0);
            const revenue = Number(
              row["Total revenue"] ??
                row["Total CPM and CPC revenue"] ??
                row["Total CPM and CPC revenue (€)"] ??
                row["Revenue"] ??
                0
            );
            const clicks = Number(row["Total clicks"] || row["Clicks"] || 0);
            const completes = Number(row["Completes"] || 0);

            acc[lName].totalReach += impressions;
            acc[lName].totalRevenue += revenue;
            acc[lName].totalClicks += clicks;
            acc[lName].completes += completes;

            const date = getRowDate(row);
            if (date) {
              const existingDate = acc[lName].reachByDate.find((d) => d.date === date);
              if (existingDate) {
                existingDate.reach += impressions;
              } else {
                acc[lName].reachByDate.push({ date, reach: impressions });
              }
            }
            return acc;
          }, {});

          Object.values(creatives).forEach((c) => {
            c.avgVTR = c.totalReach > 0 ? (c.completes / c.totalReach) * 100 : 0;
            c.reachByDate.sort((a, b) => (a.date > b.date ? 1 : -1));
          });
          Object.values(lineItems).forEach((item) => {
            item.avgVTR = item.totalReach > 0 ? (item.completes / item.totalReach) * 100 : 0;
            item.reachByDate.sort((a, b) => (a.date > b.date ? 1 : -1));
          });

          const dailyMap = {};
          cRows.forEach((row) => {
            const date = getRowDate(row);
            if (!date) return;
            if (!dailyMap[date]) {
              dailyMap[date] = { date, reach: 0, revenue: 0 };
            }
            dailyMap[date].reach += Number(row["Total impressions"] || row["Impressions"] || 0);
            dailyMap[date].revenue += Number(
              row["Total revenue"] ??
                row["Total CPM and CPC revenue"] ??
                row["Total CPM and CPC revenue (€)"] ??
                row["Revenue"] ??
                0
            );
          });
          const daily = Object.values(dailyMap).sort((a, b) => (a.date > b.date ? 1 : -1));

          const dates = cRows
            .map((r) => getRowDate(r))
            .filter(Boolean)
            .sort();
          const minDate = dates[0] || moment().format("YYYY-MM-01");
          const maxDate = dates[dates.length - 1] || moment().format("YYYY-MM-DD");

          const impressions = totals.impressions;
          const vtr = impressions > 0 ? (totals.completes / impressions) * 100 : 0;
          const ctr = impressions > 0 ? (totals.clicks / impressions) * 100 : 0;
          const q1Pct = impressions > 0 ? (totals.q1 / impressions) * 100 : 0;
          const midPct = impressions > 0 ? (totals.mid / impressions) * 100 : 0;
          const q3Pct = impressions > 0 ? (totals.q3 / impressions) * 100 : 0;

          parsedCampaigns[name] = {
            campaign: {
              ...totals,
              name,
              vtr,
              ctr,
              q1Pct,
              midPct,
              q3Pct,
              startDate: minDate,
              endDate: maxDate,
            },
            creatives,
            lineItems,
            daily,
            rawRows: cRows,
          };

          initialUnconfiguredForms[name] = {
            campaignName: name,
            startDate: minDate,
            endDate: maxDate,
            targetReach: Math.round(impressions * 1.1) || 100000,
            targetBudget: Math.round(totals.revenue * 1.1) || 10000,
          };
        });

        setRawCampaignsData(parsedCampaigns);
        setUnconfiguredForms(initialUnconfiguredForms);
      },
    });
  };

  // Berechne den Vorwoche-Zeitraum dynamisch anhand des neuesten Datums in den CSV-Daten
  const vorwocheRange = useMemo(() => {
    const allDates = [];
    if (rawCampaignsData) {
      Object.values(rawCampaignsData).forEach((c) => {
        (c.daily || []).forEach((d) => {
          if (d.date) {
            const iso = normalizeDateStr(d.date);
            if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) allDates.push(iso);
          }
        });
        (c.rawRows || []).forEach((r) => {
          const iso = getRowDate(r);
          if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) allDates.push(iso);
        });
      });
    }

    let maxMoment;
    if (allDates.length > 0) {
      const sortedUniqueDates = Array.from(new Set(allDates)).sort();
      const maxDateStr = sortedUniqueDates[sortedUniqueDates.length - 1];
      maxMoment = moment(maxDateStr);
    } else {
      maxMoment = moment();
    }

    let startMoment, endMoment;
    if (maxMoment.isoWeekday() === 1) {
      endMoment = maxMoment.clone().subtract(1, "day").endOf("isoWeek");
      startMoment = maxMoment.clone().subtract(1, "day").startOf("isoWeek");
    } else {
      startMoment = maxMoment.clone().startOf("isoWeek");
      endMoment = maxMoment.clone().endOf("isoWeek");
    }

    const start = startMoment.format("YYYY-MM-DD");
    const end = endMoment.format("YYYY-MM-DD");
    const label = `${startMoment.format("DD.MM.YYYY")} – ${endMoment.format("DD.MM.YYYY")} (KW ${endMoment.isoWeek()})`;

    return { start, end, label, maxDateStr: maxMoment.format("YYYY-MM-DD") };
  }, [rawCampaignsData]);

  // Kategorisiere Kampagnen: Vorwoche Reichweite vs. Keine Vorwoche Reichweite & Bereit vs. Unkonfiguriert
  const categorizedCampaigns = useMemo(() => {
    if (!rawCampaignsData) {
      return {
        activeVorwoche: { configured: [], unconfigured: [], all: [] },
        inactiveVorwoche: { configured: [], unconfigured: [], all: [] },
        configuredList: [],
        unconfiguredList: [],
        allList: [],
        totalActiveCount: 0,
        totalInactiveCount: 0,
        totalConfiguredCount: 0,
        totalUnconfiguredCount: 0,
        totalCampaignsCount: 0,
      };
    }

    const activeVorwoche = { configured: [], unconfigured: [], all: [] };
    const inactiveVorwoche = { configured: [], unconfigured: [], all: [] };
    const configuredList = [];
    const unconfiguredList = [];
    const allList = [];

    Object.entries(rawCampaignsData).forEach(([cName, campaignData]) => {
      const preset = (presets || []).find(
        (p) => p.campaignName.toLowerCase() === cName.toLowerCase()
      );

      const vorwocheReach = (campaignData.daily || [])
        .filter((d) => {
          const iso = normalizeDateStr(d.date);
          return iso >= vorwocheRange.start && iso <= vorwocheRange.end;
        })
        .reduce((sum, d) => sum + (d.reach || 0), 0);

      const item = {
        name: cName,
        campaignData,
        preset: preset || null,
        vorwocheReach,
        isConfigured: !!preset,
      };

      allList.push(item);

      if (preset) {
        configuredList.push(item);
      } else {
        unconfiguredList.push(item);
      }

      const hasReach = vorwocheReach > 0;
      const targetGroup = hasReach ? activeVorwoche : inactiveVorwoche;

      targetGroup.all.push(item);
      if (preset) {
        targetGroup.configured.push(item);
      } else {
        targetGroup.unconfigured.push(item);
      }
    });

    return {
      activeVorwoche,
      inactiveVorwoche,
      configuredList,
      unconfiguredList,
      allList,
      totalActiveCount: activeVorwoche.all.length,
      totalInactiveCount: inactiveVorwoche.all.length,
      totalConfiguredCount: configuredList.length,
      totalUnconfiguredCount: unconfiguredList.length,
      totalCampaignsCount: allList.length,
    };
  }, [rawCampaignsData, presets, vorwocheRange]);

  const configuredList = categorizedCampaigns.configuredList;
  const unconfiguredList = categorizedCampaigns.unconfiguredList;

  // Primary filtering logic combining Kampagnenmanagement status & Vorwoche reach
  const displayedList = useMemo(() => {
    if (!rawCampaignsData) return [];

    let list = [];
    if (bulkStatusFilter === "configured") {
      list = categorizedCampaigns.configuredList;
    } else if (bulkStatusFilter === "unconfigured") {
      list = categorizedCampaigns.unconfiguredList;
    } else {
      list = categorizedCampaigns.allList;
    }

    if (bulkReachTab === "active_vorwoche") {
      list = list.filter((item) => item.vorwocheReach > 0);
    } else if (bulkReachTab === "inactive_vorwoche") {
      list = list.filter((item) => item.vorwocheReach === 0);
    }

    if (bulkSearchQuery.trim()) {
      const q = bulkSearchQuery.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    return list;
  }, [rawCampaignsData, categorizedCampaigns, bulkStatusFilter, bulkReachTab, bulkSearchQuery]);

  useEffect(() => {
    if (!rawCampaignsData) {
      setSelectedCampaigns(new Set());
      isInitialSelectionDone.current = false;
      return;
    }
    if (!isInitialSelectionDone.current) {
      const activeConfigured = categorizedCampaigns.activeVorwoche.configured;
      if (activeConfigured.length > 0) {
        setSelectedCampaigns(new Set(activeConfigured.map((c) => c.name)));
      } else if (categorizedCampaigns.configuredList.length > 0) {
        setSelectedCampaigns(new Set(categorizedCampaigns.configuredList.map((c) => c.name)));
      }
      isInitialSelectionDone.current = true;
    }
  }, [categorizedCampaigns, rawCampaignsData]);

  const handleSaveUnconfigured = async (campaignName) => {
    const formData = unconfiguredForms[campaignName];
    if (!formData) return;

    setSavingMap((prev) => ({ ...prev, [campaignName]: true }));
    const opts = getCampaignOptions(campaignName);

    try {
      const res = await fetch("/api/reports/preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          targetReach: Number(formData.targetReach) || 0,
          targetBudget: Number(formData.targetBudget) || 0,
          startDate: formData.startDate,
          endDate: formData.endDate,
          showCreatives: opts.showCreatives,
          showLineItems: opts.showLineItems,
        }),
      });

      if (res.ok) {
        await loadPresets();
        setSelectedCampaigns((prev) => new Set([...prev, campaignName]));

        const campaignItem = rawCampaignsData?.[campaignName];
        if (campaignItem) {
          const vReach = (campaignItem.daily || [])
            .filter((d) => {
              const iso = normalizeDateStr(d.date);
              return iso >= vorwocheRange.start && iso <= vorwocheRange.end;
            })
            .reduce((sum, d) => sum + (d.reach || 0), 0);

          if (vReach > 0 && bulkReachTab !== "active_vorwoche") {
            setBulkReachTab("active_vorwoche");
          } else if (vReach === 0 && bulkReachTab !== "inactive_vorwoche") {
            setBulkReachTab("inactive_vorwoche");
          }
        }

        if (bulkStatusFilter === "unconfigured") {
          setBulkStatusFilter("configured");
        }
      } else {
        alert("Fehler beim Speichern des Presets.");
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [campaignName]: false }));
    }
  };

  const handleOpenEditPreset = (preset) => {
    setEditingPreset(preset);
    setEditFormData({
      campaignName: preset.campaignName,
      startDate: moment(preset.startDate).format("YYYY-MM-DD"),
      endDate: moment(preset.endDate).format("YYYY-MM-DD"),
      targetReach: preset.targetReach,
      targetBudget: preset.targetBudget,
    });
  };

  const handleSaveEditedPreset = async (e) => {
    e.preventDefault();
    if (!editingPreset) return;

    const opts = getCampaignOptions(editFormData.campaignName);

    try {
      const res = await fetch("/api/reports/preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: editFormData.campaignName,
          targetReach: Number(editFormData.targetReach) || 0,
          targetBudget: Number(editFormData.targetBudget) || 0,
          startDate: editFormData.startDate,
          endDate: editFormData.endDate,
          showCreatives: opts.showCreatives,
          showLineItems: opts.showLineItems,
        }),
      });

      if (res.ok) {
        await loadPresets();
        setEditingPreset(null);
      } else {
        alert("Fehler beim Aktualisieren des Presets.");
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern.");
    }
  };

  const toggleSelectCampaign = (name) => {
    setSelectedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const displayedConfigured = displayedList.filter((c) => c.isConfigured || c.preset);
    const displayedConfiguredNames = displayedConfigured.map((c) => c.name);
    const allSelected =
      displayedConfiguredNames.length > 0 &&
      displayedConfiguredNames.every((name) => selectedCampaigns.has(name));

    setSelectedCampaigns((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        displayedConfiguredNames.forEach((name) => next.delete(name));
      } else {
        displayedConfiguredNames.forEach((name) => next.add(name));
      }
      return next;
    });
  };

  const handleBulkExportExcel = () => {
    const campaignsToExport = configuredList.filter((c) =>
      selectedCampaigns.has(c.name)
    );

    if (campaignsToExport.length === 0) {
      alert("Bitte wähle mindestens eine bereite Kampagne aus.");
      return;
    }

    exportBulkCampaignsToExcel({
      campaignsWithPresets: campaignsToExport,
      showCreatives,
      showLineItems,
      campaignOptionsMap,
      useIndividualExportOptions,
    });

    campaignsToExport.forEach((item, index) => {
      const opts = getCampaignOptions(item.name);
      setTimeout(() => {
        exportCampaignToExcel({
          campaignData: item.campaignData,
          preset: item.preset,
          showCreatives: opts.showCreatives,
          showLineItems: opts.showLineItems,
        });
      }, (index + 1) * 250);
    });
  };

  const handleBulkExportCSV = () => {
    const campaignsToExport = configuredList.filter((c) =>
      selectedCampaigns.has(c.name)
    );

    if (campaignsToExport.length === 0) {
      alert("Bitte wähle mindestens eine bereite Kampagne aus.");
      return;
    }

    campaignsToExport.forEach((item, index) => {
      const opts = getCampaignOptions(item.name);
      setTimeout(() => {
        exportCampaignToCSV({
          campaignData: item.campaignData,
          preset: item.preset,
          showCreatives: opts.showCreatives,
          showLineItems: opts.showLineItems,
        });
      }, index * 250);
    });
  };

  // -------------------------------------------------------------
  // RENDER BULK SUB-VIEWS (Single Report / Bulk PDF Print)
  // -------------------------------------------------------------
  if (bulkViewMode === "single_report" && currentSingleCampaign) {
    const opts = getCampaignOptions(currentSingleCampaign.preset?.campaignName || currentSingleCampaign.campaignData?.campaign?.name);
    return (
      <Report
        data={currentSingleCampaign.campaignData}
        preset={currentSingleCampaign.preset}
        initialGenerated={true}
        showCreativesProp={opts.showCreatives}
        showLineItemsProp={opts.showLineItems}
        onBack={() => setBulkViewMode("hub")}
      />
    );
  }

  if (bulkViewMode === "bulk_report") {
    const selectedList = configuredList.filter((c) =>
      selectedCampaigns.has(c.name)
    );

    return (
      <div className="min-h-screen bg-zinc-900 py-8 font-sans text-[#a3895d]">
        <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-[#121212] border border-zinc-800 p-4 rounded-xl shadow-xl no-print">
          <button
            onClick={() => setBulkViewMode("hub")}
            className="text-xs text-zinc-300 uppercase tracking-wider hover:text-[#a3895d] flex items-center gap-1.5 py-2 px-3 rounded bg-zinc-900 border border-zinc-800"
          >
            ← Zurück zur Kampagnen-Übersicht
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="bg-[#a3895d] hover:bg-[#8e764d] text-black text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2"
            >
              <Printer size={16} /> Alle {selectedList.length} Reports drucken / als PDF
            </button>
          </div>
        </div>

        <div className="space-y-12">
          {selectedList.map((item) => {
            const opts = getCampaignOptions(item.name);
            return (
              <div key={item.name} className="border-b-4 border-zinc-800 pb-12">
                <Report
                  data={item.campaignData}
                  preset={item.preset}
                  initialGenerated={true}
                  showCreativesProp={opts.showCreatives}
                  showLineItemsProp={opts.showLineItems}
                  onBack={() => setBulkViewMode("hub")}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN COMPONENT VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050505] text-[#d4d4d8] p-6 lg:p-10 font-sans">
      {/* Top Main Navigation: Einzel-Report vs Massen-Report */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Kampagnen Performance Reports
          </h1>

          {/* Mode Tabs & Reset Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner">
              <button
                onClick={() => setReportingMode("single")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  reportingMode === "single"
                    ? "bg-[#a3895d] text-black shadow-lg"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FilePieChart size={16} />
                Einzel-Reporting
              </button>

              <button
                onClick={() => setReportingMode("bulk")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  reportingMode === "bulk"
                    ? "bg-[#a3895d] text-black shadow-lg"
                    : "text-zinc-400 hover:text-[#a3895d]"
                }`}
              >
                <LayoutGrid size={16} />
                Wöchentliches Massenreporting
              </button>
            </div>

            {/* Daten zurücksetzen Button */}
            {reportingMode === "bulk" && rawCampaignsData && (
              <button
                onClick={handleClearBulkCsv}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all shadow"
                title="CSV-Daten zurücksetzen und neu starten"
              >
                <RotateCcw size={15} /> Daten zurücksetzen
              </button>
            )}

            {reportingMode === "single" && singleResults && (
              <button
                onClick={handleClearSingleCsv}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all shadow"
                title="CSV-Daten zurücksetzen und neu starten"
              >
                <RotateCcw size={15} /> Daten zurücksetzen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW A: KLASSISCHES EINZELREPORTING */}
      {/* ========================================================= */}
      {reportingMode === "single" && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Upload Area for Single Campaign */}
          {!singleResults ? (
            <div className="max-w-2xl mx-auto my-12">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleSingleFileUpload(file);
                }}
                onClick={() => singleFileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-zinc-800 hover:border-[#a3895d] bg-[#121212]/80 hover:bg-[#121212] rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 shadow-2xl flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-[#a3895d]/50 flex items-center justify-center text-[#a3895d] group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Kampagnen CSV-Datei hochladen
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Lade den CSV-Export für eine einzelne Kampagne hoch, um den Performance-Report zu generieren.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-[#a3895d]">
                  <span>Format: .csv (Heutige Daten werden automatisch gefiltert)</span>
                </div>
                <input
                  ref={singleFileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSingleFileUpload(file);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-[#121212] border border-zinc-800 rounded-2xl shadow">
                  <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                    Total Impressions
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {singleResults.campaign.impressions.toLocaleString("de-DE")}
                  </p>
                </div>
                <div className="p-5 bg-[#121212] border border-zinc-800 rounded-2xl shadow">
                  <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-[#a3895d]">
                    € {singleResults.campaign.revenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-5 bg-[#121212] border border-zinc-800 rounded-2xl shadow">
                  <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                    Avg. VTR
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {singleResults.campaign.vtr.toFixed(2)} %
                  </p>
                </div>
              </div>

              {/* Creatives Quick Overview */}
              {singleResults.creatives && Object.keys(singleResults.creatives).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                    <Layers size={16} className="text-[#a3895d]" /> Creatives Performance ({Object.keys(singleResults.creatives).length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(singleResults.creatives).map(([name, stat]) => (
                      <div key={name} className="border border-zinc-800/80 bg-[#121212] p-5 rounded-2xl">
                        <h4 className="font-bold text-sm mb-3 text-white truncate" title={name}>
                          {name}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                          <p>
                            Reach: <strong className="text-zinc-200">{stat.totalReach.toLocaleString("de-DE")}</strong>
                          </p>
                          <p>
                            Clicks: <strong className="text-zinc-200">{stat.totalClicks}</strong>
                          </p>
                          <p>
                            Revenue: <strong className="text-zinc-200">€ {stat.totalRevenue.toFixed(2)}</strong>
                          </p>
                          <p>
                            VTR: <strong className="text-[#a3895d]">{stat.avgVTR.toFixed(2)} %</strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Embedded Report Setup & Viewer */}
              <div className="pt-4 border-t border-zinc-800">
                <Report data={singleResults} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW B: WÖCHENTLICHES MASSENREPORTING */}
      {/* ========================================================= */}
      {reportingMode === "bulk" && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Upload Zone if no multi-campaign data parsed yet */}
          {!rawCampaignsData && (
            <div className="max-w-2xl mx-auto my-12">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleBulkFileUpload(file);
                }}
                onClick={() => bulkFileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-zinc-800 hover:border-[#a3895d] bg-[#121212]/80 hover:bg-[#121212] rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 shadow-2xl flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-[#a3895d]/50 flex items-center justify-center text-[#a3895d] group-hover:scale-110 transition-transform">
                  <LayoutGrid size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Wöchentlichen Gesamt-Report hier ablegen
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Lade die wöchentliche Multi-Kampagnen CSV-Datei hoch (mit Spalte Order/Campaign), um alle Kampagnen gleichzeitig zu analysieren.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-[#a3895d]">
                  <span>Format: .csv (Automatischer Datenbank-Abgleich & Bulk-Export)</span>
                </div>
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBulkFileUpload(file);
                  }}
                />
              </div>
            </div>
          )}

          {/* Multi-Campaign Dashboard */}
          {rawCampaignsData && (
            <div className="space-y-8">
              {/* Top KPI Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                      Erkannte Kampagnen
                    </span>
                    <Layers size={18} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {categorizedCampaigns.totalCampaignsCount}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 flex flex-wrap gap-2">
                    <span className="text-emerald-400 font-semibold">
                      {categorizedCampaigns.totalConfiguredCount} in DB
                    </span>
                    •
                    <span className="text-amber-400 font-semibold">
                      {categorizedCampaigns.totalUnconfiguredCount} fehlen
                    </span>
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                      Gesamte Impressions
                    </span>
                    <Eye size={18} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Object.values(rawCampaignsData)
                      .reduce((sum, c) => sum + c.campaign.impressions, 0)
                      .toLocaleString("de-DE")}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Geliefert laut CSV-Import
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                      Gesamter Umsatz
                    </span>
                    <Euro size={18} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    €{" "}
                    {Object.values(rawCampaignsData)
                      .reduce((sum, c) => sum + c.campaign.revenue, 0)
                      .toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Total CPM / CPC Umsatz
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                      Für Export Ausgewählt
                    </span>
                    <CheckCircle2 size={18} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-[#a3895d]">
                    {selectedCampaigns.size} Kampagnen
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Bereit für Batch-Export
                  </div>
                </div>
              </div>

              {/* MAIN KAMPAGNENMANAGEMENT CONTROL CARD */}
              <div className="bg-[#121212] border border-zinc-800 p-5 rounded-2xl shadow-xl space-y-4">
                {/* Status Tabs Header */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Target size={18} className="text-[#a3895d]" /> Kampagnenmanagement Status
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Wähle aus, welche Kampagnen du verwalten oder reporten möchtest:
                    </p>
                  </div>

                  {/* Primary Status Tabs */}
                  <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
                    <button
                      onClick={() => setBulkStatusFilter("configured")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        bulkStatusFilter === "configured"
                          ? "bg-emerald-600 text-white shadow-lg"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <FolderCheck size={16} />
                      <span>Zum Reporten bereit ({categorizedCampaigns.totalConfiguredCount})</span>
                    </button>

                    <button
                      onClick={() => setBulkStatusFilter("unconfigured")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        bulkStatusFilter === "unconfigured"
                          ? "bg-amber-500 text-black shadow-lg"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <AlertTriangle size={16} />
                      <span>Fehlende DB-Infos ({categorizedCampaigns.totalUnconfiguredCount})</span>
                    </button>

                    <button
                      onClick={() => setBulkStatusFilter("all")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        bulkStatusFilter === "all"
                          ? "bg-zinc-700 text-white shadow-lg"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Layers size={16} />
                      <span>Alle Kampagnen ({categorizedCampaigns.totalCampaignsCount})</span>
                    </button>
                  </div>
                </div>

                {/* Vorwoche Activity & Search Toolbar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Vorwoche:
                    </span>
                    <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
                      <button
                        onClick={() => setBulkReachTab("active_vorwoche")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          bulkReachTab === "active_vorwoche"
                            ? "bg-[#a3895d] text-black shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Reichweite in Vorwoche ({categorizedCampaigns.totalActiveCount})
                      </button>
                      <button
                        onClick={() => setBulkReachTab("inactive_vorwoche")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          bulkReachTab === "inactive_vorwoche"
                            ? "bg-zinc-800 text-white shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Keine Reichweite ({categorizedCampaigns.totalInactiveCount})
                      </button>
                      <button
                        onClick={() => setBulkReachTab("all")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          bulkReachTab === "all"
                            ? "bg-zinc-800 text-white shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Alle Vorwoche-Filter
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full lg:w-72">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Kampagne suchen..."
                      value={bulkSearchQuery}
                      onChange={(e) => setBulkSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#a3895d] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                    />
                  </div>
                </div>

                {/* Export Options & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal size={15} className="text-[#a3895d]" />
                      Export-Optionen:
                    </span>

                    <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <button
                        onClick={() => setUseIndividualExportOptions(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          useIndividualExportOptions
                            ? "bg-[#a3895d] text-black shadow-md"
                            : "text-[#d4d4d8] hover:text-white"
                        }`}
                      >
                        🎯 Individuelle Karteneinstellungen
                      </button>

                      <button
                        onClick={() => setUseIndividualExportOptions(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !useIndividualExportOptions
                            ? "bg-zinc-800 text-white shadow-md border border-zinc-700"
                            : "text-[#d4d4d8] hover:text-white"
                        }`}
                      >
                        🌐 Globale Schalter
                      </button>
                    </div>

                    {!useIndividualExportOptions && (
                      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer text-zinc-200 hover:text-[#a3895d]">
                          <input
                            type="checkbox"
                            checked={showCreatives}
                            onChange={(e) => setShowCreatives(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-[#a3895d]"
                          />
                          <span>Creatives</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-zinc-200 hover:text-[#a3895d]">
                          <input
                            type="checkbox"
                            checked={showLineItems}
                            onChange={(e) => setShowLineItems(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-[#a3895d]"
                          />
                          <span>Line Items</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
                    <button
                      onClick={handleBulkExportExcel}
                      disabled={selectedCampaigns.size === 0}
                      className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-colors shadow"
                    >
                      <FileSpreadsheet size={15} />
                      Excel ({selectedCampaigns.size})
                    </button>

                    <button
                      onClick={handleBulkExportCSV}
                      disabled={selectedCampaigns.size === 0}
                      className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-colors shadow"
                    >
                      <FileText size={15} />
                      CSV ({selectedCampaigns.size})
                    </button>

                    <button
                      onClick={() => setBulkViewMode("bulk_report")}
                      disabled={selectedCampaigns.size === 0}
                      className="flex items-center gap-1.5 bg-[#a3895d] hover:bg-[#8e764d] disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-lg"
                    >
                      <Printer size={15} />
                      Bulk PDF ({selectedCampaigns.size})
                    </button>
                  </div>
                </div>

                {/* Card Footer: Select All Checkbox */}
                {displayedList.some((c) => c.isConfigured || c.preset) && (
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-800/80 px-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-white">
                      <input
                        type="checkbox"
                        checked={
                          displayedList.filter((c) => c.isConfigured || c.preset).length > 0 &&
                          displayedList
                            .filter((c) => c.isConfigured || c.preset)
                            .every((c) => selectedCampaigns.has(c.name))
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d]"
                      />
                      <span>
                        Alle {displayedList.filter((c) => c.isConfigured || c.preset).length} bereiten Kampagnen in dieser Ansicht auswählen
                      </span>
                    </label>
                    <span className="text-xs text-zinc-500 font-mono">
                      {displayedList.length} Kampagnen angezeigt
                    </span>
                  </div>
                )}
              </div>

              {/* MAIN CAMPAIGN CARDS LISTING */}
              <div className="space-y-4">

                {displayedList.length === 0 ? (
                  <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500/50" />
                    <p className="text-sm">
                      Keine Kampagnen in dieser Kategorie (
                      {bulkReachTab === "active_vorwoche"
                        ? "Reichweite in Vorwoche"
                        : "Keine Reichweite in Vorwoche"}
                      ) gefunden.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {displayedList.map(({ name, campaignData, preset, vorwocheReach, isConfigured }) => {
                      const isSelected = selectedCampaigns.has(name);
                      const opts = getCampaignOptions(name);

                      // IF CONFIGURED ITEM
                      if (isConfigured && preset) {
                        const metrics = calculateBudgetMetrics(
                          { ...campaignData.campaign, targetReach: preset.targetReach },
                          preset.targetBudget,
                          preset.startDate,
                          preset.endDate,
                          vorwocheRange.end || vorwocheRange.maxDateStr
                        );

                        return (
                          <div
                            key={name}
                            className={`bg-[#111113] border transition-all duration-200 rounded-2xl p-5 shadow-xl flex flex-col gap-4 ${
                              isSelected
                                ? "border-[#a3895d]/60 bg-gradient-to-r from-[#141416] via-[#17171a] to-[#141416] ring-1 ring-[#a3895d]/30"
                                : "border-zinc-800/80 hover:border-zinc-700/80"
                            }`}
                          >
                            {/* LAYER 1: Header Zone (Title, Dates, Primary Actions) */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-zinc-800/60">
                              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectCampaign(name)}
                                  className="w-5 h-5 mt-0.5 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d] cursor-pointer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2.5">
                                    <h3 className="text-base font-bold text-white tracking-tight truncate" title={name}>
                                      {name}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      <Check size={10} /> Bereit
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono mt-1">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                      <Clock size={13} className="text-[#a3895d]" />
                                      {moment(preset.startDate).format("DD.MM.YY")} – {moment(preset.endDate).format("DD.MM.YY")}
                                    </span>
                                    <span className="text-zinc-600">•</span>
                                    <span>
                                      Laufzeit: <strong className="text-zinc-200">{metrics.totalDays} Tage</strong> <span className="text-zinc-500">(Tag {metrics.daysSinceStart})</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Primary Action Buttons */}
                              <div className="flex flex-wrap items-center gap-2 justify-end">
                                <button
                                  onClick={() => handleOpenEditPreset(preset)}
                                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors shadow-sm"
                                  title="Preset-Werte (Start, Ende, Target Reach, Budget) bearbeiten"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  onClick={() =>
                                    exportCampaignToExcel({
                                      campaignData,
                                      preset,
                                      showCreatives: opts.showCreatives,
                                      showLineItems: opts.showLineItems,
                                    })
                                  }
                                  className="flex items-center gap-1.5 bg-emerald-900/40 hover:bg-emerald-800/80 text-emerald-300 border border-emerald-700/50 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm"
                                  title="Excel-Datei herunterladen (.xlsx)"
                                >
                                  <FileSpreadsheet size={14} />
                                  .xlsx
                                </button>

                                <button
                                  onClick={() =>
                                    exportCampaignToCSV({
                                      campaignData,
                                      preset,
                                      showCreatives: opts.showCreatives,
                                      showLineItems: opts.showLineItems,
                                    })
                                  }
                                  className="flex items-center gap-1.5 bg-blue-900/40 hover:bg-blue-800/80 text-blue-300 border border-blue-700/50 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm"
                                  title="Einzelne CSV exportieren"
                                >
                                  <FileText size={14} />
                                  .csv
                                </button>

                                <button
                                  onClick={() => {
                                    setCurrentSingleCampaign({ campaignData, preset });
                                    setBulkViewMode("single_report");
                                  }}
                                  className="flex items-center gap-1.5 bg-[#a3895d] hover:bg-[#8e764d] text-black text-xs font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors shadow-md"
                                >
                                  Report <ChevronRight size={14} />
                                </button>
                              </div>
                            </div>

                            {/* LAYER 2: Core Metrics Stat Pillars & Export Scope */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
                              {/* Stat 1: Ist-Auslieferung */}
                              <div className="bg-zinc-900/80 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-sans">
                                  Ist-Auslieferung
                                </span>
                                <div className="text-base font-extrabold text-white font-mono mt-1">
                                  {campaignData.campaign.impressions.toLocaleString("de-DE")}
                                </div>
                              </div>

                              {/* Stat 2: Lineares Soll */}
                              <div className="bg-zinc-900/80 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-sans">
                                  Lineares Soll (Pacing)
                                </span>
                                <div className="text-base font-extrabold text-zinc-200 font-mono mt-1">
                                  {metrics.shouldReach.toLocaleString("de-DE")}
                                </div>
                              </div>

                              {/* Stat 3: Budget / Ist */}
                              <div className="bg-zinc-900/80 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-sans">
                                  Budget / Ist
                                </span>
                                <div>
                                  <div className="text-base font-extrabold text-white font-mono mt-1">
                                    € {campaignData.campaign.revenue.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono">
                                    Soll: € {metrics.shouldSpend.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </div>
                                </div>
                              </div>

                              {/* Stat 4: Performance */}
                              <div className="bg-zinc-900/80 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-sans">
                                  Performance
                                </span>
                                <div className="text-base font-extrabold text-[#a3895d] font-mono mt-1">
                                  VTR {campaignData.campaign.vtr.toFixed(1)}%
                                </div>
                              </div>

                              {/* Stat 5: Export-Umfang */}
                              <div className="bg-zinc-900/80 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-sans">
                                  Export-Umfang
                                </span>
                                <div className="flex items-center gap-3 mt-1.5 font-mono text-[11px]">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                                    <input
                                      type="checkbox"
                                      checked={opts.showCreatives}
                                      onChange={() => toggleCampaignOption(name, "showCreatives")}
                                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d]"
                                    />
                                    <span>Creatives</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                                    <input
                                      type="checkbox"
                                      checked={opts.showLineItems}
                                      onChange={() => toggleCampaignOption(name, "showLineItems")}
                                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d]"
                                    />
                                    <span>Line Items</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* LAYER 3: Pacing Progress Bar */}
                            <div className="pt-1">
                              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mb-1">
                                <span className="text-zinc-500 font-sans font-medium">Auslieferungsverlauf vs. Zeitverlauf (Lineares Soll):</span>
                                <span className="text-zinc-300 font-semibold">
                                  Ist: {metrics.reachProgress.toFixed(1)}% | Zeit: {metrics.timeProgress.toFixed(1)}%
                                </span>
                              </div>
                              <div className="relative w-full h-2 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    metrics.pacingStatus === "behind"
                                      ? "bg-red-500"
                                      : metrics.pacingStatus === "ahead"
                                      ? "bg-amber-400"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(metrics.reachProgress, 100)}%` }}
                                />
                                {metrics.timeProgress > 0 && metrics.timeProgress < 100 && (
                                  <div
                                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] z-10"
                                    style={{ left: `${metrics.timeProgress}%` }}
                                    title={`Lineares Soll: ${metrics.timeProgress.toFixed(1)}%`}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // IF UNCONFIGURED ITEM
                      const form = unconfiguredForms[name] || {};
                      const isSaving = savingMap[name];

                      return (
                        <div
                          key={name}
                          className="bg-[#121212] border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-5 shadow-lg"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="min-w-0 lg:w-1/3">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-white truncate" title={name}>
                                  {name}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  Unkonfiguriert
                                </span>

                              </div>
                              <div className="text-xs text-zinc-400 font-mono space-y-0.5">
                                <div>
                                  Geliefert: <strong className="text-zinc-200">{campaignData.campaign.impressions.toLocaleString("de-DE")}</strong> Impr. |{" "}
                                  <strong className="text-zinc-200">€ {campaignData.campaign.revenue.toFixed(2)}</strong>
                                </div>
                                <div className="text-[11px] text-zinc-500">
                                  CSV-Zeitraum: {moment(campaignData.campaign.startDate).format("DD.MM.YY")} - {moment(campaignData.campaign.endDate).format("DD.MM.YY")}
                                </div>
                              </div>

                              {/* Per-Campaign Checkboxes for Unconfigured Item */}
                              <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-zinc-400">
                                <span className="text-[9px] uppercase font-semibold text-zinc-500">Export:</span>
                                <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                                  <input
                                    type="checkbox"
                                    checked={opts.showCreatives}
                                    onChange={() => toggleCampaignOption(name, "showCreatives")}
                                    className="w-3 h-3 rounded border-zinc-700 bg-black text-[#a3895d]"
                                  />
                                  <span>Creatives</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                                  <input
                                    type="checkbox"
                                    checked={opts.showLineItems}
                                    onChange={() => toggleCampaignOption(name, "showLineItems")}
                                    className="w-3 h-3 rounded border-zinc-700 bg-black text-[#a3895d]"
                                  />
                                  <span>Line Items</span>
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                              <div>
                                <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">
                                  Startdatum
                                </label>
                                <input
                                  type="date"
                                  value={form.startDate || ""}
                                  onChange={(e) =>
                                    setUnconfiguredForms((prev) => ({
                                      ...prev,
                                      [name]: { ...prev[name], startDate: e.target.value },
                                    }))
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-[#a3895d]"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">
                                  Enddatum
                                </label>
                                <input
                                  type="date"
                                  value={form.endDate || ""}
                                  onChange={(e) =>
                                    setUnconfiguredForms((prev) => ({
                                      ...prev,
                                      [name]: { ...prev[name], endDate: e.target.value },
                                    }))
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-[#a3895d]"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">
                                  Target Impressions
                                </label>
                                <input
                                  type="number"
                                  placeholder="z.B. 100000"
                                  value={form.targetReach || ""}
                                  onChange={(e) =>
                                    setUnconfiguredForms((prev) => ({
                                      ...prev,
                                      [name]: { ...prev[name], targetReach: e.target.value },
                                    }))
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-[#a3895d]"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">
                                  Ziel-Budget (€)
                                </label>
                                <input
                                  type="number"
                                  placeholder="z.B. 10000"
                                  value={form.targetBudget || ""}
                                  onChange={(e) =>
                                    setUnconfiguredForms((prev) => ({
                                      ...prev,
                                      [name]: { ...prev[name], targetBudget: e.target.value },
                                    }))
                                  }
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-[#a3895d]"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => handleSaveUnconfigured(name)}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow transition-colors"
                              >
                                {isSaving ? (
                                  <RefreshCw size={14} className="animate-spin" />
                                ) : (
                                  <Check size={14} />
                                )}
                                Speichern & Freischalten
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Edit Modal (Shared) */}
      {editingPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 size={16} className="text-[#a3895d]" /> Preset bearbeiten
              </h3>
              <button
                onClick={() => setEditingPreset(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPreset} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Kampagnen Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={editFormData.campaignName}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-400 outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.startDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, startDate: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#a3895d]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                    Enddatum
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.endDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, endDate: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#a3895d]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Target Impressions (Ziel-Reichweite)
                </label>
                <input
                  type="number"
                  required
                  value={editFormData.targetReach}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, targetReach: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#a3895d]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Ziel-Budget (€)
                </label>
                <input
                  type="number"
                  required
                  value={editFormData.targetBudget}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, targetBudget: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#a3895d]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPreset(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#a3895d] hover:bg-[#8e764d] text-black shadow"
                >
                  Aktualisieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
