// Beispiel-Dateiname: /components/DownloadPDFButton.js

import { createTw } from "react-pdf-tailwind";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  Font,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import moment from "moment";
import "moment/locale/de"; // Wichtig für deutsche Datumsformate

// TODO: Bitte passe den Pfad zu deiner Helfer-Funktion an!
import calculateUpchargeInformation from "./pdfgeneration/calculateUpchargeInformation";


// --- 1. SETUP & STYLING ---

// Lade die Schriftarten (muss nur einmal pro App-Lauf passieren)
Font.register({
  family: "Lato",
  fonts: [
    { src: "/Lato-Regular.ttf" },
    { src: "/Lato-Bold.ttf", fontWeight: "bold" },
  ],
});

// Definiere eine MONOCHROME Farbpalette und Schriftarten im Tailwind Config
export const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Lato"],
    },
    extend: {
      colors: {
        // Monochromes Farbschema
        brand: "#1a1a1a", // Sehr dunkles Grau (fast schwarz) für wichtige Elemente
        accent: "#4a4a4a", // Etwas helleres Dunkelgrau für Akzente
        light: "#f0f0f0", // Sehr helles Grau für Hintergründe
        medium: "#a0a0a0", // Mittleres Grau für gedämpfte Texte
        dark: "#333333", // Dunkler Text
        border: "#cccccc", // Hellgrau für Linien
        white: "#ffffff", // Reines Weiß
        black: "#000000", // Reines Schwarz
      },
    },
  },
});

// Zusätzliche Styles, die mit Tailwind schwer umzusetzen sind
const styles = StyleSheet.create({
  page: {
    fontFamily: "Lato",
    backgroundColor: tw.theme.extend.colors.white, // Reines Weiß als Seitenhintergrund
    padding: 0,
  },
  body: {
    paddingTop: 24,
    paddingBottom: 120, // Mehr Platz nach unten wegen dem fixierten Footer
    paddingHorizontal: 48,
  },
  tableRowAlt: {
    backgroundColor: tw.theme.extend.colors.light, // Nutzt das helle Grau
  },
});


// --- 2. WIEDERVERWENDBARE PDF-HELFERKOMPONENTEN ---

const PageHeader = ({ user, userEmail, contact, contactEmail }) => (
  <View style={tw("bg-brand text-white flex flex-row justify-between items-center p-6 px-12")}>
    <View style={tw("flex-1")}>
      <Text style={tw("font-bold text-lg")}>Angebot</Text>
      <View style={tw("mt-4 text-xs")}>
        <Text>Von: {user} ({userEmail})</Text>
        <Text>An: {contact} ({contactEmail})</Text>
      </View>
    </View>
    <View style={tw("flex-1 items-end")}>
      {/* Das Logo sollte idealerweise auch eine S/W-Version sein oder im Code in S/W umgewandelt werden */}
      <Image src="/HoTLogo.png" style={tw("max-w-[10rem]")} />
    </View>
  </View>
);

const PageFooter = () => (
    <View
      style={tw("bg-light text-medium text-[7px] p-6 px-12 absolute bottom-0 w-full")}
      fixed // Hält den Footer auf jeder Seite
    >
      <Text style={tw("text-center mb-2")}>
        LEONINE Licensing GmbH · Taunusstr. 21 · 80807 München · Tel: +49 89 999 513 0 · Email info@leoninestudios.com
      </Text>
      <Text style={tw("text-center")}>
        Geschäftsführer: Fred Kogel, Dr. Lisa Giehl, Stephan Kathmann, Bernhard zu Castell · Sitz: München · HRB 272 911 · USt-IdNr. DE 323 797 373
      </Text>
    </View>
);

const CostTableRow = ({ label, reach, budget, tkp, isHeader = false, isTotal = false, isAlt = false }) => {
  const rowStyle = [
    tw("flex flex-row items-center border-b border-border text-sm"), // Verwendet 'border' Farbe
    isHeader && tw("bg-light font-bold text-dark"), // Header Hintergrund 'light'
    isTotal && tw("bg-brand text-white font-bold"), // Total Hintergrund 'brand'
    !isHeader && !isTotal && isAlt && styles.tableRowAlt,
  ];

  return (
    <View style={rowStyle}>
      <Text style={tw("w-3/5 p-2")}>{label}</Text>
      <Text style={tw("w-1/5 p-2 text-right")}>{reach}</Text>
      <Text style={tw("w-1/5 p-2 text-right")}>{tkp}</Text>
      <Text style={tw("w-1/5 p-2 text-right")}>{budget}</Text>
    </View>
  );
};

