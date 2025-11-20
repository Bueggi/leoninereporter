import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const handler = async (req) => {
  // Entferne 'res', da Next.js API-Handler keine 'res' Parameter benötigen
  try {
    const {
      channelName,
      share,
      company,
      goal,
      anbindung,
      channelIDs,
      taxable,
      reverseCharge,
      paymentGoal,
      invoiceAddress,
      management,
      city,
      country,
      bankData,
      instagram,
    } = await req.json();

    console.log(share, company, goal);

    // Validierung: Überprüfen, ob erforderliche Felder vorhanden sind
    if (!channelName || !share || !company || !goal)
      return NextResponse.json(
        {
          success: false,
          message: "Der Name, Share, Company und Goal dürfen nicht leer sein.",
        },
        { status: 400 }
      );

    // Validierung: Überprüfen, ob channelIDs ein Array von Objekten ist
    if (!Array.isArray(channelIDs) || channelIDs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Es muss mindestens eine ChannelID angegeben werden.",
        },
        { status: 400 }
      );
    }

    // Optional: Weitere Validierungen für jedes ChannelID-Objekt
    for (const channel of channelIDs) {
      if (!channel.channelName || !channel.channelID) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Jede ChannelID muss einen channelName und channelID enthalten.",
          },
          { status: 400 }
        );
      }
    }

    // Erstellung des Creators mit verschachtelten ChannelIDs
    const newCreator = await prisma.creator.create({
      data: {
        bankData,
        instagram,
        channelName,
        image: "",
        share: parseFloat(share),
        company,
        city,
        country,
        goal: parseFloat(goal),
        anbindung: anbindung || "OWNED",
        taxable,
        reverseCharge: Boolean(reverseCharge),
        paymentGoal: parseInt(paymentGoal, 10),
        invoiceAddress,
        management,
        channelIDs: {
          create: channelIDs.map((channel) => ({
            channelName: channel.channelName,
            channelID: channel.channelID,
          })),
        },
      },
      include: {
        channelIDs: true, // Inkludiere ChannelIDs in der Antwort
      },
    });

    console.log(newCreator, "creator wurde angelegt");

    return NextResponse.json(
      { success: true, data: newCreator },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as POST };
