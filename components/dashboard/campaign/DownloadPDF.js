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
import ReactDOM from "react-dom";
import { PDFViewer } from "@react-pdf/renderer";

const DownloadPDFButton = ({ campaignName, offer, advertiser }) => {
  Font.register({
    family: "Lato",
    fonts: [
      { src: "/Lato-Regular.ttf", format: "truetype" },
      { src: "/Lato-Bold.ttf", format: "truetype", fontWeight: 600 },
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
          />
        }
        fileName={`${campaignName}.pdf`}
        style={tw(
          "inline-flex items-center gap-x-1.5 rounded-md bg-indigo-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        )}
      >
        {({ blob, url, loading, error }) =>
          loading ? "Loading document..." : "Download"
        }
      </PDFDownloadLink>
      {/* <PDFViewer width={2000} height={2000}>
        <MyDoc
          campaignName={campaignName}
          offer={offer}
          advertiser={advertiser}
        />
      </PDFViewer> */}
    </>
  );
};

export default DownloadPDFButton;

export const MyDoc = ({ campaignName, offer, advertiser }) => {
  const { placement, product, platform, frequencyCap, output, plz, age } =
    offer;
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

  const plzAcc = offer.offers.reduce((acc, el) => {
    if (acc.indexOf(el) !== -1) return acc;
    return [...acc, el.plz];
  }, []);

  const rotation = offer.offers.reduce((acc, el) => {
    if (acc.indexOf(el) !== -1) return acc;
    return [...acc, el.rotation];
  }, []);

  const targeting = offer.offers.reduce((acc, el) => {
    if (acc.indexOf(el) !== -1) return acc;
    return [...acc, el.targeting];
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
        orientation="portrait"
      >
        <View style={tw("w-full flex flex-row justify-end")}>
          <Image src="/HoTLogo.png" style={tw("max-w-[8rem]")} />
        </View>

        <View style={tw("block flex flex-col mb-4")}>
          <Text style={tw("text-[7px] text-slate-600 block")}>
            LEONINE Licensing GmbH · Taunusstr. 21 · 80807 München
          </Text>
          <Text style={tw("text-sm text-slate-600 mt-4")}>
            {advertiser.name && advertiser.name}
          </Text>
          <Text style={tw("text-sm text-slate-600")}>
            {advertiser.address && advertiser.address}
          </Text>
          <Text style={tw("text-sm text-slate-600")}>
            {advertiser.plz &&
              advertiser.city &&
              advertiser.plz + " " + advertiser.city}
          </Text>
          <Text style={tw("text-sm text-slate-600")}>
            {advertiser.country && advertiser.country}
          </Text>
        </View>

        <View style={tw("min-w-full flex flex-row justify-between")}>
          <Text
            style={tw(
              "text-2xl flex flex-col font-bold leading-tight text-gray-900 sm:truncate sm:tracking-tight"
            )}
          >
            Angebot für Kampagne {campaignName}
          </Text>
        </View>
        <View style={tw("flex flex-col")}>
          <Text
            className="text-blue-200"
            style={tw("flex items-center text-sm text-gray-500")}
          >
            Angebotsnummer: {offer.offernumber}
          </Text>
          <Text
            className="text-blue-200"
            style={tw("flex gap-4 text-sm items-center text-gray-500 mb-2")}
          >
            Datum des Angebots: {today} &nbsp; - &nbsp; Gültig bis:{" "}
            {gueltigkeitsDatum}
          </Text>
          <View style={tw("mt-12 text-sm")}>
            <Text>Sehr geehrte Damen und Herren,</Text>
            <Text>
              wir freuen uns, Ihnen nachfolgendes Angebot zu unterbreiten:
            </Text>
          </View>
          <View style={tw("flex flex-col gap-2 mt-8")}>
            <Text
              style={tw(
                "text-xl flex flex-col font-bold leading-tight text-gray-900 sm:truncate sm:tracking-tight mb-1"
              )}
            >
              Angebotsübersicht{" "}
            </Text>
            <View style={tw("flex flex-col gap-6")}>
              <View style={tw("flex flex-col min-w-full")}>
                {product && (
                  <Text style={tw("flex align-middle text-sm text-gray-500")}>
                    Product: {product}
                  </Text>
                )}
                <Text style={tw("flex align-middle text-sm text-gray-500")}>
                  Zeitraum: {zeitraum}
                </Text>
                <Text style={tw("flex align-middle text-sm text-gray-500")}>
                  Budget: {totalBudget}
                </Text>
                <Text style={tw("flex align-middle text-sm text-gray-500")}>
                  Reichweite: {totalReach}
                </Text>
              </View>
            </View>
          </View>
          <View style={tw("min-w-full mt-8")}>
            <View
              style={tw("flex flex-row bg-indigo-200 min-w-full text-sm mb-2")}
            >
              <View style={tw("flex-1 py-2 px-4")}>
                <Text style={tw("")}> Home of Talents Media</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 justify-end")}>
                <Text>TKP(net)</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 justify-end")}>
                <Text> AIs</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 justify-end")}>
                <Text>Budget (net) Hallo</Text>
              </View>
            </View>

            <View style={tw("flex flex-row min-w-full justify-end")}>
              <View style={tw("flex flex-col flex-1 px-4")}>
                <Text style={tw("text-sm font-bold")}>Non Skip Short Ad</Text>
                <Text style={tw("text-sm font-bold")}>Skippable Ad</Text>
                <Text style={tw("text-sm font-bold")}>Bumper</Text>
              </View>
              <View style={tw("flex flex-col flex-1 px-4")}>
                <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                  {nonskipTKP}
                </Text>
                <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                  {skippableTKP}
                </Text>
                <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                  {bumperTKP}
                </Text>
              </View>
              <View
                style={tw("flex flex-col flex-1 px-4 justify-self-end ml-auto")}
              >
                <Text style={tw("text-sm font-bold flex ml-auto mr-12")}>
                  {new Intl.NumberFormat("de-DE").format(nonskipReach)}
                </Text>
                <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                  {new Intl.NumberFormat("de-DE").format(skippableReach)}
                </Text>
                <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                  {new Intl.NumberFormat("de-DE").format(bumperReach)}
                </Text>
              </View>
              <View style={tw("flex flex-col flex-1 px-4 justify-end")}>
                <Text style={tw("text-sm font-bold ml-auto mr-8")}>
                  {nonskipBudget}
                </Text>
                <Text style={tw("text-sm font-bold ml-auto mr-8")}>
                  {skippableBudget}
                </Text>
                <Text style={tw("text-sm font-bold ml-auto mr-8")}>
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
              <View style={tw("flex-1 py-2 px-4 ml-auto")}>
                <Text style={tw("ml-auto mr-12")}>
                  {" "}
                  {new Intl.NumberFormat("de-DE").format(totalReach)}
                </Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 ml-auto")}>
                <Text style={tw("ml-auto mr-8")}> {totalBudget}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={tw("mt-8")}>
          <Text style={tw("text-sm")}>
            Das vereinbarte Buchungsvolumen kann innerhalb des
            Leistungszeitraums frei im Rahmen der vereinbarten Rotation verteilt
            werden. Turnunsmäßige Leistungsnachweise erfolgen in Form von PDF-
            und Excel-Reports, jeweils montags nach Kampagnenstart.
          </Text>
          <Text style={tw("text-sm mt-3")}>
            Bei den genannten Beträgen handelt es sich um Nettobeträge, die
            jeweils zzgl. der jeweils gültigen MwSt. gelten. Rechnungen im
            Zusammenhang mit unserem Angebot sind innerhalb von 14 Tagen ab
            Rechnungszugang fällig.
          </Text>
          <Text style={tw("text-sm mt-3")}>
            Wir freuen uns über baldige Rückmeldung.
          </Text>
        </View>

        <View style={tw("flex flex-col gap-4 mt-16")}>
          <Text style={tw("text-center text-[6px] text-gray-400")}>
            Alle in diesem Angebot enthaltenen Angaben sind vertraulich. Die
            Parteien verpflichten sich die im Rahmen dieses Angebots
            ausgetauschten Informationen, sowie alle im Falle der Durchführung
            eines Auftrages bekanntwerdenden Informationen und Daten vertraulich
            zu behandeln und Dritten nicht zugänglich zu machen. Verbundene
            Unternehmen iSd § 15 AktG gelten nicht als Dritte. Leonine ist zur
            Weitergabe vertraulicher Informationen insoweit berechtigt, als es
            zur Durchführung des Auftrags notwendig ist. Änderungen und
            Ergänzungen dieser Bedingungen bedürfen zu ihrer Rechtswirksamkeit
            der Schriftform. Das gleiche gilt für eine Abbedingung dieser
            Schriftformbestimmung. Erfüllungsort und ausschließlicher
            Gerichtsstand ist soweit zulässig München.
          </Text>

          <Text style={tw("text-center text-[6px] text-gray-400")}>
            LEONINE Licensing GmbH · Taunusstr. 21 · 80807 München · Tel: +49 89
            999 513 0 · Fax: +49 89 999 513 190 · Email info@leoninestudios.com
            · Geschäftsführer: Fred Kogel, Dr. Lisa Giehl, Stephan Kathmann,
            Bernhard zu Castell · Sitz der Gesellschaft: München ·
            Registereintrag: Gesellschaft mit beschränkter Haftung registriert
            im Handelsregister beim Amtsgericht München unter der Registernummer
            HRB 272 911 · UniCredit Bank-AG · IBAN DE83 7002 0002 7620 80 · BIC
            HYVEDEMMXXX · USt-IdNr. DE 323 797 373
          </Text>
        </View>
      </Page>
      <Page
        size="A4"
        style={tw("p-4  px-12 gap-4 w-full")}
        orientation="portrait"
      >
        <View style={tw("")}>
          <Text
            style={tw(
              "text-xl font-bold leading-tight text-gray-900 sm:truncate sm:tracking-tight mb-1 mt-12"
            )}
          >
            Angebotsbausteine{" "}
          </Text>
        </View>
        <View>
          {offer.offers.map((item, index) => {
            return (
              <View key={index}>
                <Text style={tw("flex flex-col text-sm text-indigo-500")} t>
                  Produktbaustein {index + 1}
                </Text>
                <View style={tw("flex flex-row gap-12 text-xs")}>
                  <View>
                    <Text>
                      Startdatum: {moment(item.start).format("DD.MM.YYYY")}
                    </Text>
                    <Text>
                      Enddatum: {moment(item.end).format("DD.MM.YYYY")}
                    </Text>
                    <Text>Produkt: {item.product}</Text>
                    <Text>Impressionen: {item.reach}</Text>
                    <Text>TKP: {item.tkp}</Text>
                    <Text>Budget: {item.budget}</Text>
                    <Text>Frequency Cap: {item.frequencyCap}</Text>
                  </View>
                  <View>
                    <Text>Rotation: {item.Rotation}</Text>
                    <Text>Alterstargeting: {item.age}</Text>
                    <Text>Geschlechtertargeting: {item.gender}</Text>
                    <Text>Platzierung: {item.placement}</Text>
                    <Text>Ausspielung: {item.platform}</Text>
                    <Text>Postleitzahlen: {item.plz}</Text>
                  </View>
                </View>
              </View>
              // age
              // :
              // "18-35"
              // createdAt
              // :
              // "2024-11-14T10:22:09.875Z"
              // end
              // :
              // "2024-11-23T23:00:00.000Z"
              // frequencyCap
              // :
              // "3 pro Woche"
              // id
              // :
              // "b1ff33c2-5f5e-419c-bdf2-19e6d697e5e0"
              // offerGroupID
              // :
              // "c21c4a5e-8885-40e6-b754-1b402b30cc3d"
              // output
              // :
              // null
              // placement
              // :
              // null
              // platform
              // :
              // "CCTV"
              // plz
              // :
              // ""
              // product
              // :
              // "NONSKIPPABLE"
              // reach
              // :
              // 11111111
              // rotation
              // :
              // "Best of Entertainment"
              // start
              // :
              // "2024-11-14T23:00:00.000Z"
              // targeting
              // :
              // "M/F/D"
              // tkp
              // :
              // 11
              // updatedAt
              // :
              // "2024-11-14T10:45:52.170Z"
            );
          })}
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
