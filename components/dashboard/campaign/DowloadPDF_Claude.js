import { createTw } from "react-pdf-tailwind";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  Font,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
import calculateUpchargeInformation from "./pdfgeneration/calculateUpchargeInformation";

const DownloadPDFButton = ({
  campaignName,
  offer,
  advertiser,
  contact,
  contactEmail,
  user,
  userEmail,
}) => {
  Font.register({
    family: "Inter",
    fonts: [
      { src: "/Inter-Regular.ttf", format: "truetype" },
      { src: "/Inter-Light.ttf", format: "truetype", fontWeight: 300 },
      { src: "/Inter-Medium.ttf", format: "truetype", fontWeight: 500 },
      { src: "/Inter-SemiBold.ttf", format: "truetype", fontWeight: 600 },
      { src: "/Inter-Bold.ttf", format: "truetype", fontWeight: 700 },
      { src: "/Inter-Black.ttf", format: "truetype", fontWeight: 900 },
    ],
  });

  return (
    <>
      <PDFDownloadLink
        document={
          <MyDoc
            campaignName={campaignName}
            offer={offer}
            advertiser={advertiser}
            contact={contact}
            contactEmail={contactEmail}
            user={user}
            userEmail={userEmail}
          />
        }
        fileName={`${campaignName}.pdf`}
        style={tw(
          "inline-flex items-center gap-x-1.5 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-2xl hover:bg-gray-800 transition-all duration-200"
        )}
      >
        {({ blob, url, loading, error }) =>
          loading ? "Generiere PDF..." : "Download PDF"
        }
      </PDFDownloadLink>
    </>
  );
};

export default DownloadPDFButton;

