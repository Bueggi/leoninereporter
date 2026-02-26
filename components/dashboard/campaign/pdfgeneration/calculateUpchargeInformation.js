/**
 * Funktion zur Berechnung der gewünschten Summen innerhalb einer Offer-Gruppe
 * @param {Object} offerGroup - Das Objekt der Offer-Gruppe mit den Angeboten
 * @returns {Object} - Ein Objekt mit den berechneten Summen
 */
const calculateUpchargeInformation = (offerGroup) => {
  const allOffers = offerGroup.offers;

  const totalUpchargeTKP = allOffers.reduce((sum, offer) => {
    let count = 0;
    if (!!offer.age && offer.age !== "") count++;
    if (!!offer.platform && offer.platform !== "") count++;
    if (!!offer.placement && offer.placement !== "") count++;
    if (!!offer.targeting && offer.targeting !== "") count++;
    return sum + count * offer.upchargeTKP;
  }, 0);

  const totalReach = allOffers.reduce((sum, offer) => {
    let count = 0;
    if (!!offer.age && offer.age !== "") count++;
    if (!!offer.platform && offer.platform !== "") count++;
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
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
          reach: sum.reach + offer.reach,
          tkp: sum.tkp == 0 ? offer.upchargeTKP : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    { cost: 0, tkp: 0, reach: 0 }
  );
  ageUpcharge.label = collectUniqueValues("age");

  const platformUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.platform && offer.platform !== "") {
        return {
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
          reach: sum.reach + offer.reach,
          tkp: sum.tkp == 0 ? offer.upchargeTKP : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    { cost: 0, tkp: 0, reach: 0 }
  );
  platformUpcharge.label = collectUniqueValues("platform");

  const placementUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.placement && offer.placement !== "") {
        return {
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
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
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
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
    platformUpcharge.cost +
    placementUpcharge.cost +
    genderUpcharge.cost;

  const isUpcharge = totalCosts !== 0;

  return {
    totalUpchargeTKP,
    totalReach,
    totalCosts,
    ageUpcharge,
    platformUpcharge,
    placementUpcharge,
    genderUpcharge,
    isUpcharge,
  };
};

export default calculateUpchargeInformation;