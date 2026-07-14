import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;

    // Fetch the original OfferGroup with its offers
    const originalGroup = await prisma.offerGroup.findFirst({
      where: { id },
      include: { offers: true },
    });

    if (!originalGroup) {
      return NextResponse.json(
        { success: false, message: "Diese Gruppe existiert nicht" },
        { status: 404 }
      );
    }

    // Duplicate the OfferGroup and its nested offers
    const duplicatedGroup = await prisma.offerGroup.create({
      data: {
        campaignID: originalGroup.campaignID,
        individualOfferNumber: originalGroup.individualOfferNumber,
        usesIndividualOfferNumber: originalGroup.usesIndividualOfferNumber,
        pricingModel: originalGroup.pricingModel,
        offers: {
          create: originalGroup.offers.map((off) => ({
            age: off.age,
            frequencyCap: off.frequencyCap,
            plz: off.plz,
            device: off.device,
            placement: off.placement,
            reach: off.reach,
            upcharge: off.upcharge,
            upchargeTKP: off.upchargeTKP,
            start: off.start,
            end: off.end,
            product: off.product,
            rotation: off.rotation,
            tkp: off.tkp,
            output: off.output,
            targeting: off.targeting,
          })),
        },
      },
      include: {
        offers: true,
      },
    });

    return NextResponse.json(
      { success: true, data: duplicatedGroup },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen" },
      { status: 500 }
    );
  }
};

export { handler as POST };
