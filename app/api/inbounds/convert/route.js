import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

export async function POST(req) {
  try {
    const { id } = await req.json();

    const inbound = await prisma.inboundRequest.findUnique({
      where: { id }
    });

    if (!inbound) {
      return NextResponse.json({ success: false, message: "Inbound request not found" }, { status: 404 });
    }

    if (inbound.status === "CONVERTED") {
      return NextResponse.json({ success: false, message: "Already converted" }, { status: 400 });
    }

    const campaignName = `Inbound: ${inbound.advertiser} - ${inbound.product} (${new Date(inbound.createdAt).toLocaleDateString('de-DE')})`;
    let finalCampaignName = campaignName;
    let count = 1;
    while (await prisma.campaign.findUnique({ where: { name: finalCampaignName } })) {
      finalCampaignName = `${campaignName} (${count})`;
      count++;
    }

    // Build the old inboundNotes text for the campaign
    const campaignNotes = `
=== KAMPAGNENDATEN ===
${inbound.goalType === 'budget' ? `Budget (Fest): € ${inbound.budget}` : `Reichweite (Fest): ${inbound.reach}`}
Laufzeit: ${inbound.dateStart || "-"} bis ${inbound.dateEnd || "-"}

${inbound.inboundNotes}
    `.trim();

    // Create the campaign inside a transaction to ensure both happen
    const [newCampaign, updatedInbound] = await prisma.$transaction([
      prisma.campaign.create({
        data: {
          name: finalCampaignName,
          customer: inbound.advertiser,
          product: inbound.product,
          contact: `${inbound.firstname} ${inbound.lastname}`,
          contactEmail: inbound.email,
          status: "OFFER",
          inboundNotes: campaignNotes, // Keep data safe in Campaign model as well 
        }
      }),
      prisma.inboundRequest.update({
        where: { id },
        data: { status: "CONVERTED" }
      })
    ]);

    return NextResponse.json({ success: true, campaignId: newCampaign.id });
  } catch (error) {
    console.error("Error converting inbound:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
