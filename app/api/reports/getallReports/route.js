import { NextResponse } from "next/server";

import prisma from "@lib/prisma";

const handler = async (req) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        entries: {
          select: {
            id: true,
            report: true,
            reportID: true,
            channelId: true,
            // revenueAdsense: true,
            // revenueSubscription: true,
            // revenueShortsSubscription: true,
            // revenueShortsAds: true,
            // revenuePaidFeatures: true,
            // revenueAdManager: true,
            // revenueAusgleich: true,
            // delta: true,
            // payout: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: reports }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen" },
      { status: 500 }
    );
  }
};

export { handler as GET };
