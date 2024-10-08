import { NextResponse } from "next/server";
import prisma from '@lib/prisma'

const handler = async (req, { params }) => {
  try {
    const { id } = params;
    const campaign = await prisma.campaign.findFirst({where: {id}})
    if (!campaign) return NextResponse.json({message: 'Diese Kampagne existiert nicht', success: false}, {status: 500})

    const deletedCampaign = await prisma.campaign.delete({
      where: {
        id,
      }
    });

    return NextResponse.json(
      { success: true, data: deletedCampaign },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen"},
      { status: 500 }
    );
  }
};

export { handler as DELETE };

