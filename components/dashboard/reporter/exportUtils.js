import * as XLSX from "xlsx";
import moment from "moment";

// Clean file names by replacing characters invalid in Windows/Mac file systems
export const sanitizeFileName = (name) => {
  if (!name) return "Report";
  return name.replace(/[/\\?%*:|"<>]/g, "-").trim();
};

export const getGermanDateString = () => {
  return moment().format("DD.MM.YYYY");
};

/**
 * Robust CSV number parser handling German formatting ("17,32", "1.050,50", floats, numbers)
 */
const parseCSVNumber = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (!str) return 0;

  let cleaned = str;
  if (str.includes(",") && str.includes(".")) {
    cleaned = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    cleaned = str.replace(",", ".");
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Extract numeric value from row given possible field keys
 */
const getVal = (row, keys) => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      return parseCSVNumber(row[k]);
    }
  }
  return 0;
};

/**
 * Calculates budget & reach pacing metrics (linear delivery comparison)
 */
export const calculateBudgetMetrics = (
  campaign,
  targetBudget,
  startDate,
  endDate,
  refDate = null
) => {
  const currentRevenue = Number(campaign?.revenue || 0);
  const bookedBudget = Number(targetBudget || 0);
  const currentReach = Number(campaign?.impressions || 0);
  const targetReach = Number(campaign?.targetReach || 0);

  if (!startDate || !endDate) {
    return {
      totalDays: 0,
      daysSinceStart: 0,
      remainingDays: 0,
      timeProgress: 0,
      bookedBudget,
      shouldSpend: 0,
      actualSpend: currentRevenue,
      deltaSpend: currentRevenue,
      deltaPercent: 0,
      currentReach,
      targetReach,
      shouldReach: 0,
      reachDelta: currentReach,
      reachDeltaPercent: 0,
      pacingIndex: 0,
      pacingStatus: "unknown",
      pacingLabel: "Keine Daten",
      pacingColor: "text-zinc-400",
      pacingBg: "bg-zinc-800 border-zinc-700",
      reachProgress: 0,
      budgetProgress: 0,
    };
  }

  const startM = moment(startDate, ["YYYY-MM-DD", "DD.MM.YYYY", moment.ISO_8601]).startOf("day");
  const endM = moment(endDate, ["YYYY-MM-DD", "DD.MM.YYYY", moment.ISO_8601]).startOf("day");

  // Inklusive Gesamtlaufzeit-Tage (z.B. 01.09 bis 14.09 inkl. = 14 Tage)
  const totalDays =
    startM.isValid() && endM.isValid() && endM.isSameOrAfter(startM)
      ? endM.diff(startM, "days") + 1
      : 0;

  // Stichtag der Bewertung (refDate aus CSV oder heute)
  const evalM = refDate
    ? moment(refDate, ["YYYY-MM-DD", "DD.MM.YYYY", moment.ISO_8601]).startOf("day")
    : moment().startOf("day");

  let daysSinceStart = 0;
  let remainingDays = totalDays;

  if (totalDays > 0) {
    if (evalM.isBefore(startM)) {
      daysSinceStart = 0;
      remainingDays = totalDays;
    } else if (evalM.isAfter(endM)) {
      daysSinceStart = totalDays;
      remainingDays = 0;
    } else {
      // Stichtag liegt innerhalb der Laufzeit (inklusive Start- und Enddatum)
      const diffDays = evalM.diff(startM, "days");
      if (evalM.isSame(endM, "day")) {
        // Am letzten Tag der Kampagne (z.B. 14.09 bei Enddatum 14.09):
        // 13 vollwertige Tage sind vor heute abgeschlossen, 1 Resttag läuft heute noch.
        daysSinceStart = Math.min(totalDays, diffDays);
        remainingDays = Math.max(1, totalDays - daysSinceStart);
      } else {
        daysSinceStart = Math.min(totalDays, diffDays);
        remainingDays = Math.max(0, totalDays - daysSinceStart);
      }
    }
  }

  const pacingMultiplier = totalDays > 0 ? daysSinceStart / totalDays : 0;
  const shouldSpend = bookedBudget * pacingMultiplier;
  const actualSpend = currentRevenue;
  const deltaSpend = actualSpend - shouldSpend;
  const deltaPercent = shouldSpend > 0 ? (deltaSpend / shouldSpend) * 100 : 0;

  // Lineare Auslieferungs-Metriken (Reichweite)
  const shouldReach = Math.round(targetReach * pacingMultiplier);
  const reachDelta = currentReach - shouldReach;
  const reachDeltaPercent =
    shouldReach > 0 ? ((currentReach - shouldReach) / shouldReach) * 100 : 0;

  // Pacing-Index: Ist-Reichweite im Vergleich zum linearen Soll (%)
  let pacingIndex = 0;
  if (shouldReach > 0) {
    pacingIndex = Math.round((currentReach / shouldReach) * 100);
  } else if (targetReach > 0 && currentReach > 0) {
    pacingIndex = 100;
  }

  // Pacing-Status Klassifizierung & Badges
  let pacingStatus = "on_target";
  let pacingLabel = "🎯 On Target";
  let pacingColor = "text-emerald-400";
  let pacingBg = "bg-emerald-500/10 border-emerald-500/30";

  if (totalDays === 0 || !startM.isValid()) {
    pacingStatus = "unknown";
    pacingLabel = "Keine Daten";
    pacingColor = "text-zinc-400";
    pacingBg = "bg-zinc-800 border-zinc-700";
  } else if (daysSinceStart === 0 && evalM.isBefore(startM)) {
    pacingStatus = "not_started";
    pacingLabel = "Noch nicht gestartet";
    pacingColor = "text-zinc-400";
    pacingBg = "bg-zinc-800/80 border-zinc-700";
  } else if (evalM.isAfter(endM)) {
    if (currentReach >= targetReach * 0.98) {
      pacingStatus = "completed_on_target";
      pacingLabel = "Ziel Erreicht";
      pacingColor = "text-emerald-400";
      pacingBg = "bg-emerald-500/10 border-emerald-500/30";
    } else {
      pacingStatus = "completed_under";
      pacingLabel = "Unter Ziel beendet";
      pacingColor = "text-amber-400";
      pacingBg = "bg-amber-500/10 border-amber-500/30";
    }
  } else {
    if (pacingIndex >= 90 && pacingIndex <= 110) {
      pacingStatus = "on_target";
      pacingLabel = "🎯 On Target";
      pacingColor = "text-emerald-400";
      pacingBg = "bg-emerald-500/10 border-emerald-500/30";
    } else if (pacingIndex > 110) {
      pacingStatus = "ahead";
      pacingLabel = "🚀 Ahead (+ Linear)";
      pacingColor = "text-amber-400";
      pacingBg = "bg-amber-500/10 border-amber-500/30";
    } else {
      pacingStatus = "behind";
      pacingLabel = "⚠️ Behind (- Linear)";
      pacingColor = "text-red-400";
      pacingBg = "bg-red-500/10 border-red-500/30";
    }
  }

  const timeProgress = totalDays > 0 ? Math.min((daysSinceStart / totalDays) * 100, 100) : 0;
  const reachProgress =
    targetReach > 0 ? Math.min((currentReach / targetReach) * 100, 100) : 0;
  const budgetProgress =
    bookedBudget > 0 ? Math.min((actualSpend / bookedBudget) * 100, 100) : 0;

  return {
    totalDays,
    daysSinceStart,
    remainingDays,
    timeProgress,
    bookedBudget,
    shouldSpend,
    actualSpend,
    deltaSpend,
    deltaPercent,
    currentReach,
    targetReach,
    shouldReach,
    reachDelta,
    reachDeltaPercent,
    pacingIndex,
    pacingStatus,
    pacingLabel,
    pacingColor,
    pacingBg,
    reachProgress,
    budgetProgress,
  };
};

