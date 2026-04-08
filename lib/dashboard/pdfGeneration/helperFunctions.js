import moment from "moment";
import { tw } from "@lib/tw";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  Font,
  Image,
} from "@react-pdf/renderer";
import adFormatNames from "../AdFormatNames";

// Berechnet die Laufzeit einer Kampagne
// RETURN TYPE String
// Example output: '12.02.2025 - 15.03.2025'
const calculateRuntime = (offer) => {
  return (
    moment(
      offer.offers.reduce((accumulator, currentValue) => {
        if (accumulator === 0) return currentValue.start;
        return accumulator < currentValue.start
          ? accumulator
          : currentValue.start;
      }, 0)
    ).format("DD.MM.YY") +
    " – " +
    moment(
      offer.offers.reduce((accumulator, currentValue) => {
        if (accumulator === 0) return currentValue.end;
        return accumulator > currentValue.end ? accumulator : currentValue.end;
      }, 0)
    ).format("DD.MM.YY")
  );
};

// Sendet ein leeres Dokument, wenn die Rechnung nicht erstellt werden kann
// RETURN TYPE PDFjs Dokument
const abortGenerationIfPointless = (Document, Page, View, Text) => {
  return (
    <Document>
      <Page>
        <View class="">
          <Text>
            Du musst erst ein Angebot erstellen, um das PDF herunterladen zu
            können
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const Ueberschrift = ({ children }) => (
  <View
    style={tw("font-[Inter] text-2xl font-[600] tracking-tight leading-none")}
  >
    {children}
  </View>
);

const Zeitraum = ({ children }) => (
  <View style={tw("text-xs text-gray-700 leading-relaxed")}>{children}</View>
);

// TODO
// In Fliesstext aendern
const InfoSchrift = ({ children }) => (
  // TESTCASE - Wie sieht es aus, wenn wir alles in der gleichen Schrift arbeiten?
  <View
    style={tw("font-[Inter] text-xs text-gray-700 leading-relaxed font-[700]")}
  >
    {children}
  </View>
  // <View style={tw("text-[8px] tracking-wider uppercase text-bold bold font-bold")}>{children}</View>
);

const FliessText = ({ children }) => (
  <View style={tw("font-[Inter] text-xs text-gray-700 leading-relaxed")}>
    {children}
  </View>
);

const TableRightSide = ({ children }) => {
  return (
    <View style={tw("flex-1 px-2 text-right")}>
      <FliessText>{children}</FliessText>
    </View>
  );
};

const numberToEUR = (number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(number);
};

// Wie numberToEUR, aber mit bis zu 10 Nachkommastellen (für TKP/CPCV-Werte)
const numberToEURPrecise = (number) => {
  // Trim trailing zeros after decimal but keep at least 2
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 10,
  }).format(number);
  return formatted;
};

// Aggregation aller AdFormate
const calculateProductMetrics = (offer) => {
  const pricingModel = offer.pricingModel || "TKP";
  const metrics = {};

  adFormatNames.forEach((el, i) => {
    metrics[el.name] = {};
    metrics[el.name].tkp = numberToEURPrecise(
      offer.offers.reduce((acc, cur) => {
        if (cur.product !== el.name) return acc;
        return acc === 0 ? cur.tkp : (acc + cur.tkp) / 2;
      }, 0)
    );
    metrics[el.name].reach = offer.offers.reduce((acc, cur) => {
      if (cur.product !== el.name) return acc;
      return acc + cur.reach;
    }, 0);
    metrics[el.name].budget = numberToEUR(
      offer.offers.reduce((acc, cur) => {
        if (cur.product !== el.name) return acc;
        // CPCV: Budget = reach * tkp (kein /1000)
        // TKP: Budget = reach * tkp / 1000
        const contribution =
          pricingModel === "CPCV"
            ? cur.reach * cur.tkp
            : cur.reach * (cur.tkp / 1000);
        return acc + contribution;
      }, 0)
    );
  });

  return metrics;
};

// Die Aufgabe dieser Funktion ist es, aus einem Array eine
const reduceInformationFromOffersToString = (offer, key) => {
  // 1. Safety Guard: Falls offer oder offer.offers nicht existiert, leeren String zurückgeben
  if (!offer?.offers) return "";

  // 2. Werte extrahieren
  const values = offer.offers
    .map((el) => el[key])
    // 3. Nur undefined/null filtern (erlaubt 0 oder false)
    .filter((val) => val !== null && val !== undefined && val !== "");

  // 4. Set für Eindeutigkeit nutzen und joinen
  return [...new Set(values)].join(", ");
};

export {
  calculateRuntime,
  abortGenerationIfPointless,
  Ueberschrift,
  InfoSchrift,
  FliessText,
  TableRightSide,
  numberToEUR,
  numberToEURPrecise,
  Zeitraum,
  calculateProductMetrics,
  reduceInformationFromOffersToString,
};
