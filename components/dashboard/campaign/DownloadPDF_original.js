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
import TableRow from "./pdfgeneration/TableRow";
import calculateUpchargeInformation from "./pdfgeneration/calculateUpchargeInformation";

import {
  TableRows,
  InformationRow,
  TitleRow,
} from "./pdfgeneration/TableStylings";

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
            contact={contact}
            contactEmail={contactEmail}
            user={user}
            userEmail={userEmail}
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

  // Totale Kosten für die Upcharges kalkulieren
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
    ) + upchargeMetrics.totalCosts
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

  const groupAttributes = (attributes) => {
    const grouped = [];
    for (let i = 0; i < attributes.length; i += 2) {
      grouped.push(attributes.slice(i, i + 2));
    }
    return grouped;
  };

  return (
    <Document>
      <Page
        size="A4"
        style={tw("p-4  px-12 flex flex-row flex-wrap gap-4 w-full")}
        orientation="portrait"
      >
        <View style={tw("flex flex-row w-full")}>
          <View style={tw("block flex flex-col mb-4 flex-1 mt-4")}>
            <Text style={tw("text-[7px] text-slate-600 block")}>
              LEONINE Licensing GmbH · Taunusstr. 21 · 80807 München
            </Text>
            <Text style={tw("text-[7px] text-slate-600 block mt-2 font-bold")}>
              Angebot erstellt von:
            </Text>
            <Text style={tw("text-[7px] text-slate-600 block")}>
              {user && user}
            </Text>
            <Text style={tw("text-[7px] text-slate-600 block")}>
              {userEmail && userEmail}
            </Text>
            <Text style={tw("text-[7px] text-slate-600 block mt-2")}>
              Angebot für:
            </Text>
            <Text style={tw("text-[7px] text-slate-600 block")}>
              {contact && contact}
            </Text>
            <Text style={tw("text-[7px] text-slate-600 block")}>
              {contactEmail && contactEmail}
            </Text>
          </View>
          <View style={tw("flex flex-row justify-end flex-1")}>
            <Image src="/HoTLogo.png" style={tw("max-w-[8rem]")} />
          </View>
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
                  Reichweite:{" "}
                  {new Intl.NumberFormat("de-DE").format(totalReach)}
                </Text>
              </View>
            </View>
          </View>

          <View style={tw("flex flex-col min-w-full")}>
            <TitleRow
              label="Home of Talents Media"
              reach="Impressions"
              budget="Budget (net)"
              tkp="TKP (net)"
              color="#455a64"
              fontColor="white"
              font="Helvetica-Bold"
            ></TitleRow>
            <View style={{ marginTop: "12px" }}></View>
            <InformationRow
              label="Nonskippable"
              reach={new Intl.NumberFormat("de-DE").format(nonskipReach)}
              budget={nonskipBudget}
              tkp={nonskipTKP}
            />
            <InformationRow
              label="Skippable"
              reach={new Intl.NumberFormat("de-DE").format(skippableReach)}
              budget={skippableBudget}
              tkp={skippableTKP}
            ></InformationRow>
            <InformationRow
              label="Bumper Short Ad"
              reach={new Intl.NumberFormat("de-DE").format(bumperReach)}
              budget={bumperBudget}
              tkp={bumperTKP}
            ></InformationRow>
            <View style={{ marginTop: "8px" }}>
              <TitleRow
                label="Subtotal"
                reach={new Intl.NumberFormat("de-DE").format(totalReach)}
                budget={totalBudget}
                tkp=""
                color="#b0bec5"
                fontColor="black"
                font="Helvetica"
              ></TitleRow>
            </View>

            {!!upchargeMetrics.isUpcharge &&
              upchargeMetrics.ageUpcharge.cost > 0 && (
                <InformationRow
                  label="Upcharge Alterstargeting"
                  reach={new Intl.NumberFormat("de-DE").format(
                    upchargeMetrics.ageUpcharge.reach
                  )}
                  budget={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.ageUpcharge.cost)}
                  tkp={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.ageUpcharge.tkp)}
                ></InformationRow>
              )}
            {!!upchargeMetrics.isUpcharge &&
              upchargeMetrics.genderUpcharge.cost > 0 && (
                <InformationRow
                  label="Upcharge Geschlechtertargeting"
                  reach={new Intl.NumberFormat("de-DE").format(
                    upchargeMetrics.genderUpcharge.reach
                  )}
                  budget={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.genderUpcharge.cost)}
                  tkp={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.genderUpcharge.tkp)}
                ></InformationRow>
              )}
            {!!upchargeMetrics.isUpcharge &&
              upchargeMetrics.platformUpcharge.cost > 0 && (
                <InformationRow
                  label="Upcharge Platformausspielung"
                  reach={new Intl.NumberFormat("de-DE").format(
                    upchargeMetrics.placementUpcharge.reach
                  )}
                  budget={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.platformUpcharge.cost)}
                  tkp={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.platformUpcharge.tkp)}
                ></InformationRow>
              )}
            {!!upchargeMetrics.isUpcharge &&
              upchargeMetrics.placementUpcharge.cost > 0 && (
                <InformationRow
                  label="Upcharge Platformausspielung"
                  reach={new Intl.NumberFormat("de-DE").format(
                    upchargeMetrics.placementUpcharge.reach
                  )}
                  budget={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.placementUpcharge.cost)}
                  tkp={new Intl.NumberFormat("de-de", {
                    style: "currency",
                    currency: "EUR",
                  }).format(upchargeMetrics.placementUpcharge.tkp)}
                ></InformationRow>
              )}

            {/* <View style={{ marginTop: "8px" }}>
              <TitleRow
                label="Subtotal"
                reach={new Intl.NumberFormat("de-DE").format(totalReach)}
                budget={totalBudget}
                tkp=""
                color="#b0bec5"
                fontColor="black"
                font="Helvetica"
              ></TitleRow>
            </View>
          </View>

          <View style={tw("min-w-full mt-8")}>
            <View
              style={tw(
                "flex flex-row bg-gray-400 text-gray-900 min-w-full text-sm mb-2"
              )}
            >
              <View style={tw("flex-1 py-2 px-4")}>
                <Text style={tw("")}> Home of Talents Media</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4  ml-auto")}>
                <Text style={tw('text-sm font-bold flex ml-auto mr-12 pr-12"')}>
                  TKP(net)
                </Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 ml-auto")}>
                <Text style={tw('text-sm font-bold flex ml-auto mr-8 pr-12"')}>
                  {" "}
                  AIs
                </Text>
              </View>
              <View style={tw("flex-1 py-2 px-4  ml-auto")}>
                <Text style={tw("text-sm font-bold flex ml-auto pr-8")}>
                  Budget (net)
                </Text>
              </View>
            </View> */}

            {/* <TableRows
              label="Test"
              tkp="tkp"
              reach="reach"
              budget="budget"
            ></TableRows> */}

            {/* Hier kommen alle Infos zu den Produkten */}

            {/* <View style={tw("flex flex-row min-w-full justify-end")}>
              <View style={tw("flex flex-col flex-2 px-4")}>
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
            </View> */}

            {/* Subtotal
            <View
              style={tw(
                "flex flex-row bg-gray-700 min-w-full text-sm text-white mt-2"
              )}
            >
              <View style={tw("flex-1 py-2 px-4")}>
                <Text style={tw("")}>Subtotal</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4")}>
                <Text> </Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 ml-auto")}>
                <Text style={tw("ml-auto mr-8")}>
                  {" "}
                  {new Intl.NumberFormat("de-DE").format(totalReach)}
                </Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 ml-auto")}>
                <Text style={tw("ml-auto mr-8")}> {totalBudget}</Text>
              </View>
            </View> */}

            {/* Upcharge */}
            {upchargeMetrics.isUpcharge && upchargeMetrics.totalCosts !== 0 && (
              <View style={tw("flex flex-row min-w-full justify-end")}>
                <View style={tw("flex flex-col flex-2 px-4")}>
                  {/* Nur anzeigen, wenn upcharges gegeben sind */}
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.ageUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold")}>
                        Upcharge Alterstargeting
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge !== false &&
                    upchargeMetrics.genderUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold")}>
                        Upcharge Geschlechtertargeting
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge !== false &&
                    upchargeMetrics.platformUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold")}>
                        Upcharge Plattformtargeting
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge !== false &&
                    upchargeMetrics.placementUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold")}>
                        Upcharge Positionierung
                      </Text>
                    )}
                </View>
                <View style={tw("flex flex-col flex-1 px-4")}>
                  <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                    {!!upchargeMetrics.isUpcharge &&
                      upchargeMetrics.ageUpcharge.cost > 0 && (
                        <Text style={tw("text-sm font-bold")}>
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          }).format(upchargeMetrics.ageUpcharge.tkp)}
                        </Text>
                      )}
                  </Text>
                  <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                    {!!upchargeMetrics.isUpcharge &&
                      upchargeMetrics.genderUpcharge.cost > 0 && (
                        <Text style={tw("text-sm font-bold")}>
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          }).format(upchargeMetrics.genderUpcharge.tkp)}
                        </Text>
                      )}
                  </Text>
                  <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                    {!!upchargeMetrics.isUpcharge &&
                      upchargeMetrics.placementUpcharge.cost > 0 && (
                        <Text style={tw("text-sm font-bold")}>
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          }).format(upchargeMetrics.placementUpcharge.tkp)}
                        </Text>
                      )}
                  </Text>
                  <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                    {!!upchargeMetrics.isUpcharge &&
                      upchargeMetrics.platformUpcharge.cost > 0 && (
                        <Text style={tw("text-sm font-bold")}>
                          {new Intl.NumberFormat("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          }).format(upchargeMetrics.platformUpcharge.tkp)}
                        </Text>
                      )}
                  </Text>
                </View>

                <View
                  style={tw(
                    "flex flex-col flex-1 px-4 justify-self-end ml-auto"
                  )}
                >
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.ageUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                        {new Intl.NumberFormat("de-DE").format(
                          upchargeMetrics.ageUpcharge.reach
                        )}
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.genderUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                        {new Intl.NumberFormat("de-DE").format(
                          upchargeMetrics.genderUpcharge.reach
                        )}
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.platformUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                        {new Intl.NumberFormat("de-DE").format(
                          upchargeMetrics.platformUpcharge.reach
                        )}
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.placementUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold ml-auto mr-12")}>
                        {new Intl.NumberFormat("de-DE").format(
                          upchargeMetrics.placementUpcharge.reach
                        )}
                      </Text>
                    )}
                </View>

                <View style={tw("flex flex-col flex-1 px-4 justify-end")}>
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.ageUpcharge.cost > 0 && (
                      <TableRows
                        label="Test"
                        tkp="tkp"
                        reach="reach"
                        budget="budget"
                      ></TableRows>
                    )}
                  {/* (
                      <Text style={tw("text-sm font-bold ml-auto mr-8")}>
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(upchargeMetrics.ageUpcharge.cost)}
                      </Text>
                    )} */}
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.genderUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold ml-auto mr-8")}>
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(upchargeMetrics.genderUpcharge.cost)}
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.platformUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold ml-auto mr-8")}>
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(upchargeMetrics.platformUpcharge.cost)}
                      </Text>
                    )}
                  {!!upchargeMetrics.isUpcharge &&
                    upchargeMetrics.placementUpcharge.cost > 0 && (
                      <Text style={tw("text-sm font-bold ml-auto mr-8")}>
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(upchargeMetrics.placementUpcharge.cost)}
                      </Text>
                    )}
                </View>
              </View>
            )}

            {/* Total Values */}
            <View
              style={tw(
                "flex flex-row bg-gray-700 min-w-full text-sm text-white mt-2"
              )}
            >
              <View style={tw("flex-1 py-2 px-4")}>
                <Text style={tw("")}> Total</Text>
              </View>
              <View style={tw("flex-1 py-2 px-4")}>
                <Text> </Text>
              </View>
              <View style={tw("flex-1 py-2 px-4 ml-auto")}>
                <Text style={tw("ml-auto mr-8")}>
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
            const offerBudget = new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(
              (item.tkp * item.reach) / 1000 +
                (item.upcharge
                  ? ((item.upcharge * item.upchargeTKP) / 1000) * item.reach
                  : 0)
            );
            // Liste der Attribute und Werte
            const attributes = [
              {
                label: "TKP",
                value: item.tkp
                  ? new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(item.tkp)
                  : null,
              },
              {
                label: "Upcharge-Layers",
                value:
                  item.upcharge && item.upcharge > 0 ? item.upcharge : null,
              },
              {
                label: "TKP pro Upcharge",
                value:
                  item.upcharge && item.upcharge > 0
                    ? numberToEUR(item.upchargeTKP)
                    : null,
              },
              {
                label: "Budget Basis",
                value:
                  item.upcharge && item.upcharge > 0
                    ? numberToEUR((item.reach * item.tkp) / 1000)
                    : null,
              },
              {
                label: "Budget Upcharge",
                value:
                  item.upcharge && item.upcharge > 0
                    ? numberToEUR((item.upchargeTKP / 1000) * item.reach)
                    : null,
              },
              { label: "Frequency Cap", value: item.frequencyCap },
              { label: "Rotation", value: item.rotation },
              { label: "Alterstargeting", value: item.age },
              { label: "Geschlechtertargeting", value: item.gender },
              { label: "Platzierung", value: item.placement },
              { label: "Ausspielung", value: item.platform },
              { label: "Geographie", value: item.plz },
            ].filter((attr) => attr.value); // Filtere Attribute ohne Wert

            // Gruppiere die Attribute in Paare
            const groupedAttributes = groupAttributes(attributes);

            return (
              <View key={index} wrap={false}>
                <View style={tw("mb-8")}>
                  {/* Produktbaustein Header */}
                  <Text style={tw("text-lg font-bold text-slate-900 mb-2")}>
                    Produktbaustein {index + 1} - {item.product}
                  </Text>
                  <Text style={tw("text-sm text-slate-900 mb-2")}>
                    {new Intl.NumberFormat("de-DE").format(item.reach)}{" "}
                    Impressions | {offerBudget} |{" "}
                    {moment(item.start).format("DD.MM.YYYY")} bis{" "}
                    {moment(item.end).format("DD.MM.YYYY")}
                  </Text>

                  {/* Tabellencontainer */}
                  <View
                    style={tw(
                      "border border-gray-300 rounded-lg overflow-hidden"
                    )}
                  >
                    {/* Tabellenkopf */}
                    <View style={tw("flex flex-row bg-gray-200")}>
                      <Text
                        style={tw(
                          "w-1/4 px-4 py-2 font-semibold text-sm text-left border-r border-gray-300"
                        )}
                      >
                        Attribut
                      </Text>
                      <Text
                        style={tw(
                          "w-1/4 px-4 py-2 font-semibold text-sm text-left border-r border-gray-300"
                        )}
                      >
                        Information
                      </Text>
                      <Text
                        style={tw(
                          "w-1/4 px-4 py-2 font-semibold text-sm text-left border-l border-gray-300"
                        )}
                      >
                        Attribut
                      </Text>
                      <Text
                        style={tw(
                          "w-1/4 px-4 py-2 font-semibold text-sm text-left"
                        )}
                      >
                        Information
                      </Text>
                    </View>

                    {/* Tabelleninhalt */}
                    <View style={tw("flex flex-col")}>
                      {groupedAttributes.map((pair, pairIndex) => (
                        <TableRow key={pairIndex} pair={pair} />
                      ))}
                    </View>
                  </View>
                </View>

                {/* Seitenumbruch nach zwei Produktbausteinen */}
                {(index + 1) % 2 === 0 && index !== offer.offers.length - 1 && (
                  <View style={tw("page-break")} />
                )}
              </View>
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
