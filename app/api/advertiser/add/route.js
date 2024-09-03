import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

const handler = async (req, res) => {
  try {
    const { name, riskFee } = await req.json();
    if (name === "")
      return NextResponse.json(
        { success: false, message: "Der Name darf nicht leer sein" },
        { status: 500 }
      );

    const newAdvertiser = await prisma.advertiser.create({
      data: {
        name,
        riskFee: +riskFee,
      },
    });

    return NextResponse.json(
      { success: true, data: newAdvertiser },
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