export const MyDoc = ({
  campaignName,
  offer,
  contact,
  contactEmail,
  user,
  userEmail,
}) => {
  const { product } = offer;
  const upchargeMetrics = calculateUpchargeInformation(offer);

  const numberToEUR = (number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(number);
  };

  const today = moment().format("DD.MM.YYYY");
  const gueltigkeitsDatum = moment().add(14, "days").format("DD.MM.YYYY");
  const zeitraum =
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
    ).format("DD.MM.YY");

  const totalBudget = numberToEUR(
    offer.offers.reduce(
      (accumulator, currentValue) =>
        accumulator + (currentValue.reach * currentValue.tkp) / 1000,
      0
    ) + upchargeMetrics.totalCosts
  );

  const totalReach = offer.offers.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.reach;
  }, 0);

  // Produktspezifische Berechnungen
  const productMetrics = {
    BUMPER: {
      tkp: numberToEUR(
        offer.offers.reduce((acc, cur) => {
          if (cur.product !== "BUMPER") return acc;
          return acc === 0 ? cur.tkp : (acc + cur.tkp) / 2;
        }, 0)
      ),
      reach: offer.offers.reduce((acc, cur) => {
        if (cur.product !== "BUMPER") return acc;
        return acc + cur.reach;
      }, 0),
      budget: numberToEUR(
        offer.offers.reduce((acc, cur) => {
          if (cur.product !== "BUMPER") return acc;
          return acc + cur.reach * (cur.tkp / 1000);
        }, 0)
      ),
    },
    NONSKIPPABLE: {
      tkp: numberToEUR(
        offer.offers.reduce((acc, cur) => {
          if (cur.product !== "NONSKIPPABLE") return acc;
          return acc === 0 ? cur.tkp : (acc + cur.tkp) / 2;
        }, 0)
      ),
      reach: offer.offers.reduce((acc, cur) => {
        if (cur.product !== "NONSKIPPABLE") return acc;
        return acc + cur.reach;
      }, 0),
      budget: numberToEUR(
        offer.offers.reduce((acc, cur) => {
          if (cur.product !== "NONSKIPPABLE") return acc;
          return acc + cur.reach * (cur.tkp / 1000);
        }, 0)
      ),
    },
    SKIPPABLE: {
      tkp: numberToEUR(
        offer.offers.reduce((acc, cur) => {
          if (cur.product !== "SKIPPABLE") return acc;
          return acc === 0 ? cur.tkp : (acc + cur.tkp) / 2;
        }, 0)
      ),
      reach: offer.offers.reduce((acc, cur) => {
        if (cur.product !== "SKIPPABLE") return acc;
        return acc + cur.reach;
      }, 0),
      budget: numberToEUR(
        offer.offers.reduce((acc, cur) => {
          if (cur.product !== "SKIPPABLE") return acc;
          return acc + cur.reach * (cur.tkp / 1000);
        }, 0)
      ),
    },
  };

  return (
    <Document>
      {/* SEITE 1 - KERNINFOS */}
      <Page size="A4" style={tw("bg-white text-black")}>
        <View style={tw("px-12 pt-12")}>
          {/* Logo und Meta Info in einer Linie */}
          <View style={tw("flex flex-row justify-between items-start mb-10")}>
            <View>
              <Text style={tw("text-[8px] text-gray-400 tracking-wider uppercase")}>
                LEONINE Licensing GmbH
              </Text>
              <Text style={tw("text-[7px] text-gray-400")}>
                Taunusstr. 21 · 80807 München
              </Text>
            </View>
            <Image src="/HoTLogo.png" style={tw("w-24 h-auto opacity-90")} />
          </View>

          {/* HERO SECTION - Fließend ohne harte Boxen */}
          <View style={tw("relative mb-8")}>
            {/* Kampagnenname als großer Eyecatcher */}
            <Text style={tw("text-5xl font-black tracking-tight leading-none")}>
              {campaignName}
            </Text>
            
            {/* Angebotsnummer direkt darunter, subtil */}
            <Text style={tw("text-[9px] text-gray-500 mt-2 tracking-widest uppercase")}>
              Angebot {offer.offernumber} · {today}
            </Text>

            {/* Großes schwarzes Element für Budget - mit Rundung für Flow */}
            <View style={tw("absolute -right-12 -top-3 bg-black text-white px-8 py-4 rounded-l-full")}>
              <Text style={tw("text-3xl font-black")}>{totalBudget}</Text>
              <Text style={tw("text-[7px] uppercase tracking-wider opacity-70")}>
                Budget Netto
              </Text>
            </View>
          </View>

          {/* MINI META BAR - Alles in einer Zeile */}
          <View style={tw("flex flex-row items-center gap-4 text-[9px] text-gray-600 mb-8 ml-1")}>
            <Text>
              <Text style={tw("text-black font-semibold")}>{zeitraum}</Text>
            </Text>
            <Text style={tw("text-gray-400")}>•</Text>
            <Text>
              <Text style={tw("text-black font-semibold")}>
                {new Intl.NumberFormat("de-DE").format(totalReach)}
              </Text> Impressions
            </Text>
            <Text style={tw("text-gray-400")}>•</Text>
            <Text>Gültig bis {gueltigkeitsDatum}</Text>
          </View>

          {/* KUNDE - Klein und elegant */}
          <View style={tw("mb-8")}>
            <View style={tw("inline-flex flex-row items-baseline gap-3")}>
              <Text style={tw("text-[8px] uppercase tracking-wider text-gray-400")}>
                Für
              </Text>
              <Text style={tw("text-base font-semibold text-black")}>
                {contact}
              </Text>
              <Text style={tw("text-[9px] text-gray-500")}>
                {contactEmail}
              </Text>
            </View>
          </View>

          {/* ANREDE */}
          <Text style={tw("text-xs text-gray-700 mb-8 leading-relaxed")}>
            Sehr geehrte Damen und Herren,{"\n"}
            wir freuen uns, Ihnen folgendes Angebot zu unterbreiten:
          </Text>

          {/* PRODUKTÜBERSICHT - Fließende Tabelle */}
          <View style={tw("mb-10")}>
            {/* Header mit durchgehender Linie */}
            <View style={tw("flex flex-row items-baseline border-b-2 border-black pb-2 mb-4")}>
              <Text style={tw("flex-1 text-[8px] font-black uppercase tracking-wider")}>
                Home of Talents Media
              </Text>
              <Text style={tw("w-20 text-right text-[8px] uppercase tracking-wider text-gray-500")}>
                TKP (net)
              </Text>
              <Text style={tw("w-24 text-right text-[8px] uppercase tracking-wider text-gray-500")}>
                Impressions
              </Text>
              <Text style={tw("w-24 text-right text-[8px] font-black uppercase tracking-wider")}>
                Budget (net)
              </Text>
            </View>

            {/* Products mit fließenden Linien */}
            {productMetrics.NONSKIPPABLE.reach > 0 && (
              <View style={tw("flex flex-row py-2.5 border-b border-gray-100")}>
                <View style={tw("flex-1 flex flex-row items-center gap-3")}>
                  <View style={tw("w-1.5 h-1.5 bg-black rounded-full")} />
                  <Text style={tw("text-sm")}>Nonskippable</Text>
                </View>
                <Text style={tw("w-20 text-right text-xs text-gray-600")}>
                  {productMetrics.NONSKIPPABLE.tkp}
                </Text>
                <Text style={tw("w-24 text-right text-xs text-gray-600")}>
                  {new Intl.NumberFormat("de-DE").format(productMetrics.NONSKIPPABLE.reach)}
                </Text>
                <Text style={tw("w-24 text-right text-sm font-semibold")}>
                  {productMetrics.NONSKIPPABLE.budget}
                </Text>
              </View>
            )}

            {productMetrics.SKIPPABLE.reach > 0 && (
              <View style={tw("flex flex-row py-2.5 border-b border-gray-100")}>
                <View style={tw("flex-1 flex flex-row items-center gap-3")}>
                  <View style={tw("w-1.5 h-1.5 bg-gray-600 rounded-full")} />
                  <Text style={tw("text-sm")}>Skippable</Text>
                </View>
                <Text style={tw("w-20 text-right text-xs text-gray-600")}>
                  {productMetrics.SKIPPABLE.tkp}
                </Text>
                <Text style={tw("w-24 text-right text-xs text-gray-600")}>
                  {new Intl.NumberFormat("de-DE").format(productMetrics.SKIPPABLE.reach)}
                </Text>
                <Text style={tw("w-24 text-right text-sm font-semibold")}>
                  {productMetrics.SKIPPABLE.budget}
                </Text>
              </View>
            )}

            {productMetrics.BUMPER.reach > 0 && (
              <View style={tw("flex flex-row py-2.5 border-b border-gray-100")}>
                <View style={tw("flex-1 flex flex-row items-center gap-3")}>
                  <View style={tw("w-1.5 h-1.5 bg-gray-400 rounded-full")} />
                  <Text style={tw("text-sm")}>Bumper Short Ad</Text>
                </View>
                <Text style={tw("w-20 text-right text-xs text-gray-600")}>
                  {productMetrics.BUMPER.tkp}
                </Text>
                <Text style={tw("w-24 text-right text-xs text-gray-600")}>
                  {new Intl.NumberFormat("de-DE").format(productMetrics.BUMPER.reach)}
                </Text>
                <Text style={tw("w-24 text-right text-sm font-semibold")}>
                  {productMetrics.BUMPER.budget}
                </Text>
              </View>
            )}

            {/* Upcharges inline wenn vorhanden */}
            {upchargeMetrics.isUpcharge && upchargeMetrics.totalCosts > 0 && (
              <>
                {upchargeMetrics.ageUpcharge.cost > 0 && (
                  <View style={tw("flex flex-row py-2 pl-6")}>
                    <Text style={tw("flex-1 text-[10px] text-gray-500 italic")}>
                      + Upcharge Alterstargeting
                    </Text>
                    <Text style={tw("w-20 text-right text-[10px] text-gray-500")}>
                      {numberToEUR(upchargeMetrics.ageUpcharge.tkp)}
                    </Text>
                    <Text style={tw("w-24 text-right text-[10px] text-gray-500")}>
                      {new Intl.NumberFormat("de-DE").format(upchargeMetrics.ageUpcharge.reach)}
                    </Text>
                    <Text style={tw("w-24 text-right text-xs text-gray-600")}>
                      {numberToEUR(upchargeMetrics.ageUpcharge.cost)}
                    </Text>
                  </View>
                )}
                
                {upchargeMetrics.genderUpcharge.cost > 0 && (
                  <View style={tw("flex flex-row py-2 pl-6")}>
                    <Text style={tw("flex-1 text-[10px] text-gray-500 italic")}>
                      + Upcharge Geschlechtertargeting
                    </Text>
                    <Text style={tw("w-20 text-right text-[10px] text-gray-500")}>
                      {numberToEUR(upchargeMetrics.genderUpcharge.tkp)}
                    </Text>
                    <Text style={tw("w-24 text-right text-[10px] text-gray-500")}>
                      {new Intl.NumberFormat("de-DE").format(upchargeMetrics.genderUpcharge.reach)}
                    </Text>
                    <Text style={tw("w-24 text-right text-xs text-gray-600")}>
                      {numberToEUR(upchargeMetrics.genderUpcharge.cost)}
                    </Text>
                  </View>
                )}

                {upchargeMetrics.platformUpcharge.cost > 0 && (
                  <View style={tw("flex flex-row py-2 pl-6")}>
                    <Text style={tw("flex-1 text-[10px] text-gray-500 italic")}>
                      + Upcharge Platformausspielung
                    </Text>
                    <Text style={tw("w-20 text-right text-[10px] text-gray-500")}>
                      {numberToEUR(upchargeMetrics.platformUpcharge.tkp)}
                    </Text>
                    <Text style={tw("w-24 text-right text-[10px] text-gray-500")}>
                      {new Intl.NumberFormat("de-DE").format(upchargeMetrics.platformUpcharge.reach)}
                    </Text>
                    <Text style={tw("w-24 text-right text-xs text-gray-600")}>
                      {numberToEUR(upchargeMetrics.platformUpcharge.cost)}
                    </Text>
                  </View>
                )}

                {upchargeMetrics.placementUpcharge.cost > 0 && (
                  <View style={tw("flex flex-row py-2 pl-6")}>
                    <Text style={tw("flex-1 text-[10px] text-gray-500 italic")}>
                      + Upcharge Positionierung
                    </Text>
                    <Text style={tw("w-20 text-right text-[10px] text-gray-500")}>
                      {numberToEUR(upchargeMetrics.placementUpcharge.tkp)}
                    </Text>
                    <Text style={tw("w-24 text-right text-[10px] text-gray-500")}>
                      {new Intl.NumberFormat("de-DE").format(upchargeMetrics.placementUpcharge.reach)}
                    </Text>
                    <Text style={tw("w-24 text-right text-xs text-gray-600")}>
                      {numberToEUR(upchargeMetrics.placementUpcharge.cost)}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Total als fließender Abschluss */}
            <View style={tw("flex flex-row pt-4 mt-2 border-t-2 border-black")}>
              <Text style={tw("flex-1 text-sm font-black uppercase")}>Total</Text>
              <Text style={tw("w-24 text-right text-sm font-bold")}>
                {new Intl.NumberFormat("de-DE").format(totalReach)}
              </Text>
              <Text style={tw("w-24 text-right text-base font-black")}>
                {totalBudget}
              </Text>
            </View>
          </View>

          {/* HINWEISE */}
          <View style={tw("mt-auto")}>
            <Text style={tw("text-[9px] leading-relaxed text-gray-600 mb-3")}>
              Das vereinbarte Buchungsvolumen kann innerhalb des Leistungszeitraums frei im Rahmen der vereinbarten Rotation verteilt werden. 
              Turnusmäßige Leistungsnachweise erfolgen in Form von PDF- und Excel-Reports, jeweils montags nach Kampagnenstart.
            </Text>
            <Text style={tw("text-[9px] leading-relaxed text-gray-600 mb-3")}>
              Bei den genannten Beträgen handelt es sich um Nettobeträge, die jeweils zzgl. der jeweils gültigen MwSt. gelten. 
              Rechnungen im Zusammenhang mit unserem Angebot sind innerhalb von 14 Tagen ab Rechnungszugang fällig.
            </Text>
            <Text style={tw("text-sm font-semibold mt-4")}>
              Wir freuen uns über baldige Rückmeldung.
            </Text>
            
            {/* Ersteller Info */}
            <View style={tw("flex flex-row justify-between items-end mt-8 pt-4 border-t border-gray-200")}>
              <View>
                <Text style={tw("text-[7px] text-gray-400 uppercase tracking-wider mb-1")}>
                  Angebot erstellt von
                </Text>
                <Text style={tw("text-[8px] text-gray-600")}>
                  {user} · {userEmail}
                </Text>
              </View>
              <Text style={tw("text-[6px] text-gray-400")}>
                LEONINE Licensing GmbH · HRB 272 911 · USt-IdNr. DE 323 797 373
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* SEITE 2 - PRODUKTBAUSTEINE */}
      <Page size="A4" style={tw("bg-white text-black px-12 py-12")}>
        <Text style={tw("text-3xl font-black mb-10")}>
          Angebotsbausteine
        </Text>

        {offer.offers.map((item, index) => {
          const offerBudget = numberToEUR(
            (item.tkp * item.reach) / 1000 +
            (item.upcharge
              ? ((item.upcharge * item.upchargeTKP) / 1000) * item.reach
              : 0)
          );

          // Attribute sammeln
          const attributes = [
            { label: "TKP", value: item.tkp ? numberToEUR(item.tkp) : null },
            { label: "Upcharge-Layers", value: item.upcharge && item.upcharge > 0 ? item.upcharge : null },
            { label: "TKP pro Upcharge", value: item.upcharge && item.upcharge > 0 ? numberToEUR(item.upchargeTKP) : null },
            { label: "Budget Basis", value: item.upcharge && item.upcharge > 0 ? numberToEUR((item.reach * item.tkp) / 1000) : null },
            { label: "Budget Upcharge", value: item.upcharge && item.upcharge > 0 ? numberToEUR((item.upchargeTKP / 1000) * item.reach) : null },
            { label: "Frequency Cap", value: item.frequencyCap },
            { label: "Rotation", value: item.rotation },
            { label: "Alterstargeting", value: item.age },
            { label: "Geschlechtertargeting", value: item.gender },
            { label: "Platzierung", value: item.placement },
            { label: "Ausspielung", value: item.platform },
            { label: "Geographie", value: item.plz },
          ].filter((attr) => attr.value);

          return (
            <View key={index} style={tw("mb-10")} wrap={false}>
              {/* Fließender Header mit schwarzem Akzent */}
              <View style={tw("relative mb-6")}>
                <View style={tw("flex flex-row items-center gap-4")}>
                  {/* Schwarzer Kreis mit Nummer */}
                  <View style={tw("w-10 h-10 bg-black rounded-full flex items-center justify-center")}>
                    <Text style={tw("text-white font-bold text-sm")}>{index + 1}</Text>
                  </View>
                  
                  {/* Produkt Info */}
                  <View style={tw("flex-1")}>
                    <Text style={tw("text-xl font-bold")}>
                      {item.product}
                    </Text>
                    <Text style={tw("text-[9px] text-gray-500 mt-0.5")}>
                      {moment(item.start).format("DD.MM.YYYY")} – {moment(item.end).format("DD.MM.YYYY")}
                    </Text>
                  </View>

                  {/* Budget rechts */}
                  <View style={tw("text-right")}>
                    <Text style={tw("text-2xl font-black")}>{offerBudget}</Text>
                    <Text style={tw("text-[8px] text-gray-500")}>
                      {new Intl.NumberFormat("de-DE").format(item.reach)} Impressions
                    </Text>
                  </View>
                </View>
              </View>

              {/* Attribute als fließende Liste */}
              <View style={tw("pl-14")}>
                {attributes.map((attr, attrIndex) => (
                  <View key={attrIndex} style={tw("flex flex-row py-1.5 border-b border-gray-100")}>
                    <Text style={tw("text-[10px] text-gray-600 w-40")}>{attr.label}</Text>
                    <Text style={tw("text-[10px] font-semibold flex-1")}>{attr.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Footer auf Seite 2 */}
        <View style={tw("mt-auto pt-8 border-t border-gray-200")}>
          <Text style={tw("text-[7px] text-center text-gray-400 leading-relaxed")}>
            Alle in diesem Angebot enthaltenen Angaben sind vertraulich. Die Parteien verpflichten sich die im Rahmen dieses Angebots 
            ausgetauschten Informationen, sowie alle im Falle der Durchführung eines Auftrages bekanntwerdenden Informationen und Daten 
            vertraulich zu behandeln und Dritten nicht zugänglich zu machen.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Inter"],
    },
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        gray: {
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
    },
  },
});