const OfferDetailCard = ({ item, index }) => {
  moment.locale("de");

  const offerBudget = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    (item.tkp * item.reach) / 1000 + (item.upcharge ? ((item.upcharge * item.upchargeTKP) / 1000) * item.reach : 0)
  );
  
  const attributes = [
    { label: "Produkt", value: item.product },
    { label: "TKP", value: item.tkp ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(item.tkp) : null },
    { label: "Rotation", value: item.rotation },
    { label: "Frequency Cap", value: item.frequencyCap },
    { label: "Alterstargeting", value: item.age },
    { label: "Geschlecht", value: item.gender },
    { label: "Platzierung", value: item.placement },
    { label: "Ausspielung", value: item.platform },
    { label: "Geographie", value: item.plz },
  ].filter(attr => attr.value);

  return (
    <View style={tw("border border-border rounded-lg overflow-hidden mb-6")} wrap={false}> {/* Border mit 'border' Farbe */}
      <View style={tw("bg-light p-4 flex flex-row justify-between items-center")}> {/* Header Hintergrund 'light' */}
        <Text style={tw("text-base font-bold text-dark")}> {/* Textfarbe 'dark' */}
          Produktbaustein {index + 1}: {item.product}
        </Text>
        <Text style={tw("text-sm text-medium")}> {/* Textfarbe 'medium' */}
          {moment(item.start).format("L")} - {moment(item.end).format("L")}
        </Text>
      </View>
      <View style={tw("p-4")}>
        <View style={tw("flex flex-row justify-between items-center bg-light p-3 rounded-md mb-4")}> {/* Hintergrund 'light' */}
           <View style={tw("text-center flex-1")}>
              <Text style={tw("text-xs text-medium")}>Impressions</Text> {/* Textfarbe 'medium' */}
              <Text style={tw("text-lg font-bold text-dark")}>{new Intl.NumberFormat("de-DE").format(item.reach)}</Text> {/* Textfarbe 'dark' */}
           </View>
            <View style={tw("text-center flex-1")}>
              <Text style={tw("text-xs text-medium")}>Budget (netto)</Text> {/* Textfarbe 'medium' */}
              <Text style={tw("text-lg font-bold text-dark")}>{offerBudget}</Text> {/* Textfarbe 'dark' */}
           </View>
        </View>
        <Text style={tw("text-sm font-bold text-dark mb-2")}>Details & Targeting:</Text> {/* Textfarbe 'dark' */}
        <View style={tw("flex flex-row flex-wrap")}>
          {attributes.map((attr, i) => (
            <View key={i} style={tw("w-1/2 flex flex-row mb-1 pr-2")}>
              <Text style={tw("text-xs w-2/5 text-medium")}>{attr.label}:</Text> {/* Textfarbe 'medium' */}
              <Text style={tw("text-xs w-3/5 font-bold text-dark")}>{attr.value}</Text> {/* Textfarbe 'dark' */}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};


// --- 3. DIE HAUPT-PDF-KOMPONENTE ---
const ModernDoc = ({ campaignName, offer, contact, contactEmail, user, userEmail }) => {
  moment.locale("de");

  const upchargeMetrics = calculateUpchargeInformation(offer);
  const numberToEUR = (number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(number);

  const today = moment().format("LL");
  const gueltigkeitsDatum = moment().add(14, "days").format("LL");
  
  const baseBudget = offer.offers.reduce((acc, curr) => acc + (curr.reach * curr.tkp) / 1000, 0);
  const totalBudget = baseBudget + upchargeMetrics.totalCosts;
  const totalReach = offer.offers.reduce((acc, curr) => acc + curr.reach, 0);

  const getProductMetrics = (productName) => {
    const relevantOffers = offer.offers.filter(o => o.product === productName);
    if (relevantOffers.length === 0) return { reach: 0, budget: 0, tkp: 0 };
    const reach = relevantOffers.reduce((a, c) => a + c.reach, 0);
    const budget = relevantOffers.reduce((a, c) => a + (c.reach * c.tkp) / 1000, 0);
    const tkp = reach > 0 ? (budget / reach * 1000) : 0;
    return { reach, budget, tkp };
  };

  const nonskip = getProductMetrics("NONSKIPPABLE");
  const skippable = getProductMetrics("SKIPPABLE");
  const bumper = getProductMetrics("BUMPER");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PageHeader user={user} userEmail={userEmail} contact={contact} contactEmail={contactEmail} />
        <View style={styles.body}>
          <View style={tw("mb-8")}>
            <Text style={tw("text-2xl font-bold text-dark")}>Angebot für Kampagne: {campaignName}</Text>
            <Text style={tw("text-sm text-medium mt-2")}>Angebots-Nr: {offer.offernumber} | Datum: {today} | Gültig bis: {gueltigkeitsDatum}</Text>
          </View>
          <View style={tw("text-sm text-dark leading-6 mb-12")}>
            <Text>Sehr geehrte Damen und Herren,</Text>
            <Text>vielen Dank für Ihr Interesse. Wir freuen uns, Ihnen folgendes Angebot zu unterbreiten:</Text>
          </View>
          <View>
            <Text style={tw("text-lg font-bold text-brand mb-4")}>Angebotsübersicht</Text> {/* Titel in 'brand' Farbe */}
            <View style={tw("border border-border rounded-lg overflow-hidden")}> {/* Border mit 'border' Farbe */}
               <CostTableRow isHeader label="Position" reach="Impressions" tkp="TKP (netto)" budget="Budget (netto)" />
               {nonskip.reach > 0 && <CostTableRow label="Nonskippable" reach={new Intl.NumberFormat("de-DE").format(nonskip.reach)} tkp={numberToEUR(nonskip.tkp)} budget={numberToEUR(nonskip.budget)} isAlt={false} />}
               {skippable.reach > 0 && <CostTableRow label="Skippable" reach={new Intl.NumberFormat("de-DE").format(skippable.reach)} tkp={numberToEUR(skippable.tkp)} budget={numberToEUR(skippable.budget)} isAlt={true} />}
               {bumper.reach > 0 && <CostTableRow label="Bumper Ad" reach={new Intl.NumberFormat("de-DE").format(bumper.reach)} tkp={numberToEUR(bumper.tkp)} budget={numberToEUR(bumper.budget)} isAlt={false} />}
               {upchargeMetrics.ageUpcharge.cost > 0 && <CostTableRow label="Upcharge: Alterstargeting" reach="" tkp={numberToEUR(upchargeMetrics.ageUpcharge.tkp)} budget={numberToEUR(upchargeMetrics.ageUpcharge.cost)} isAlt={true} />}
               {upchargeMetrics.genderUpcharge.cost > 0 && <CostTableRow label="Upcharge: Geschlecht" reach="" tkp={numberToEUR(upchargeMetrics.genderUpcharge.tkp)} budget={numberToEUR(upchargeMetrics.genderUpcharge.cost)} isAlt={false} />}
               {upchargeMetrics.platformUpcharge.cost > 0 && <CostTableRow label="Upcharge: Plattform" reach="" tkp={numberToEUR(upchargeMetrics.platformUpcharge.tkp)} budget={numberToEUR(upchargeMetrics.platformUpcharge.cost)} isAlt={true} />}
               {upchargeMetrics.placementUpcharge.cost > 0 && <CostTableRow label="Upcharge: Platzierung" reach="" tkp={numberToEUR(upchargeMetrics.placementUpcharge.tkp)} budget={numberToEUR(upchargeMetrics.placementUpcharge.cost)} isAlt={false} />}
               <CostTableRow isTotal label="Gesamtbetrag (netto)" reach={new Intl.NumberFormat("de-DE").format(totalReach)} tkp="" budget={numberToEUR(totalBudget)} />
            </View>
          </View>
          <View style={tw("text-xs text-medium mt-12")}> {/* Textfarbe 'medium' */}
             <Text style={tw("mb-3")}>Alle genannten Beträge sind Nettobeträge zzgl. der gesetzlichen MwSt. Rechnungen sind innerhalb von 14 Tagen fällig.</Text>
             <Text>Wir freuen uns auf eine baldige Rückmeldung und eine erfolgreiche Zusammenarbeit.</Text>
          </View>
        </View>
        <PageFooter />
      </Page>
      <Page size="A4" style={styles.page}>
         <PageHeader user={user} userEmail={userEmail} contact={contact} contactEmail={contactEmail} />
         <View style={styles.body}>
            <Text style={tw("text-2xl font-bold text-dark mb-8")}>Angebotsbausteine im Detail</Text>
            {offer.offers.map((item, index) => (
                <OfferDetailCard key={index} item={item} index={index} />
            ))}
         </View>
         <PageFooter />
      </Page>
    </Document>
  );
};


// --- 4. DIE BUTTON-KOMPONENTE, DIE DU IN DEINER APP VERWENDEST ---

const DownloadPDFButton = ({
  campaignName,
  offer,
  advertiser,
  contact,
  contactEmail,
  user,
  userEmail,
}) => {
  return (
    <>
      <PDFDownloadLink
        document={
          <ModernDoc
            campaignName={campaignName}
            offer={offer}
            contact={contact}
            contactEmail={contactEmail}
            user={user}
            userEmail={userEmail}
          />
        }
        fileName={`${campaignName}.pdf`}
        // Angepasstes Tailwind-Styling für den Button im S/W-Stil
        style={tw(
          "inline-flex items-center gap-x-1.5 rounded-md bg-brand px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        )}
      >
        {({ blob, url, loading, error }) =>
          loading ? "Dokument wird geladen..." : "Download"
        }
      </PDFDownloadLink>
    </>
  );
};


// --- 5. DER DEFAULT EXPORT ---
export default DownloadPDFButton;