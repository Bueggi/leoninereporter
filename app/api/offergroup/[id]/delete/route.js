import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    // id ist die OfferGroupID
    const { id } = params;
    // checke, ob die OfferGroup ueberhaupt existiert
    const offerGroup = await prisma.offerGroup.findFirst({ where: { id } });
    // wenn nicht: gib einen Fehler aus
    if (!offerGroup)
      return NextResponse.json(
        { message: "Diese Gruppe existiert nicht", success: false },
        { status: 500 }
      );

    // loesche jedes Angebot, das in dieser OfferGroup liegt
    const deletedOffers = await prisma.offer.deleteMany({
      where: {
        offerGroupID: id,
      },
    });

    // loesche die Offergroup selbst
    const deletedofferGroup = await prisma.offerGroup.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { success: true, data: deletedofferGroup },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen" },
      { status: 500 }
    );
  }
};

export { handler as DELETE };
