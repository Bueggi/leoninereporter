import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const handler = async (req, res) => {
  try {
    const {
      name,
      channelID,
      image,
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
    } = await req.json();

    if (!name || !channelID || !share || !company || !goal || !image)
      return NextResponse.json(
        { success: false, message: "Der Name darf nicht leer sein" },
        { status: 500 }
      );

    const newCreator = await prisma.creator.create({
      data: {
        channelName: name,
        channelID,
        channelIDs,
        image,
        share: +share,
        company,
        goal: +goal,
        anbindung,
        taxable,
        reverseCharge,
        paymentGoal: +paymentGoal,
        invoiceAddress,
        management,
      },
    });

    // id             String    @id @default(uuid())
    // createdAt      DateTime  @default(now())
    // updatedAt      DateTime  @updatedAt
    // channelID      String    @unique
    // channelIDs     String[]  @default([])
    // channelName    String
    // taxable        String?
    // reverseCharge  Boolean?
    // paymentGoal    Int?
    // invoiceAddress String?
    // management     String?
    // share          Int
    // company        String
    // goal           Float
    // demographics   Json?
    // anbindung      Anbindung @default(OWNED)
    // image          String

    return NextResponse.json(
      { success: true, data: newCreator },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as POST };
