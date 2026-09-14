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
} from "lucide-react";

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
        const todayStr = new Date().toISOString().split("T")[0];

        // Behalte nur Daten, die VOR heute liegen
        const data = output.data.filter((row) => {
          if (!row.Date) return false;
          return row.Date < todayStr;
        });

        if (data.length === 0) {
          alert("Keine Daten bis gestern in der CSV-Datei gefunden.");
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

            const existingDate = acc[key].reachByDate.find((d) => d.date === row["Date"]);
            if (existingDate) {
              existingDate.reach += impressions;
            } else {
              acc[key].reachByDate.push({
                date: row["Date"],
                reach: impressions,
              });
            }

            return acc;
          }, {});
        };

        const lineItems = groupBy("Line Item");
        const creatives = groupBy("Creative");

        Object.values(lineItems).forEach(
          (item) => (item.avgVTR = item.totalReach > 0 ? (item.completes / item.totalReach) * 100 : 0)
        );
        Object.values(creatives).forEach(
          (item) => (item.avgVTR = item.totalReach > 0 ? (item.completes / item.totalReach) * 100 : 0)
        );

        const campaignDaily = data.reduce((acc, row) => {
          const date = row["Date"];
          if (!date) return acc;
          const existing = acc.find((d) => d.date === date);
          const reach = Number(row["Total impressions"] || row["Impressions"] || 0);
          const revenue = Number(
            row["Total revenue"] ??
              row["Total CPM and CPC revenue"] ??
              row["Total CPM and CPC revenue (€)"] ??
              row["Revenue"] ??
              0
          );
          if (existing) {
            existing.reach += reach;
            existing.revenue += revenue;
          } else {
            acc.push({
              date,
              reach,
              revenue,
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

  const loadPresets = async () => {
    setIsLoadingPresets(true);
    try {
      const res = await fetch("/api/reports/preset?all=true");
      if (res.ok) {
        const data = await res.json();
        setPresets(Array.isArray(data) ? data : []);
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

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (output) => {
        const rows = output.data.filter((r) => r.Date);

        if (rows.length === 0) {
          alert("Keine gültigen Daten in der CSV-Datei gefunden.");
          return;
        }

        const campaignsMap = {};

        rows.forEach((row) => {
          const campaignName = (
            row["Order"] ||
            row["Campaign"] ||
            row["Campaign name"] ||
            row["Kampagne"] ||
            "Unbekannte Kampagne"
          ).trim();

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

            const date = row["Date"];
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

            const date = row["Date"];
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
            const date = row["Date"];
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

          const dates = cRows.map((r) => r.Date).filter(Boolean).sort();
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

        const initialSelected = new Set();
        Object.keys(parsedCampaigns).forEach((cName) => {
          const matched = (presets || []).some(
            (p) => p.campaignName.toLowerCase() === cName.toLowerCase()
          );
          if (matched) initialSelected.add(cName);
        });
        setSelectedCampaigns(initialSelected);
      },
    });
  };

  // Berechne den Vorwochen-Zeitraum dynamisch anhand des neuesten Datums in den CSV-Daten
  const vorwocheRange = useMemo(() => {
    if (!rawCampaignsData) return { start: "", end: "", label: "" };

    const allDates = [];
    Object.values(rawCampaignsData).forEach((c) => {
      (c.daily || []).forEach((d) => {
        if (d.date) allDates.push(d.date);
      });
    });

    if (allDates.length === 0) return { start: "", end: "", label: "" };

    allDates.sort();
    const maxDateStr = allDates[allDates.length - 1];
    const maxMoment = moment(maxDateStr);

    let startMoment, endMoment;
    if (maxMoment.isoWeekday() === 7) {
      endMoment = maxMoment.clone();
      startMoment = maxMoment.clone().startOf("isoWeek");
    } else {
      endMoment = maxMoment.clone().subtract(1, "week").endOf("isoWeek");
      startMoment = maxMoment.clone().subtract(1, "week").startOf("isoWeek");
    }

    if (startMoment.format("YYYY-MM-DD") > maxDateStr) {
      startMoment = moment(allDates[0]);
      endMoment = maxMoment;
    }

    const start = startMoment.format("YYYY-MM-DD");
    const end = endMoment.format("YYYY-MM-DD");
    const label = `${startMoment.format("DD.MM.YYYY")} – ${endMoment.format("DD.MM.YYYY")} (KW ${endMoment.isoWeek()})`;

    return { start, end, label, maxDateStr };
  }, [rawCampaignsData]);

  // Kategorisiere Kampagnen: Vorwoche Reichweite vs. Keine Vorwoche Reichweite & Bereit vs. Unkonfiguriert
  const categorizedCampaigns = useMemo(() => {
    if (!rawCampaignsData) {
      return {
        activeVorwoche: { configured: [], unconfigured: [], all: [] },
        inactiveVorwoche: { configured: [], unconfigured: [], all: [] },
        configuredList: [],
        unconfiguredList: [],
        totalActiveCount: 0,
        totalInactiveCount: 0,
      };
    }

    const activeVorwoche = { configured: [], unconfigured: [], all: [] };
    const inactiveVorwoche = { configured: [], unconfigured: [], all: [] };
    const configuredList = [];
    const unconfiguredList = [];

    Object.entries(rawCampaignsData).forEach(([cName, campaignData]) => {
      const preset = (presets || []).find(
        (p) => p.campaignName.toLowerCase() === cName.toLowerCase()
      );

      const vorwocheReach = (campaignData.daily || [])
        .filter(
          (d) => d.date >= vorwocheRange.start && d.date <= vorwocheRange.end
        )
        .reduce((sum, d) => sum + (d.reach || 0), 0);

      const item = {
        name: cName,
        campaignData,
        preset: preset || null,
        vorwocheReach,
        isConfigured: !!preset,
      };

      if (preset) {
        configuredList.push({
          name: cName,
          campaignData,
          preset,
          vorwocheReach,
        });
      } else {
        unconfiguredList.push({
          name: cName,
          campaignData,
          vorwocheReach,
        });
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
      totalActiveCount: activeVorwoche.all.length,
      totalInactiveCount: inactiveVorwoche.all.length,
    };
  }, [rawCampaignsData, presets, vorwocheRange]);

  const configuredList = categorizedCampaigns.configuredList;
  const unconfiguredList = categorizedCampaigns.unconfiguredList;

  const currentGroup = useMemo(() => {
    return bulkReachTab === "active_vorwoche"
      ? categorizedCampaigns.activeVorwoche
      : categorizedCampaigns.inactiveVorwoche;
  }, [bulkReachTab, categorizedCampaigns]);

  const displayedList = useMemo(() => {
    let list = currentGroup.all;
    if (bulkStatusFilter === "configured") list = currentGroup.configured;
    if (bulkStatusFilter === "unconfigured") list = currentGroup.unconfigured;

    if (!bulkSearchQuery.trim()) return list;
    return list.filter((item) =>
      item.name.toLowerCase().includes(bulkSearchQuery.toLowerCase())
    );
  }, [currentGroup, bulkStatusFilter, bulkSearchQuery]);

  useEffect(() => {
    const activeConfigured = categorizedCampaigns.activeVorwoche.configured;
    if (activeConfigured.length > 0) {
      setSelectedCampaigns((prev) => {
        if (prev.size === 0) {
          return new Set(activeConfigured.map((c) => c.name));
        }
        return prev;
      });
    }
  }, [categorizedCampaigns]);

  const handleSaveUnconfigured = async (campaignName) => {
    const formData = unconfiguredForms[campaignName];
    if (!formData) return;

    setSavingMap((prev) => ({ ...prev, [campaignName]: true }));

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
        }),
      });

      if (res.ok) {
        await loadPresets();
        setSelectedCampaigns((prev) => new Set([...prev, campaignName]));
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
    const currentConfiguredNames = currentGroup.configured.map((c) => c.name);
    const allSelected = currentConfiguredNames.every((name) =>
      selectedCampaigns.has(name)
    );

    setSelectedCampaigns((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        currentConfiguredNames.forEach((name) => next.delete(name));
      } else {
        currentConfiguredNames.forEach((name) => next.add(name));
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
    });

    campaignsToExport.forEach((item, index) => {
      setTimeout(() => {
        exportCampaignToExcel({
          campaignData: item.campaignData,
          preset: item.preset,
          showCreatives,
          showLineItems,
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
      setTimeout(() => {
        exportCampaignToCSV({
          campaignData: item.campaignData,
          preset: item.preset,
          showCreatives,
          showLineItems,
        });
      }, index * 250);
    });
  };

  // -------------------------------------------------------------
  // RENDER BULK SUB-VIEWS (Single Report / Bulk PDF Print)
  // -------------------------------------------------------------
  if (bulkViewMode === "single_report" && currentSingleCampaign) {
    return (
      <Report
        data={currentSingleCampaign.campaignData}
        preset={currentSingleCampaign.preset}
        initialGenerated={true}
        showCreativesProp={showCreatives}
        showLineItemsProp={showLineItems}
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
          {selectedList.map((item) => (
            <div key={item.name} className="border-b-4 border-zinc-800 pb-12">
              <Report
                data={item.campaignData}
                preset={item.preset}
                initialGenerated={true}
                showCreativesProp={showCreatives}
                showLineItemsProp={showLineItems}
                onBack={() => setBulkViewMode("hub")}
              />
            </div>
          ))}
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-1">
              Kampagnen Performance Reports
            </h1>
            <p className="text-xs lg:text-sm text-zinc-400">
              Erstelle einzelne Ad-Reports für Kampagnen oder führe einen wöchentlichen Massenabgleich durch.
            </p>
          </div>

          {/* Mode Tabs */}
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
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={16} />
              Wöchentliches Massenreporting
            </button>
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
              {/* Header with Reset Button */}
              <div className="flex justify-between items-center bg-[#121212] border border-zinc-800 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#a3895d]/10 border border-[#a3895d]/30 rounded-xl text-[#a3895d]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {singleFileName || "Hochgeladene Kampagnendaten"}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Daten bis gestern erfolgreich verarbeitet
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSingleResults(null);
                    setSingleFileName("");
                  }}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-xl transition-colors"
                >
                  <RefreshCw size={14} /> Andere Datei hochladen
                </button>
              </div>

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
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Gefundene Kampagnen
                    </span>
                    <Layers size={16} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Object.keys(rawCampaignsData).length}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 flex flex-wrap gap-2">
                    <span className="text-emerald-400 font-medium">
                      {categorizedCampaigns.totalActiveCount} Vorwoche-Aktiv
                    </span>
                    •
                    <span className="text-zinc-500 font-medium">
                      {categorizedCampaigns.totalInactiveCount} Inaktiv
                    </span>
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Gesamte Impressions (CSV)
                    </span>
                    <Eye size={16} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Object.values(rawCampaignsData)
                      .reduce((sum, c) => sum + c.campaign.impressions, 0)
                      .toLocaleString("de-DE")}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Geliefert über alle Kampagnen
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Gesamter Umsatz (CSV)
                    </span>
                    <Euro size={16} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    €{" "}
                    {Object.values(rawCampaignsData)
                      .reduce((sum, c) => sum + c.campaign.revenue, 0)
                      .toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Total CPM / CPC Revenue
                  </div>
                </div>

                <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      Ausgewählte Kampagnen
                    </span>
                    <CheckCircle2 size={16} className="text-[#a3895d]" />
                  </div>
                  <div className="text-2xl font-bold text-[#a3895d]">
                    {selectedCampaigns.size} von {configuredList.length}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Für Bulk-Export & Druck
                  </div>
                </div>
              </div>

              {/* PRIMARY TAB NAVIGATION: Vorwoche-Reichweite vs. Keine Vorwoche-Reichweite */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121212] border border-zinc-800 p-2 rounded-2xl shadow-xl">
                <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl flex-grow sm:flex-grow-0">
                  <button
                    onClick={() => setBulkReachTab("active_vorwoche")}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      bulkReachTab === "active_vorwoche"
                        ? "bg-[#a3895d] text-black shadow-lg"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <Sparkles size={16} className={bulkReachTab === "active_vorwoche" ? "text-black" : "text-[#a3895d]"} />
                    <span>Reichweite in Vorwoche ({categorizedCampaigns.totalActiveCount})</span>
                  </button>
                  <button
                    onClick={() => setBulkReachTab("inactive_vorwoche")}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      bulkReachTab === "inactive_vorwoche"
                        ? "bg-zinc-800 text-white shadow-lg border border-zinc-700"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <Clock size={16} className="text-zinc-500" />
                    <span>Keine Reichweite in Vorwoche ({categorizedCampaigns.totalInactiveCount})</span>
                  </button>
                </div>

                {vorwocheRange.label && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-300 self-center sm:self-auto font-mono">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Vorwoche:</span>
                    <strong className="text-[#a3895d]">{vorwocheRange.label}</strong>
                  </div>
                )}
              </div>

              {/* SECONDARY TOOLBAR: Status Sub-Filter (Bereit / Noch nicht angelegt / Alle), Search & Export */}
              <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xl">
                {/* Left: Sub-Filter Tabs & Search */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <button
                      onClick={() => setBulkStatusFilter("configured")}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        bulkStatusFilter === "configured"
                          ? "bg-emerald-600 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      Bereit ({currentGroup.configured.length})
                    </button>
                    <button
                      onClick={() => setBulkStatusFilter("unconfigured")}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        bulkStatusFilter === "unconfigured"
                          ? "bg-amber-500 text-black shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <AlertCircle size={13} />
                      Noch nicht angelegt ({currentGroup.unconfigured.length})
                    </button>
                    <button
                      onClick={() => setBulkStatusFilter("all")}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        bulkStatusFilter === "all"
                          ? "bg-zinc-700 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Layers size={13} />
                      Alle ({currentGroup.all.length})
                    </button>
                  </div>

                  <div className="relative flex-grow lg:w-64">
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

                {/* Right: Breakdown Toggles & Bulk Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
                  <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-xl text-xs">
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 mr-1">
                      Export-Optionen:
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-[#a3895d]">
                      <input
                        type="checkbox"
                        checked={showCreatives}
                        onChange={(e) => setShowCreatives(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d]"
                      />
                      <span>Creatives</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-[#a3895d]">
                      <input
                        type="checkbox"
                        checked={showLineItems}
                        onChange={(e) => setShowLineItems(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d]"
                      />
                      <span>Line Items</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkExportExcel}
                      disabled={selectedCampaigns.size === 0}
                      className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-colors shadow"
                      title="Ausgewählte Kampagnen in einer Excel-Datei mit Einzelreitern exportieren"
                    >
                      <FileSpreadsheet size={15} />
                      Excel ({selectedCampaigns.size})
                    </button>

                    <button
                      onClick={handleBulkExportCSV}
                      disabled={selectedCampaigns.size === 0}
                      className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-colors shadow"
                      title="Ausgewählte Kampagnen als einzelne CSV-Dateien exportieren"
                    >
                      <FileText size={15} />
                      CSV ({selectedCampaigns.size})
                    </button>

                    <button
                      onClick={() => setBulkViewMode("bulk_report")}
                      disabled={selectedCampaigns.size === 0}
                      className="flex items-center gap-1.5 bg-[#a3895d] hover:bg-[#8e764d] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-lg"
                    >
                      <Printer size={15} />
                      Bulk Report ({selectedCampaigns.size})
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setRawCampaignsData(null);
                      setBulkCsvFile(null);
                      setBulkFileName("");
                    }}
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl"
                    title="Neue CSV hochladen"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>

              {/* MAIN CAMPAIGN CARDS LISTING */}
              <div className="space-y-4">
                {currentGroup.configured.length > 0 && (
                  <div className="flex justify-between items-center px-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-white">
                      <input
                        type="checkbox"
                        checked={
                          currentGroup.configured.length > 0 &&
                          currentGroup.configured.every((c) =>
                            selectedCampaigns.has(c.name)
                          )
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d]"
                      />
                      <span>Alle {currentGroup.configured.length} bereiten Kampagnen auswählen</span>
                    </label>
                    <span className="text-xs text-zinc-500 font-mono">
                      {displayedList.length} Kampagnen angezeigt
                    </span>
                  </div>
                )}

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

                      // IF CONFIGURED ITEM
                      if (isConfigured && preset) {
                        const metrics = calculateBudgetMetrics(
                          { ...campaignData.campaign, targetReach: preset.targetReach },
                          preset.targetBudget,
                          preset.startDate,
                          preset.endDate
                        );

                        return (
                          <div
                            key={name}
                            className={`bg-[#121212] border transition-all duration-200 rounded-2xl p-5 shadow-lg ${
                              isSelected
                                ? "border-[#a3895d]/60 bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212]"
                                : "border-zinc-800/80 hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectCampaign(name)}
                                  className="w-5 h-5 mt-1 rounded border-zinc-700 bg-black text-[#a3895d] focus:ring-[#a3895d] cursor-pointer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                                    <h3 className="text-base font-bold text-white truncate" title={name}>
                                      {name}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                      <Check size={10} /> Bereit
                                    </span>

                                    {/* Vorwoche Reichweite Badge */}
                                    {vorwocheReach > 0 ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#a3895d]/10 text-[#a3895d] border border-[#a3895d]/30 font-mono">
                                        <Sparkles size={10} /> Vorwoche: {vorwocheReach.toLocaleString("de-DE")} Impr.
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 font-mono">
                                        Inaktiv in Vorwoche
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} className="text-zinc-500" />
                                      {moment(preset.startDate).format("DD.MM.YY")} -{" "}
                                      {moment(preset.endDate).format("DD.MM.YY")}
                                    </span>
                                    <span>
                                      Laufzeit: <strong className="text-zinc-200">{metrics.totalDays} Tage</strong> (Tag {metrics.daysSinceStart})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800/50">
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">
                                    Impressions
                                  </span>
                                  <div className="text-sm font-bold text-white">
                                    {campaignData.campaign.impressions.toLocaleString("de-DE")}
                                  </div>
                                  <div className="text-[10px] text-[#a3895d]">
                                    {metrics.reachProgress.toFixed(1)}% von {(Number(preset.targetReach) || 0).toLocaleString("de-DE")}
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">
                                    Budget / Ist
                                  </span>
                                  <div className="text-sm font-bold text-white">
                                    € {campaignData.campaign.revenue.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </div>
                                  <div className="text-[10px] text-zinc-400">
                                    Soll: € {metrics.shouldSpend.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">
                                    Avg. VTR
                                  </span>
                                  <div className="text-sm font-bold text-white">
                                    {campaignData.campaign.vtr.toFixed(1)}%
                                  </div>
                                  <div className="text-[10px] text-zinc-400">
                                    {campaignData.campaign.completes.toLocaleString("de-DE")} Views
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">
                                    Clicks / CTR
                                  </span>
                                  <div className="text-sm font-bold text-white">
                                    {campaignData.campaign.clicks.toLocaleString("de-DE")}
                                  </div>
                                  <div className="text-[10px] text-zinc-400">
                                    CTR {campaignData.campaign.ctr.toFixed(2)}%
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 justify-end">
                                <button
                                  onClick={() => handleOpenEditPreset(preset)}
                                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
                                  title="Preset-Werte (Start, Ende, Target Reach, Budget) bearbeiten"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  onClick={() =>
                                    exportCampaignToExcel({
                                      campaignData,
                                      preset,
                                      showCreatives,
                                      showLineItems,
                                    })
                                  }
                                  className="flex items-center gap-1 bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100 border border-emerald-700/50 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
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
                                      showCreatives,
                                      showLineItems,
                                    })
                                  }
                                  className="flex items-center gap-1 bg-blue-800/60 hover:bg-blue-700 text-blue-100 border border-blue-700/50 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
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
                                  className="flex items-center gap-1.5 bg-[#a3895d] hover:bg-[#8e764d] text-black text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow"
                                >
                                  Report <ChevronRight size={14} />
                                </button>
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
                                {vorwocheReach > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#a3895d]/10 text-[#a3895d] border border-[#a3895d]/30 font-mono">
                                    <Sparkles size={9} /> Vorwoche: {vorwocheReach.toLocaleString("de-DE")} Impr.
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50 font-mono">
                                    Inaktiv in Vorwoche
                                  </span>
                                )}
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
