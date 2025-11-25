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
import ProductInformationRow from "../../pComponents/pdfgeneration/ProductInformationRow";

// import tw main
import { tw } from "@lib/tw";

// import helperfunctions
// TODO hier sind noch Components drin, die definitiv eine eigene Datei wert sind
import {
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
} from "@lib/dashboard/pdfGeneration/helperFunctions";

const DownloadPDFButton = ({
  campaignName,
  offer,
  advertiser,
  contact,
  contactEmail,
  user,
  userEmail,
  anrede,
}) => {
  Font.register({
    family: "Inter",
    fonts: [
      { src: "/Inter_18pt-Regular.ttf", format: "truetype" },
      { src: "/Inter_18pt-Light.ttf", format: "truetype", fontWeight: 300 },
      {
        src: "/Inter_18pt-Medium.ttf",
        format: "truetype",
        fontWeight: "normal",
      },
      { src: "/Inter_18pt-SemiBold.ttf", format: "truetype", fontWeight: 600 },
      { src: "/Inter_18pt-Bold.ttf", format: "truetype", fontWeight: "bold" },
      { src: "/Inter_18pt-Black.ttf", format: "truetype", fontWeight: "black" },
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
            anrede={anrede}
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
  offer,
  contact,
  contactEmail,
  user,
  userEmail,
  anrede,
}) => {
  // wenn die Offergroup noch keine Angebote angelegt hat, wird ein leeres Dokument zurückgegeben
  if (offer.offers.length < 1)
    return abortGenerationIfPointless(Document, Page, View, Text);

  const upchargeMetrics = calculateUpchargeInformation(offer);
  const today = moment().format("DD.MM.YYYY");
  const gueltigkeitsDatum = moment().add(14, "days").format("DD.MM.YYYY");
  const zeitraum = calculateRuntime(offer);

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
  const productMetrics = calculateProductMetrics(offer);

  return (
    <Document>
      {/* SEITE 1 - KERNINFOS */}
      <Page size="A4" style={tw("bg-white text-black")}>
        {/* Logo und Meta Info in einer Linie */}
        <View
          style={tw(
            "flex flex-row justify-between items-start bg-[#AB8353] pt-12 px-12 pb-8 mb-6"
          )}
        >
          <Image
            src={"/HoT_Background.png"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "115%",
              height: "225%",
              zIndex: -1,
            }}
          ></Image>
          <View>
            <FliessText>
              <Text style={tw("text-white")}>LEONINE Licensing GmbH</Text>
            </FliessText>
            <FliessText>
              <Text style={tw("text-white")}>
                Taunusstr. 21 · 80807 München
              </Text>
            </FliessText>
          </View>
          <Image src="/HoTLogo.png" style={tw("w-24 h-auto opacity-90")} />
        </View>
        <View style={tw("px-12")}>
          {/* HERO SECTION - Fließend ohne harte Boxen */}

          <View style={tw("relative mb-8")}>
            {/* Kampagnenname als großer Eyecatcher */}
            <Ueberschrift>
              <Text>Angebot Nr. {offer.offernumber}</Text>
            </Ueberschrift>

            {/* Angebotsnummer direkt darunter, subtil */}
            <Zeitraum>
              <Text style={tw("mt-2")}>
                Angebotsdatum: {today} - Gültig bis: {gueltigkeitsDatum}
              </Text>
            </Zeitraum>
          </View>

          {/* ANREDE */}
          <FliessText>
            <Text style={tw("mb-4")}>
              {/* Wenn ein Kontaktname angegeben wurde, dann soll er hier erscheinen, ansonsten eine generische Anrede */}
              {contact
                ? anrede
                  ? anrede + " " + contact
                  : "Hallo " + contact
                : "Sehr geehrte Damen und Herren"}
              ,{"\n"}
              wir freuen uns, folgendes Angebot zu unterbreiten:
            </Text>
          </FliessText>

          {/* ANGEBOTSÜBERSICHT - Fließende Tabelle */}

          {/* MINI META TABLE - 2 Spalten Minimalistisch & Kompakt */}
          <View style={tw("mb-8")}>
            <View style={tw("rounded-lg overflow-hidden")}>
              <View style={tw("flex flex-row bg-stone-300 p-3")}>
                {/* Linke Spalte */}
                <View style={tw("flex-1 border-r border-stone-400 mr-2 ")}>
                  {/* Row 1 */}
                  <View style={tw("flex flex-row  items-center")}>
                    <InfoSchrift>
                      <Text>Zeitraum</Text>
                    </InfoSchrift>
                    <TableRightSide>
                      <Text>{zeitraum}</Text>
                    </TableRightSide>
                  </View>

                  {/* Row 2 */}
                  {["product", "frequencyCap", "rotation", "age"].map(
                    (el, i) => {
                      const title = {
                        product: "Product",
                        frequencyCap: "Frequency Cap",
                        rotation: "Rotation",
                        age: "Age-Targeting",
                      };
                      if (
                        reduceInformationFromOffersToString(offer, el).length &&
                        reduceInformationFromOffersToString(offer, el) !== null
                      ) {
                        return (
                          <View style={tw("flex flex-row  items-center")}>
                            <InfoSchrift>
                              <Text>{title[el]}</Text>
                            </InfoSchrift>
                            <TableRightSide>
                              {/* <Text>{offer.offers[0] && offer.offers[0].product}</Text> */}
                              <Text>
                                {reduceInformationFromOffersToString(offer, el)}
                              </Text>
                            </TableRightSide>
                          </View>
                        );
                      }
                    }
                  )}

                  {/* Row 5 */}
                </View>

                {/* Rechte Spalte */}
                <View style={tw("flex-1")}>
                  {/* Row 3 */}
                  <View style={tw("flex flex-row  items-center")}>
                    <InfoSchrift>
                      <Text>Impressions</Text>
                    </InfoSchrift>
                    <TableRightSide>
                      <Text>
                        {new Intl.NumberFormat("de-DE").format(totalReach)}
                      </Text>
                    </TableRightSide>
                  </View>

                  {/* Row 4 */}
                  <View style={tw("flex flex-row  items-center")}>
                    <InfoSchrift>
                      <Text>Budget</Text>
                    </InfoSchrift>
                    <TableRightSide>
                      <Text>{totalBudget}</Text>
                    </TableRightSide>
                  </View>

                  {["platform", "plz", "placement"].map((el, i) => {
                    const title = {
                      platform: "Platform",
                      plz: "Geographie",
                      placement: "Placement",
                    };

                    const reducedResult = reduceInformationFromOffersToString(
                      offer,
                      el
                    );
                    if (reducedResult.length && !!reducedResult) {
                      return (
                        <View style={tw("flex flex-row  items-center")}>
                          <InfoSchrift>
                            <Text>{title[el]}</Text>
                          </InfoSchrift>
                          <TableRightSide>
                            {/* <Text>{offer.offers[0] && offer.offers[0].product}</Text> */}
                            <Text>{reducedResult}</Text>
                          </TableRightSide>
                        </View>
                      );
                    }
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* PRODUKTÜBERSICHT - Fließende Tabelle */}
          <View style={tw("mb-10")}>
            {/* Header mit durchgehender Linie */}
            <InfoSchrift>
              <View
                style={tw(
                  "flex flex-row items-baseline border-b-2 border-black pb-2 mb-4"
                )}
              >
                <Text
                  style={tw(
                    "flex-1 text-[8px] font-black uppercase tracking-wider"
                  )}
                >
                  Home of Talents Media
                </Text>
                <Text
                  style={tw(
                    "w-20 text-right text-[8px] uppercase tracking-wider"
                  )}
                >
                  TKP (net)
                </Text>
                <Text
                  style={tw(
                    "w-24 text-right text-[8px] uppercase tracking-wider"
                  )}
                >
                  Impressions
                </Text>
                <Text
                  style={tw(
                    "w-24 text-right text-[8px] uppercase tracking-wider"
                  )}
                >
                  Budget (net)
                </Text>
              </View>
            </InfoSchrift>

            {/* Products mit fließenden Linien */}

            <ProductInformationRow
              productMetrics={productMetrics}
              product={"NONSKIPPABLE"}
            />
            <ProductInformationRow
              productMetrics={productMetrics}
              product={"SKIPPABLE"}
            />
            <ProductInformationRow
              productMetrics={productMetrics}
              product={"BUMPER"}
            />

            {productMetrics.CTV.reach > 0 && (
              <ProductInformationRow
                productMetrics={productMetrics}
                product={"CTV"}
              />
            )}
            {productMetrics.SOV.reach > 0 && (
              <ProductInformationRow
                productMetrics={productMetrics}
                product={"SOV"}
              />
            )}

            {/* Upcharges inline wenn vorhanden */}
            {upchargeMetrics.isUpcharge && upchargeMetrics.totalCosts > 0 && (
              <>
                <View style={tw("border-t border-stone-300 mt-2 mb-2")}></View>
                {/* AGEUPCHARGE */}
                {upchargeMetrics.ageUpcharge.cost > 0 && (
                  <ProductInformationRow
                    productMetrics={upchargeMetrics.ageUpcharge}
                    product={"+ Upcharge Age"}
                  />
                )}
                {/* GENDERUPCHARGE */}
                {upchargeMetrics.genderUpcharge.cost > 0 && (
                  <ProductInformationRow
                    productMetrics={upchargeMetrics.genderUpcharge}
                    product={"+ Upcharge Gender"}
                  />
                )}

                {upchargeMetrics.platformUpcharge.cost > 0 && (
                  <ProductInformationRow
                    productMetrics={upchargeMetrics.platformUpcharge}
                    product={"+ Upcharge Platform"}
                  />
                )}

                {upchargeMetrics.placementUpcharge.cost > 0 && (
                  <ProductInformationRow
                    productMetrics={upchargeMetrics.placementUpcharge}
                    product={"+ Upcharge Placement"}
                  />
                )}
              </>
            )}

            {/* Total als fließender Abschluss */}
            <InfoSchrift>
              <View
                style={tw("flex flex-row pt-4 mt-2 border-t-2 border-black")}
              >
                <Text style={tw("flex-1 uppercase")}>Total</Text>
                <Text style={tw("w-24 text-right")}>
                  {new Intl.NumberFormat("de-DE").format(totalReach)}
                </Text>
                <Text style={tw("w-24 text-right")}>{totalBudget}</Text>
              </View>
            </InfoSchrift>
          </View>

          {/* HINWEISE */}
          <View style={tw("mt-auto")}>
            <FliessText>
              <Text>
                Das vereinbarte Buchungsvolumen kann innerhalb des
                Leistungszeitraums frei im Rahmen der vereinbarten Rotation
                verteilt werden. Turnusmäßige Leistungsnachweise erfolgen in
                Form von PDF- und Excel-Reports, jeweils montags nach
                Kampagnenstart.
              </Text>
              <Text>
                Bei den genannten Beträgen handelt es sich um Nettobeträge, die
                jeweils zzgl. der jeweils gültigen MwSt. gelten.
              </Text>
              <Text style={tw("mt-3")}>
                Wir freuen uns über baldige Rückmeldung.
              </Text>
            </FliessText>

            {/* Ersteller Info */}
            <View
              style={tw(
                "flex flex-row justify-between items-end mt-8 pt-4 border-t border-gray-200"
              )}
            >
              {contact.length && contactEmail.length && (
                <View>
                  <InfoSchrift>
                    <Text style={tw("mb-1")}>Angebot erstellt für</Text>
                  </InfoSchrift>
                  <FliessText>
                    <Text>
                      {contact} · {contactEmail}
                    </Text>
                  </FliessText>
                </View>
              )}
            </View>

            <View
              style={tw("flex flex-row justify-between items-end mt-4")}
            ></View>
            <View>
              <InfoSchrift>
                <Text style={tw("mb-1")}>Angebot erstellt von</Text>
              </InfoSchrift>
              <FliessText>
                <Text style={tw("mb-3")}>
                  {user} · {userEmail}
                </Text>
              </FliessText>
            </View>
            {/* <Text style={tw("text-[6px] text-gray-400")}>
              LEONINE Licensing GmbH · HRB 272 911 · USt-IdNr. DE 323 797 373
            </Text> */}
          </View>
        </View>
      </Page>
    </Document>
  );
};
