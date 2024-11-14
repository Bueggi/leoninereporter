import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;

    // Die JSON-Daten aus dem Request extrahieren
    const {
      channelName,
      channelIDs,
      company,
      demographics,
      goal,
      anbindung,
      invoiceAddress,
      management,
      paymentGoal,
      reverseCharge,
      share,
      city,
      country,
      realName,
      taxable,
    } = await req.json();

    console.log(channelName);

    // Validierung, um sicherzustellen, dass alle benötigten Daten vorhanden sind
    const requiredFields = [channelName, company, goal, anbindung, share];

    if (requiredFields.some((field) => field === undefined || field === null)) {
      return NextResponse.json(
        { success: false, message: "Erforderliche Felder fehlen" },
        { status: 400 }
      );
    }

    // `share`, `goal` und `paymentGoal` in Zahlen umwandeln
    const updatedCreator = await prisma.creator.update({
      where: {
        id,
      },
      data: {
        channelName: channelName,
        channelIDs: {
          deleteMany: {},
          createMany: { data: channelIDs },
        },
        company,
        demographics: demographics || {},
        goal: parseFloat(goal),
        anbindung,
        invoiceAddress,
        management,
        paymentGoal: paymentGoal ? parseInt(paymentGoal, 10) : null,
        reverseCharge: reverseCharge ?? false,
        share: parseInt(share, 10),
        city,
        country,
        realName,
        taxable,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedCreator },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as PUT };
