// app/api/offer-group/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma"; // Pfad zu deiner 'db.ts' oder 'prisma.ts' anpassen

const handler = async (request, { params }) => {
  try {
    const { id } = params;
    console.log(params)
    console.log(id);
    // Daten aus dem Body holen
    const body = await request.json();
    const { usesIndividualOfferNumber, individualOfferNumber, pricingModel } = body;

    // WICHTIG: Typ-Konvertierung für Prisma
    // Das Input-Feld liefert Strings, Prisma will Int oder null
    const numberToSave = individualOfferNumber !== null && individualOfferNumber !== ""
      ? individualOfferNumber
      : null;

    // Prisma Update Query
    const updatedGroup = await prisma.offerGroup.update({
      where: {
        id: id,
      },
      data: {
        usesIndividualOfferNumber: Boolean(usesIndividualOfferNumber),
        individualOfferNumber: numberToSave,
        ...(pricingModel ? { pricingModel } : {}),
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Fehler beim Update der OfferGroup:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export { handler as PUT };
