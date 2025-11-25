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

// Aggregation aller AdFormate
const calculateProductMetrics = (offer) => {
  const metrics = {};

  adFormatNames.forEach((el, i) => {
    metrics[el.name] = {};
    metrics[el.name].tkp = numberToEUR(
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
        return acc + cur.reach * (cur.tkp / 1000);
      }, 0)
    );
  });

  return metrics;
};

// Die Aufgabe dieser Funktion ist es, aus einem Array eine
const reduceInformationFromOffersToString = (offer, key) => {
  const capitalizeFirstLetter = (val) => {
    val = val.toLowerCase();
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  };
  const arrayOfInformation = [];

  offer.offers.forEach((el) => {
    if (!el[key]) return;
    arrayOfInformation.push(capitalizeFirstLetter(el[key]));
  });

  return [...new Set(arrayOfInformation)].join(", ");
};

export {
  calculateRuntime,
  abortGenerationIfPointless,
  Ueberschrift,
  InfoSchrift,
  FliessText,
  TableRightSide,
  numberToEUR,
  Zeitraum,
  calculateProductMetrics,
  reduceInformationFromOffersToString,
};
