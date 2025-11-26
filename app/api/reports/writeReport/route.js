import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import moment from "moment";

export default async function handler(req, res) {
  try {
    const reportData = await req.json();
    const sanitisedEntries = [];

    for (let channelID in reportData.data) {
      sanitisedEntries.push({
        channelID,
        delta: 0,
        payout: 0,
        revenueAdsense: +reportData.data[channelID].ad_auction,
        revenuePaidFeatures: +reportData.data[channelID].transaction_revenue,
        revenueSubscription: +reportData.data[channelID].red_revenue,
        revenueShortAds: +reportData.data[channelID].partner_revenue,
        revenueShortsSubscription: +reportData.data[channelID].yt_ad_revenue,
      });
    }
    // Überprüfe, ob die Reportdaten vorhanden und nicht leer sind
    if (!reportData || Object.keys(reportData).length === 0) {
      return res
        .status(400)
        .json({ error: "Report data is empty or invalid." });
    }

    // Extrahiere die Start- und Endzeit aus dem ersten Eintrag
    const firstChannelKey = Object.keys(reportData)[0];
    const firstChannel = reportData[firstChannelKey];
    const reportPeriodStart = new Date(firstChannel.startTime);
    const reportPeriodEnd = new Date(firstChannel.endTime);

    // Starte eine Transaktion, um Konsistenz zu gewährleisten
    const report = await prisma.$transaction(async (prisma) => {
      // Erstelle den Report
      const createdReport = await prisma.report.upsert({
        data: {
          reportPeriodStart: moment(firstChannel.startTime).format(),
          reportPeriodEnd: moment(firstChannel.endTime).format(),
          entries: {
            createMany: {
              data: sanitisedEntries,
            },
          },
        },
      });

      // Bereite die ReportEntries vor
      const entries = Object.entries(reportData).map(([channelID, data]) => ({
        reportID: createdReport.id,
        channelID,
        revenueAdsense: data.ad_revenue || 0,
        revenueSubscription: data.partner_revenue || 0,
        revenueShortsSubscription: data.red_revenue || 0,
        revenueShortsAds: data.ad_auction || 0,
        revenuePaidFeatures: data.transaction_revenue || 0,
        revenueAdManager: data.yt_ad_revenue || 0,
        revenueAusgleich: data.ad_reserved || 0,
        delta: 0, // Passe dies nach Bedarf an
        payout: 0, // Passe dies nach Bedarf an
      }));

      // Füge die ReportEntries hinzu
      await prisma.reportEntry.createMany({
        data: entries,
      });

      return createdReport;
    });

    // Sende die erfolgreiche Antwort mit der Report-ID zurück
    return NextResponse.json(
      {
        message: "Der Report wurde erfolgreich erstellt",
        success: true,
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      {
        message: "Etwas ist schief gelaufen",
        success: false,
      },
      { status: 500 }
    );
  }
}
export { handler as POST };