/**
 * Helper to build a clean filtered & aggregated data table without summary text blocks.
 */
export const buildFilteredReportTable = ({
  campaignData,
  preset,
  showCreatives = true,
  showLineItems = true,
  includeCampaignName = false,
}) => {
  if (!campaignData) return [];

  const campaign = campaignData.campaign || {};
  const campaignName = preset?.campaignName ?? campaign.name ?? "Kampagne";

  const headers = [];
  if (includeCampaignName) headers.push("Kampagne");
  headers.push("Datum");
  if (showLineItems) headers.push("Line Item");
  if (showCreatives) headers.push("Creative");
  headers.push(
    "Impressions",
    "Revenue (€)",
    "Clicks",
    "CTR (%)",
    "Avg. VTR (%)",
    "25% View (Q1)",
    "50% View (Mid)",
    "75% View (Q3)",
    "100% View (Completes)"
  );

  const rawRows = campaignData.rawRows || [];

  if (rawRows.length > 0) {
    const groups = {};

    rawRows.forEach((row) => {
      const dateRaw = row["Date"] || row["date"] || row["Datum"];
      if (!dateRaw) return;

      const dateStr = moment(dateRaw).isValid()
        ? moment(dateRaw).format("YYYY-MM-DD")
        : String(dateRaw);

      const lineItemStr =
        row["Line Item"] ||
        row["Line item"] ||
        row["adgapid_booking"] ||
        row["Creative target ad unit size"] ||
        "";

      const creativeStr = row["Creative"] || row["creative"] || row["Creative Name"] || "";

      const keyParts = [dateStr];
      if (showLineItems) keyParts.push(lineItemStr);
      if (showCreatives) keyParts.push(creativeStr);
      const key = keyParts.join("___");

      if (!groups[key]) {
        groups[key] = {
          dateStr,
          lineItemStr,
          creativeStr,
          impressions: 0,
          revenue: 0,
          clicks: 0,
          q1: 0,
          mid: 0,
          q3: 0,
          completes: 0,
        };
      }

      const imp = getVal(row, [
        "Total impressions",
        "Impressions",
        "Total Impressions",
        "impressions",
        "Reach",
        "reach",
      ]);
      const rev = getVal(row, [
        "Total revenue",
        "Total CPM and CPC revenue",
        "Total CPM and CPC revenue (€)",
        "Revenue",
        "Revenue (€)",
        "Umsatz",
        "revenue",
      ]);
      const clk = getVal(row, ["Total clicks", "Clicks", "Total Clicks", "clicks"]);
      const q1Val = getVal(row, [
        "First quartiles",
        "First Quartiles",
        "First quartile",
        "First Quartile",
        "25% View",
        "25% View Through",
        "Q1",
        "q1",
      ]);
      const midVal = getVal(row, [
        "Midpoints",
        "Midpoint",
        "50% View",
        "50% View Through",
        "Mid",
        "Q2",
        "q2",
      ]);
      const q3Val = getVal(row, [
        "Third quartiles",
        "Third Quartiles",
        "Third quartile",
        "Third Quartile",
        "75% View",
        "75% View Through",
        "Q3",
        "q3",
      ]);
      const compVal = getVal(row, [
        "Completes",
        "Complete",
        "100% View",
        "100% View Through",
        "Video Completes",
        "completes",
      ]);

      groups[key].impressions += imp;
      groups[key].revenue += rev;
      groups[key].clicks += clk;
      groups[key].q1 += q1Val;
      groups[key].mid += midVal;
      groups[key].q3 += q3Val;
      groups[key].completes += compVal;
    });

    const sortedGroups = Object.values(groups).sort((a, b) =>
      a.dateStr > b.dateStr ? 1 : -1
    );

    const rows = [headers];

    sortedGroups.forEach((g) => {
      const imp = g.impressions;
      const ctr = imp > 0 ? (g.clicks / imp) * 100 : 0;
      const vtr = imp > 0 ? (g.completes / imp) * 100 : 0;

      const row = [];
      if (includeCampaignName) row.push(campaignName);
      row.push(moment(g.dateStr).format("DD.MM.YYYY"));
      if (showLineItems) row.push(g.lineItemStr);
      if (showCreatives) row.push(g.creativeStr);
      row.push(
        imp,
        Number(g.revenue.toFixed(2)),
        g.clicks,
        Number(ctr.toFixed(2)),
        Number(vtr.toFixed(2)),
        g.q1,
        g.mid,
        g.q3,
        g.completes
      );
      rows.push(row);
    });

    return rows;
  }

  // Fallback if rawRows is not available: use daily array
  const daily = campaignData.daily || [];
  const rows = [headers];

  daily.forEach((d) => {
    const imp = Number(d.reach || 0);
    const rev = Number(d.revenue || 0);

    const row = [];
    if (includeCampaignName) row.push(campaignName);
    row.push(moment(d.date).format("DD.MM.YYYY"));
    row.push(imp, Number(rev.toFixed(2)), 0, 0, 0, 0, 0, 0, 0);
    rows.push(row);
  });

  return rows;
};

