/**
 * Funktion zur Berechnung der gewünschten Summen innerhalb einer Offer-Gruppe
 * @param {Object} offerGroup - Das Objekt der Offer-Gruppe mit den Angeboten
 * @returns {Object} - Ein Objekt mit den berechneten Summen
 */
const calculateUpchargeInformation = (offerGroup) => {
  // Zugriff auf alle Angebote innerhalb der Offer-Gruppe
  const allOffers = offerGroup.offers;

  // 1. Summe der upchargeTKP * Anzahl der upcharges
  const totalUpchargeTKP = allOffers.reduce((sum, offer) => {
    let count = 0;
    if (!!offer.age && offer.age !== "") count++;
    if (!!offer.platform && offer.platform !== "") count++;
    if (!!offer.placement && offer.placement !== "") count++;
    if (!!offer.targeting && offer.targeting !== "") count++;

    return sum + count * offer.upchargeTKP;
  }, 0);

  // 2. Summe der reach, nur wenn upcharge > 0
  const totalReach = allOffers.reduce((sum, offer) => {
    let count = 0;
    if (!!offer.age && offer.age !== "") count++;
    if (!!offer.platform && offer.platform !== "") count++;
    if (!!offer.placement && offer.placement !== "") count++;
    if (!!offer.targeting && offer.targeting !== "") count++;

    return count == 0 ? sum : sum + offer.reach;
  }, 0);

  // Alle Upcharges werden aufgelistet mit
  // {
  // cost, upchargeTKP, reach
  //}
  //, damit sie spaeter auch entsprechend einfach wieder ausgegeben werden koennen
  const ageUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.age && offer.age !== "") {
        return {
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
          reach: sum.reach + offer.reach,
          tkp:
            sum.tkp == 0
              ? offer.upchargeTKP
              : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    {
      cost: 0,
      tkp: 0,
      reach: 0,
    }
  );
  const platformUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.platform && offer.platform !== "") {
        return {
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
          reach: sum.reach + offer.reach,
          tkp:
            sum.tkp == 0
              ? offer.upchargeTKP
              : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    {
      cost: 0,
      tkp: 0,
      reach: 0,
    }
  );
  const placementUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.placement && offer.placement !== "") {
        return {
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
          reach: sum.reach + offer.reach,
          tkp:
            sum.tkp == 0
              ? offer.upchargeTKP
              : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    {
      cost: 0,
      tkp: 0,
      reach: 0,
    }
  );
  const genderUpcharge = allOffers.reduce(
    (sum, offer) => {
      if (!!offer.targeting && offer.targeting !== "") {
        return {
          cost: sum.cost + (offer.upchargeTKP * offer.reach) / 1000,
          reach: sum.reach + offer.reach,
          tkp:
            sum.tkp == 0
              ? offer.upchargeTKP
              : (sum.tkp + offer.upchargeTKP) / 2,
        };
      }
      return sum;
    },
    {
      cost: 0,
      tkp: 0,
      reach: 0,
    }
  );

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
