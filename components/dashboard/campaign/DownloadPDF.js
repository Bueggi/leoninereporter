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

const DownloadPDFButton = ({ campaignName, offer }) => {
  Font.register({
    family: "Lato",
    fonts: [
      { src: "/Lato-Regular.ttf", format: "truetype" },
      { src: "/Lato-Bold.ttf", format: "truetype", fontWeight: 600 },
    ],
  });

  return (
    <PDFDownloadLink
      document={<MyDoc campaignName={campaignName} offer={offer} />}
      fileName="somename.pdf"
      style={tw(
        "inline-flex items-center gap-x-1.5 rounded-md bg-indigo-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      )}
    >
      {({ blob, url, loading, error }) =>
        loading ? "Loading document..." : "Download"
      }
    </PDFDownloadLink>
  );
};

export default DownloadPDFButton;

export const MyDoc = ({ campaignName, offer }) => {
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
    ).format("L") +
    " - " +
    moment(
      offer.offers.reduce((accumulator, currentValue) => {
        if (accumulator === 0) return currentValue.end;
        return accumulator > currentValue.end ? accumulator : currentValue.end;
      }, 0)
    ).format("L");

  const totalBudget = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce(
      (accumulator, currentValue) =>
        accumulator + (currentValue.reach * currentValue.tkp) / 1000,
      0
    )
  );

  const rotation = offer.offers.reduce((acc, el) => {
    if (acc.indexOf(el) !== -1) return acc;
    return [...acc, el.rotation];
  }, []);

  const targeting = offer.offers.reduce((acc, el) => {
    if (acc.indexOf(el) !== -1) return acc;
    return [...acc, el.output];
  }, []);

  const bumperTKP = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce((accumulator, currentValue) => {
      if (currentValue.product !== "BUMPER") return accumulator;
      if (accumulator === 0) return currentValue.tkp;
      return (accumulator + currentValue.tkp) / 2;
    }, 0)
  );

  const bumperReach = offer.offers.reduce((accumulator, currentValue) => {
    if (currentValue.product !== "BUMPER") return accumulator;

    return accumulator + currentValue.reach;
  }, 0);

  const bumperBudget = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce((accumulator, currentValue) => {
      if (currentValue.product !== "BUMPER") return accumulator;
      return accumulator + currentValue.reach * (currentValue.tkp / 1000);
    }, 0)
  );

  const totalTKP = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.reach * (currentValue.tkp / 1000);
    }, 0)
  );

  const nonskipTKP = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce((accumulator, currentValue) => {
      if (currentValue.product !== "NONSKIPPABLE") return accumulator;
      if (accumulator === 0) return currentValue.tkp;
      return (accumulator + currentValue.tkp) / 2;
    }, 0)
  );

  const nonskipReach = offer.offers.reduce((accumulator, currentValue) => {
    if (currentValue.product !== "NONSKIPPABLE") return accumulator;

    return accumulator + currentValue.reach;
  }, 0);

  const nonskipBudget = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce((accumulator, currentValue) => {
      if (currentValue.product !== "NONSKIPPABLE") return accumulator;
      return accumulator + currentValue.reach * (currentValue.tkp / 1000);
    }, 0)
  );

  const skippableTKP = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce((accumulator, currentValue) => {
      if (currentValue.product !== "SKIPPABLE") return accumulator;
      if (accumulator === 0) return currentValue.tkp;
      return (accumulator + currentValue.tkp) / 2;
    }, 0)
  );

  const skippableReach = offer.offers.reduce((accumulator, currentValue) => {
    if (currentValue.product !== "SKIPPABLE") return accumulator;

    return accumulator + currentValue.reach;
  }, 0);

  const skippableBudget = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(
    offer.offers.reduce((accumulator, currentValue) => {
      if (currentValue.product !== "SKIPPABLE") return accumulator;
      return accumulator + currentValue.reach * (currentValue.tkp / 1000);
    }, 0)
  );

  const totalReach = offer.offers.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.reach;
  }, 0);

  return (
    <Document>
      <Page
        size="A4"
        style={tw("p-4  px-12 flex flex-row flex-wrap gap-4 w-full")}
        orientation="landscape"
      >
        <View style={tw("flex flex-col")}>
          <Text
            className="text-blue-200"
            style={tw("mt-2 flex items-center text-sm text-gray-500")}
          >
            Angebotsnummer: {offer.offernumber}
          </Text>
          <Text
            className="text-blue-200"
            style={tw("flex text-sm items-center text-gray-500 mb-2")}
          >
            Datum des Angebots: {today}
          </Text>
          <View style={tw("min-w-full flex flex-row justify-between")}>
            <Text
              style={tw(
                "text-3xl flex flex-col font-bold leading-tight text-gray-900 sm:truncate sm:tracking-tight mb-12"
              )}
            >
              Angebot für Kampagne {campaignName}
            </Text>
            <Image src="/HoTLogo.png" style={tw("max-w-[8rem]")} />
          </View>
          <View style={tw("flex flex-row gap-8 ")}>
            <Text style={tw("flex align-middle text-sm text-gray-500")}>
              Product: Home of Talents // Relevant Commitment
            </Text>
            <Text style={tw("flex align-middle text-sm text-gray-500")}>
              Zeitraum: {zeitraum}
            </Text>
            <Text style={tw("flex align-middle text-sm text-gray-500")}>
              Budget: {totalBudget}
            </Text>
            <Text style={tw("flex align-middle text-sm text-gray-500")}>
              Rotation: {rotation}
            </Text>
            <Text style={tw("flex align-middle text-sm text-gray-500")}>
              Targeting: {targeting}
            </Text>
          </View>
          <View style={tw("min-w-full mt-20")}>
            <Text
              style={tw(
                "text-xl flex flex-col font-bold leading-tight text-gray-900 sm:truncate sm:tracking-tight mb-4"
              )}
            >
              Angebotsübersicht{" "}
            </Text>

            <View
              style={tw("flex flex-row bg-indigo-200 min-w-full text-sm mb-2")}
            >
              <View style={tw("flex-1 py-2 px-4")}>
                <Text style={tw("")}> Home of Talents Media</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 justify-items-end")}>
                <Text>TKP(net)</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 justify-items-end")}>
                <Text> AIs</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 justify-items-end")}>
                <Text>Budget (net)</Text>
              </View>
            </View>

            <View style={tw("flex flex-row min-w-full justify-between")}>
              <View style={tw("flex flex-col flex-1 px-4")}>
                <Text style={tw("text-sm font-bold")}>Non Skip Short Ad</Text>
                <Text style={tw("text-sm font-bold")}>Skippable Ad</Text>
                <Text style={tw("text-sm font-bold")}>Bumper</Text>
              </View>
              <View style={tw("flex flex-col flex-1 px-4")}>
                <Text style={tw("text-sm font-bold")}>{nonskipTKP}</Text>
                <Text style={tw("text-sm font-bold")}>{skippableTKP}</Text>
                <Text style={tw("text-sm font-bold")}>{bumperTKP}</Text>
              </View>
              <View style={tw("flex flex-col flex-1 px-4")}>
                <Text style={tw("text-sm font-bold")}>{nonskipReach}</Text>
                <Text style={tw("text-sm font-bold")}>{skippableReach}</Text>
                <Text style={tw("text-sm font-bold")}>{bumperReach}</Text>
              </View>
              <View style={tw("flex flex-col flex-1 px-4")}>
                <Text style={tw("text-sm font-bold")}>{nonskipBudget}</Text>
                <Text style={tw("text-sm font-bold")}>{skippableBudget}</Text>
                <Text style={tw("text-sm font-bold  min-w-full")}>
                  {bumperBudget}
                </Text>
              </View>
            </View>

            <View
              style={tw(
                "flex flex-row bg-indigo-700 min-w-full text-sm text-white mt-2"
              )}
            >
              <View style={tw("flex-1 py-2 px-4")}>
                <Text style={tw("")}> Total</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4")}>
                <Text> </Text>
              </View>
              <View style={tw("flex-1 py-2 px-4")}>
                <Text> {totalReach}</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4")}>
                <Text> {totalBudget}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={tw("flex flex-col gap-4 mt-36")}>
          <Text style={tw("text-center text-xs text-gray-400")}>
            Das vereinbarte Buchungsvolumen kann innerhalb des
            Leistungszeitraums frei im Rahmen der vereinbarten Rotation verteilt
            werden - Turnusmäßige Leistungsnachweise erfolgen in Form von
            PDF-Reports und Excel-Reports jeweils montags nach Kampagnenstart.
          </Text>
          <Text style={tw("text-center text-xs text-gray-400")}>
            Dieses Angebot wird gemacht durch „Home Of Talents“, eine Marke der
            Leonine Licensing GmbH. Unternehmenssitz: Taunusstr. 21, 80807
            München Geschäftsführung: Fred Kogel, Dr. Lisa Giehl, Stephan
            Katzmann, Bernhard zu Castell
          </Text>
          <Text style={tw("text-center text-xs text-gray-400")}>
            Kontakt: +49 89 999 513 – 0 Fax: +49 89 999 513 – 190 Email
            info@leoninestudios.com Registereintrag: Gesellschaft mit
            beschränkter Haftung registriert im Handelsregister beim Amtsgericht
            München unter der Registernummer HRB 272 911 USt-ID DE 323 797 373 -
            Wir freuen uns über baldige Rückmeldung, unser Angebot gilt bis zum
            {gueltigkeitsDatum}
          </Text>
          <Text style={tw("text-center text-xs text-gray-400")}>
            Alle in diesem Angebot enthaltenen Angaben sind vertraulich. Die
            Parteien verpflichten sich die im Rahmen dieses Angebots
            ausgetauschten Informationen, sowie alle im Falle der Durchführung
            eines Auftrages bekannt werdenden Informationen und Daten
            vertraulich zu behandeln und Dritten nicht zugänglich zu machen.
            Verbundene Unternehmen iSd § 15 AktG gelten nicht als Dritte.
            Leonine ist zur Weitergabe vertraulicher Informationen insoweit
            berechtigt, als es zur Durchführung des Auftrags notwendig ist.
            Änderungen und Ergänzungen dieser Bedingungen bedürfen zu ihrer
            Rechtswirksamkeit der Schriftform. Das gleiche gilt für eine
            Abbedingung dieser Schriftformbestimmung. Erfüllungsort und
            ausschließlicher Gerichtsstand ist soweit zulässig München
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Lato"],
    },
    extend: {
      colors: {
        custom: "cornflowerblue",
      },
    },
  },
});