/**
 * Export a single campaign to an Excel (.xlsx) file as a clean data table
 */
export const exportCampaignToExcel = ({
  campaignData,
  preset,
  showCreatives = true,
  showLineItems = true,
}) => {
  if (!campaignData) return;

  const campaign = campaignData.campaign || {};
  const campaignName = preset?.campaignName ?? campaign.name ?? "Kampagne";

  const tableData = buildFilteredReportTable({
    campaignData,
    preset,
    showCreatives,
    showLineItems,
    includeCampaignName: false,
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(tableData);

  const cols = tableData[0]?.map((_, colIndex) => {
    let maxLen = 12;
    tableData.forEach((row) => {
      const val = row[colIndex] ? String(row[colIndex]) : "";
      if (val.length > maxLen) maxLen = Math.min(val.length, 45);
    });
    return { wch: maxLen + 2 };
  });
  ws["!cols"] = cols;

  XLSX.utils.book_append_sheet(wb, ws, "Performance Report");

  const fileName = `${sanitizeFileName(campaignName)}_${getGermanDateString()}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export a single campaign to a CSV file as a clean data table
 */
export const exportCampaignToCSV = ({
  campaignData,
  preset,
  showCreatives = true,
  showLineItems = true,
}) => {
  if (!campaignData) return;

  const campaign = campaignData.campaign || {};
  const campaignName = preset?.campaignName ?? campaign.name ?? "Kampagne";

  const rows = buildFilteredReportTable({
    campaignData,
    preset,
    showCreatives,
    showLineItems,
    includeCampaignName: false,
  });

  const csvContent =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((cell) => {
            const str = cell === null || cell === undefined ? "" : String(cell);
            if (str.includes(";") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(";")
      )
      .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const fileName = `${sanitizeFileName(campaignName)}_${getGermanDateString()}.csv`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Bulk Export multiple campaigns into a single Excel Workbook
 */
export const exportBulkCampaignsToExcel = ({
  campaignsWithPresets,
  showCreatives = true,
  showLineItems = true,
  campaignOptionsMap = {},
  useIndividualExportOptions = true,
}) => {
  if (!campaignsWithPresets || campaignsWithPresets.length === 0) return;

  const wb = XLSX.utils.book_new();

  // 1. Master Summary Sheet with all rows combined
  let allCombinedRows = [];
  campaignsWithPresets.forEach(({ campaignData, preset }, idx) => {
    const cName = preset?.campaignName || campaignData?.campaign?.name || "";
    const opts = useIndividualExportOptions
      ? campaignOptionsMap[cName] || { showCreatives, showLineItems }
      : { showCreatives, showLineItems };

    const table = buildFilteredReportTable({
      campaignData,
      preset,
      showCreatives: opts.showCreatives,
      showLineItems: opts.showLineItems,
      includeCampaignName: true,
    });

    if (idx === 0) {
      allCombinedRows = table;
    } else {
      allCombinedRows.push(...table.slice(1));
    }
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(allCombinedRows);
  const summaryCols = allCombinedRows[0]?.map((_, colIndex) => {
    let maxLen = 12;
    allCombinedRows.forEach((row) => {
      const val = row[colIndex] ? String(row[colIndex]) : "";
      if (val.length > maxLen) maxLen = Math.min(val.length, 45);
    });
    return { wch: maxLen + 2 };
  });
  wsSummary["!cols"] = summaryCols;
  XLSX.utils.book_append_sheet(wb, wsSummary, "Gesamtübersicht");

  // 2. Individual dedicated sheets for each campaign
  campaignsWithPresets.forEach(({ campaignData, preset }, index) => {
    const campaign = campaignData.campaign || {};
    const campaignName = preset?.campaignName ?? campaign.name ?? `Kampagne ${index + 1}`;
    const opts = useIndividualExportOptions
      ? campaignOptionsMap[campaignName] || { showCreatives, showLineItems }
      : { showCreatives, showLineItems };

    const tableData = buildFilteredReportTable({
      campaignData,
      preset,
      showCreatives: opts.showCreatives,
      showLineItems: opts.showLineItems,
      includeCampaignName: false,
    });

    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const cols = tableData[0]?.map((_, colIndex) => {
      let maxLen = 12;
      tableData.forEach((row) => {
        const val = row[colIndex] ? String(row[colIndex]) : "";
        if (val.length > maxLen) maxLen = Math.min(val.length, 45);
      });
      return { wch: maxLen + 2 };
    });
    ws["!cols"] = cols;

    let cleanSheetName = campaignName.replace(/[:\\/?*\[\]]/g, "_").substring(0, 31);
    if (wb.SheetNames.includes(cleanSheetName)) {
      cleanSheetName = `${cleanSheetName.substring(0, 28)}_${index}`;
    }

    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
  });

  const fileName = `Weekly_Report_Gesamt_${getGermanDateString()}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
