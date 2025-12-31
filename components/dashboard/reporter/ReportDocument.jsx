import React from "react";
import {
  Page,
  Font,
  Text,
  View,
  Image as PdfImage, // <--- HIER IST DER FIX (Alias)
  Document,
  StyleSheet,
  Svg,
  Path,
  Rect,
} from "@react-pdf/renderer";
import moment from "moment";

// --- STYLES bleiben gleich ---
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: 20,
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ab8353",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    fontFamily: "Inter",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  subTitle: { fontSize: 10, color: "#cccccc" },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    height: "85%",
    gap: 10,
  },
  card: {
    width: "48%",
    height: "48%",
    padding: 10,
    border: "1px solid #333",
    backgroundColor: "#111",
    borderRadius: 4,
  },
  cardTitle: {
    color: "#ab8353",
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
    fontFamily: 'Inter'
  },
  bigNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 5,
  },
  label: { fontSize: 10, color: "#888", textAlign: "center" },
  barContainer: {
    marginTop: 10,
    height: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  barLabel: { width: 60, fontSize: 9, color: "#aaa" },
  barTrack: { flex: 1, height: 8, backgroundColor: "#333", borderRadius: 4 },
  barFill: { height: "100%", backgroundColor: "#ab8353", borderRadius: 4 },
  // Hilfsstyle für Chart Container
  chartContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

// --- FONT REGISTER bleibt gleich ---
Font.register({
  family: "Inter",
  fonts: [
    { src: "/Inter_18pt-Regular.ttf", format: "truetype" }, // Pfade ggf. anpassen!
    { src: "/Inter_18pt-Bold.ttf", format: "truetype", fontWeight: "bold" },
  ],
});

// Helper
const formatCurrency = (num) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    num
  );
const formatNumber = (num) => new Intl.NumberFormat("de-DE").format(num);
const formatPercent = (num) => (num * 100).toFixed(1) + "%";

// --- HAUPTKOMPONENTE ---
export const ReportDocument = ({ data, charts }) => {
  const {
    campaignName,
    startDate,
    endDate,
    bookedReach,
    deliveredImpressions,
    bookedBudget,
    spentBudget,
  } = data;
  const reachPercent = deliveredImpressions / bookedReach;
  const budgetPercent = spentBudget / bookedBudget;
  console.log(charts)
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reporting für {campaignName}</Text>
            <Text style={styles.subTitle}>
              Laufzeit: {moment(startDate).format("L")} bis{" "}
              {moment(endDate).format("L")} | Reporting: {moment().format('L')}
            </Text>
          </View>
        </View>

        {/* GRID */}
        <View style={styles.grid}>
          {/* Q1: SVG Chart (Funktioniert nativ in React-PDF) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>REICHWEITEN-ZIEL</Text>
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <PdfImage src={charts.reachChart} height={'10px'} width={'50px'} />
              <Text style={styles.bigNumber}>
                {formatPercent(reachPercent)}
              </Text>
            </View>
          </View>

          {/* Q2: KPIs */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PERFORMANCE</Text>
            {/* ... Dein KPI Code ... */}
          </View>

          {/* Q3: CHART.JS BILDER EINFÜGEN */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>IMPRESSIONEN</Text>
            <View style={styles.chartContainer}>
              {/* HIER IST DIE ÄNDERUNG: 
                    1. Wir prüfen ob das Bild da ist.
                    2. Wir nutzen PdfImage statt Image.
                */}
              {charts.trendChart ? (
                <PdfImage
                  src={charts.trendChart}
                  style={{ width: "100%", objectFit: "contain" }}
                />
              ) : (
                <Text style={styles.label}>Lade Chart...</Text>
              )}
            </View>
          </View>

          {/* Q4: BUDGET (Mit ChartJS Bild) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>BUDGET VERTEILUNG</Text>
            <View style={styles.chartContainer}>
              {charts.budgetChart ? (
                <PdfImage
                  src={charts.budgetChart}
                  style={{ width: "100%", objectFit: "contain" }}
                />
              ) : (
                <Text style={styles.label}>Lade Chart...</Text>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
