import React, { useState } from "react";
import {
  pdf,
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
import adFormatNames from "@lib/dashboard/AdFormatNames";

// import tw main
import { tw } from "@lib/tw";

// import helperfunctions
import {
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
} from "@lib/dashboard/pdfGeneration/helperFunctions";

// 1. Fonts global registrieren (außerhalb der Component)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "/Inter_18pt-Medium.ttf",
      format: "truetype",
      fontWeight: "normal",
    },
    { src: "/Inter_18pt-Bold.ttf", format: "truetype", fontWeight: "bold" },
  ],
});

const DownloadPDFButton = ({
  campaignName,
  offer,
  advertiser,
  contact,
  contactEmail,
  user,
  userEmail,
  anrede,
  trade,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingWithFlights, setIsGeneratingWithFlights] = useState(false);

  const handleDownload = async (showFlights = false) => {
    try {
      if (showFlights) {
        setIsGeneratingWithFlights(true);
      } else {
        setIsGenerating(true);
      }

      const suffix = showFlights ? "_mit_flights" : "";
      const fileName = `HoT_Angebot_${offer.offernumber}-${campaignName}${suffix}.pdf`;

      const doc = (
        <MyDoc
          campaignName={campaignName}
          offer={offer}
          advertiser={advertiser}
          contact={contact}
          contactEmail={contactEmail}
          user={user}
          userEmail={userEmail}
          anrede={anrede}
          trade={trade}
          showFlights={showFlights}
        />
      );

      const blob = await pdf(doc).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Fehler beim Generieren des PDFs:", error);
      alert("Es gab einen Fehler beim Erstellen des PDFs.");
    } finally {
      setIsGenerating(false);
      setIsGeneratingWithFlights(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .pdf-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px 6px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .pdf-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        .pdf-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12);
          background: linear-gradient(135deg, #334155 0%, #475569 100%);
        }
        .pdf-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .pdf-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .pdf-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: rgba(239, 68, 68, 0.9);
          box-shadow: 0 1px 4px rgba(239,68,68,0.4);
          flex-shrink: 0;
        }
        .pdf-btn-icon svg {
          width: 12px;
          height: 12px;
        }
        .spin {
          animation: spin-slow 1s linear infinite;
        }

        .pdf-btn-flights {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        }
        .pdf-btn-flights:hover:not(:disabled) {
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
        }
        .pdf-btn-flights .pdf-btn-icon {
          background: rgba(99, 102, 241, 0.9);
          box-shadow: 0 1px 4px rgba(99, 102, 241, 0.4);
        }
      `}</style>

      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => handleDownload(false)}
          disabled={isGenerating || isGeneratingWithFlights}
          className="pdf-btn"
          title="Angebot als PDF herunterladen"
        >
          <span className="pdf-btn-icon">
            {isGenerating ? (
              <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M12 16l-5-5h3V4h4v7h3l-5 5z"/>
                <path d="M5 18h14v2H5z"/>
              </svg>
            )}
          </span>
          <span>{isGenerating ? "Generiere…" : "PDF"}</span>
        </button>

        <button
          onClick={() => handleDownload(true)}
          disabled={isGenerating || isGeneratingWithFlights}
          className="pdf-btn pdf-btn-flights"
          title="Angebot inkl. Flight-Details herunterladen"
        >
          <span className="pdf-btn-icon">
            {isGeneratingWithFlights ? (
              <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            )}
          </span>
          <span>{isGeneratingWithFlights ? "Generiere…" : "PDF + Flights"}</span>
        </button>
      </div>
    </>
  );
};
export default DownloadPDFButton;

// --- DEINE URSPRÜNGLICHE DOKUMENT-STRUKTUR (Unverändert) ---

export const MyDoc = ({
  offer,
  contact,
  contactEmail,
  user,
  userEmail,
  anrede,
  trade,
  showFlights = false,
}) => {
  // wenn die Offergroup noch keine Angebote angelegt hat, wird ein leeres Dokument zurückgegeben
  if (offer.offers.length < 1)
    return abortGenerationIfPointless(Document, Page, View, Text);

  const upchargeMetrics = calculateUpchargeInformation(offer);
  const today = moment().format("DD.MM.YYYY");
  const gueltigkeitsDatum = moment().add(14, "days").format("DD.MM.YYYY");
  const zeitraum = calculateRuntime(offer);

  const isCPCV = offer.pricingModel === "CPCV";

  const totalBudget = numberToEUR(
    offer.offers.reduce(
      (accumulator, currentValue) =>
        isCPCV
          ? accumulator + currentValue.reach * currentValue.tkp
          : accumulator + (currentValue.reach * currentValue.tkp) / 1000,
      0,
    ) + upchargeMetrics.totalCosts,
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
            "flex flex-row justify-between items-start bg-[#AB8353] pt-12 px-12 pb-8 mb-6",
          )}
        >
          <Image
            src={"/HoT_Background.png"}
            alt=""
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
          <Image
            src="/HoTLogo_White.png"
            alt=""
            style={tw("w-24 h-auto opacity-90")}
          />
        </View>
        <View style={tw("px-12")}>
          {/* HERO SECTION - Fließend ohne harte Boxen */}

          <View style={tw("relative mb-8")}>
            {/* Kampagnenname als großer Eyecatcher */}
            <Ueberschrift>
              <View style={tw("flex flex-row gap-4 items-center")}>
                <Text>
                  Angebot Nr.{" "}
                  {offer.usesIndividualOfferNumber &&
                  offer.individualOfferNumber !== null
                    ? offer.individualOfferNumber
                    : offer.offernumber}
                </Text>
                {trade && (
                  <View
                    style={tw(
                      "flex items-center justify-center w-12 h-6 p-4 inline-flex items-center rounded-md bg-[#AB8353] px-1.5 py-0.5 text-xs font-medium text-white",
                    )}
                  >
                    <Text>TRADE</Text>
                  </View>
                )}
              </View>
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
                  {console.log(offer, "IST GENDER ENTHALTEN!")}
                  {[
                    "product",
                    "frequencyCap",
                    "rotation",
                    "age",
                    "targeting",
                  ].map((el, i) => {
                    const title = {
                      product: "Product",
                      frequencyCap: "Frequency Cap",
                      rotation: "Rotation",
                      age: "Age-Targeting",
                      targeting: "Gender",
                    };
                    if (
                      reduceInformationFromOffersToString(offer, el).length &&
                      reduceInformationFromOffersToString(offer, el) !== null
                    ) {
                      return (
                        <View style={tw("flex flex-row  items-center")} key={i}>
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
                  })}

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

                  {["plz", "placement",
                    "device",].map((el, i) => {
                    const title = {
                      device: "Device",
                      plz: "Geographie",
                      placement: "Placement",

                    };

                    const reducedResult = reduceInformationFromOffersToString(
                      offer,
                      el,
                    );
                    if (reducedResult.length && !!reducedResult) {
                      return (
                        <View key={i} style={tw("flex flex-row  items-center")}>
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
                  "flex flex-row items-baseline border-b-2 border-black pb-2 mb-4",
                )}
              >
                <Text
                  style={tw(
                    "flex-1 text-[8px] font-bold uppercase tracking-wider",
                  )}
                >
                  Home of Talents Media
                </Text>
                <Text
                  style={tw(
                    "w-20 text-right text-[8px] uppercase tracking-wider",
                  )}
                >
                  {offer.pricingModel === "CPCV" ? "CPCV (net)" : "TKP (net)"}
                </Text>
                <Text
                  style={tw(
                    "w-24 text-right text-[8px] uppercase tracking-wider",
                  )}
                >
                  Impressions
                </Text>
                <Text
                  style={tw(
                    "w-24 text-right text-[8px] uppercase tracking-wider",
                  )}
                >
                  Budget (net)
                </Text>
              </View>
            </InfoSchrift>

            {/* Products mit fließenden Linien */}

            {productMetrics.SOV.reach > 0 && (
              <ProductInformationRow
                productMetrics={productMetrics}
                product={"SOV"}
              />
            )}
            <ProductInformationRow
              productMetrics={productMetrics}
              product={"CTV"}
            />

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

                {upchargeMetrics.deviceUpcharge.cost > 0 && (
                  <ProductInformationRow
                    productMetrics={upchargeMetrics.deviceUpcharge}
                    product={"+ Upcharge Device"}
                  />
                )}

                {upchargeMetrics.placementUpcharge.cost > 0 && (
                  <ProductInformationRow
                    productMetrics={upchargeMetrics.placementUpcharge}
                    product={`+ Upcharge Placement`}
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
              <Text>
                Im Rahmen unserer übergreifenden Partnerschaft rechnen wir alle
                Kampagnen bis zu einer Abweichung von maximal 2% mit dem vollen
                Budget ab.
              </Text>
              <Text style={tw("mt-3")}>
                Wir freuen uns über baldige Rückmeldung.
              </Text>
            </FliessText>

            {/* Ersteller Info */}
            <View
              style={tw(
                "flex flex-row justify-between items-end mt-8 pt-4 border-t border-gray-200",
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
          </View>
        </View>
      </Page>
      {showFlights && (
        <Page size="A4" style={tw("bg-white text-black")}>
          <View
            style={tw(
              "flex flex-row justify-between items-start bg-[#AB8353] pt-12 px-12 pb-8 mb-6",
            )}
          >
            <Image
              src={"/HoT_Background.png"}
              alt=""
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
            <Image
              src="/HoTLogo_White.png"
              alt=""
              style={tw("w-24 h-auto opacity-90")}
            />
          </View>

          <View style={tw("px-12")}>
            <Ueberschrift>
              <Text style={tw("mb-4")}>Flight-Details / Kampagnen-Konfiguration</Text>
            </Ueberschrift>

            {offer.offers.map((flight, idx) => {
              const displayName = adFormatNames.find((f) => f.name === flight.product)?.displayName ?? flight.product;
              const isCPCV = offer.pricingModel === "CPCV";
              const priceLabel = isCPCV ? "CPCV" : "TKP";
              const price = numberToEURPrecise(flight.tkp);
              const reach = new Intl.NumberFormat("de-DE").format(flight.reach);
              const budget = numberToEUR(
                isCPCV
                  ? flight.reach * flight.tkp
                  : (flight.reach * flight.tkp) / 1000
              );
              const run = `${moment(flight.start).format("DD.MM.YYYY")} – ${moment(flight.end).format("DD.MM.YYYY")}`;

              return (
                <View
                  key={idx}
                  wrap={false}
                  style={tw("mb-4 p-4 border border-stone-200 rounded-lg bg-stone-50")}
                >
                  <View style={tw("flex flex-row justify-between items-center border-b border-stone-300 pb-2 mb-2")}>
                    <Text style={tw("font-[Inter] text-xs font-bold text-[#AB8353] uppercase tracking-wider")}>
                      Flight #{idx + 1}: {displayName}
                    </Text>
                    <Text style={tw("font-[Inter] text-xs font-bold text-black")}>
                      {budget}
                    </Text>
                  </View>

                  <View style={tw("flex flex-row justify-between")}>
                    <View style={tw("flex-1 pr-4")}>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>Zeitraum:</Text>
                        <Text style={tw("text-[9px] text-gray-800")}>{run}</Text>
                      </View>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>Rotation:</Text>
                        <Text style={tw("text-[9px] text-gray-800")}>{flight.rotation || "-"}</Text>
                      </View>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>Device:</Text>
                        <Text style={tw("text-[9px] text-gray-800")}>{flight.device || "-"}</Text>
                      </View>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>Placement:</Text>
                        <Text style={tw("text-[9px] text-gray-800")}>{flight.placement || "-"}</Text>
                      </View>
                    </View>

                    <View style={tw("flex-grow flex-1 pl-4 border-l border-stone-200")}>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>Frequency Cap:</Text>
                        <Text style={tw("text-[9px] text-gray-800")}>{flight.frequencyCap || "-"}</Text>
                      </View>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>Alter / Geschlecht / Geographie:</Text>
                        <Text style={tw("text-[9px] text-gray-800")}>
                          {[flight.age, flight.targeting, flight.plz].filter(Boolean).join(" / ") || "-"}
                        </Text>
                      </View>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>Reichweite:</Text>
                        <Text style={tw("text-[9px] text-gray-800 font-bold")}>{reach}</Text>
                      </View>
                      <View style={tw("flex flex-row justify-between mb-1")}>
                        <Text style={tw("text-[9px] text-gray-500 font-bold")}>{priceLabel}:</Text>
                        <Text style={tw("text-[9px] text-gray-800 font-bold")}>{price}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Page>
      )}
    </Document>
  );
};
