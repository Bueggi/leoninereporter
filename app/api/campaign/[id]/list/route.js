import { NextResponse } from "next/server";

import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;

    const singlecampaign = await prisma.campaign.findFirst({
      where: {
        id,
      },
      include: {
        advertiser: {
          select: {
            name: true,
          },
        },
        offers: {
          include: { offers: true },
        },
        bookings: true,
      },
    });

    return NextResponse.json(
      { success: true, data: singlecampaign },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen" },
      { status: 500 }
    );
  }
};

export { handler as GET };
