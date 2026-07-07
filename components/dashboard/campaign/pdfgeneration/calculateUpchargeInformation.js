/**
 * Funktion zur Berechnung der gewünschten Summen innerhalb einer Offer-Gruppe
 * @param {Object} offerGroup - Das Objekt der Offer-Gruppe mit den Angeboten
 * @returns {Object} - Ein Objekt mit den berechneten Summen
 */
const calculateUpchargeInformation = (offerGroup) => {
  const allOffers = offerGroup.offers;
  const isCPCV = offerGroup.pricingModel === "CPCV";

  // Hilfsfunktion: Cost je nach Pricing-Modell berechnen
  const calcCost = (upchargeTKP, reach) =>
    isCPCV ? upchargeTKP * reach : (upchargeTKP * reach) / 1000;

  const totalUpchargeTKP = allOffers.reduce((sum, offer) => {
    let count = 0;
    if (!!offer.age && offer.age !== "") count++;
    if (!!offer.device && offer.device !== "") count++;
    if (!!offer.placement && offer.placement !== "") count++;
    if (!!offer.targeting && offer.targeting !== "") count++;
    return sum + count * offer.upchargeTKP;
  }, 0);

  const totalReach = allOffers.reduce((sum, offer) => {
    let count = 0;
    if (!!offer.age && offer.age !== "") count++;
    if (!!offer.device && offer.device !== "") count++;
    if (!!offer.placement && offer.placement !== "") count++;
    if (!!offer.targeting && offer.targeting !== "") count++;
    return count == 0 ? sum : sum + offer.reach;
  }, 0);

  // Helper: sammelt alle einzigartigen Werte eines Feldes als kommagetrennten String
  const collectUniqueValues = (field) => {
    const values = allOffers
      .map((offer) => offer[field])
      .filter((v) => !!v && v !== "");
    return [...new Set(values)].join(", ");
  };

  const ageUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.age && offer.age !== "") {
        return {
          cost: sum.cost + calcCost(offer.upchargeTKP, offer.reach),
          reach: sum.reach + offer.reach,
          tkp: sum.tkp == 0 ? offer.upchargeTKP : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    { cost: 0, tkp: 0, reach: 0 }
  );
  ageUpcharge.label = collectUniqueValues("age");

  const deviceUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.device && offer.device !== "") {
        return {
          cost: sum.cost + calcCost(offer.upchargeTKP, offer.reach),
          reach: sum.reach + offer.reach,
          tkp: sum.tkp == 0 ? offer.upchargeTKP : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    { cost: 0, tkp: 0, reach: 0 }
  );
  deviceUpcharge.label = collectUniqueValues("device");

  const placementUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.placement && offer.placement !== "") {
        return {
          cost: sum.cost + calcCost(offer.upchargeTKP, offer.reach),
          reach: sum.reach + offer.reach,
          tkp: sum.tkp == 0 ? offer.upchargeTKP : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    { cost: 0, tkp: 0, reach: 0 }
  );
  placementUpcharge.label = collectUniqueValues("placement");

  const genderUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.targeting && offer.targeting !== "") {
        return {
          cost: sum.cost + calcCost(offer.upchargeTKP, offer.reach),
          reach: sum.reach + offer.reach,
          tkp: sum.tkp == 0 ? offer.upchargeTKP : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    { cost: 0, tkp: 0, reach: 0 }
  );
  genderUpcharge.label = collectUniqueValues("targeting");

  const totalCosts =
    ageUpcharge.cost +
    deviceUpcharge.cost +
    placementUpcharge.cost +
    genderUpcharge.cost;

  const isUpcharge = totalCosts !== 0;

  return {
    totalUpchargeTKP,
    totalReach,
    totalCosts,
    ageUpcharge,
    deviceUpcharge,
    placementUpcharge,
    genderUpcharge,
    isUpcharge,
  };
};

export default calculateUpchargeInformation;