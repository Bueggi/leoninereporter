import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;

    // Fetch the original Offer
    const originalOffer = await prisma.offer.findFirst({
      where: { id },
    });

    if (!originalOffer) {
      return NextResponse.json(
        { success: false, message: "Dieses Offer existiert nicht" },
        { status: 404 }
      );
    }

    // Duplicate the Offer
    const duplicatedOffer = await prisma.offer.create({
      data: {
        age: originalOffer.age,
        frequencyCap: originalOffer.frequencyCap,
        plz: originalOffer.plz,
        device: originalOffer.device,
        placement: originalOffer.placement,
        reach: originalOffer.reach,
        upcharge: originalOffer.upcharge,
        upchargeTKP: originalOffer.upchargeTKP,
        start: originalOffer.start,
        end: originalOffer.end,
        product: originalOffer.product,
        rotation: originalOffer.rotation,
        tkp: originalOffer.tkp,
        output: originalOffer.output,
        targeting: originalOffer.targeting,
        offerGroupID: originalOffer.offerGroupID,
      },
    });

    return NextResponse.json(
      { success: true, data: duplicatedOffer },
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
