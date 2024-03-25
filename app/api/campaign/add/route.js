import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

const handler = async (req, res) => {
  try {
    const session = await getServerSession(authOptions);
    const { user: email } = session;
    const issuer = prisma.user.findUnique({
      where: {
        email,
      },
    });
    const { name, status, advertiserID } = await req.json();
    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        status,
        advertiserID,
        creatorId: issuer.id,
      },
    });

    return NextResponse.json(
      { success: true, data: newCampaign },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as GET };
