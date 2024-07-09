import { NextResponse } from "next/server";

import prisma from "../../../../../lib/prisma";

const handler = async (req, { params }) => {
  try {
    const {
      name,
      advertiserID,
      isServiceplan,
      ordernumber,
      product,
      onlineCampaign,
      productfamily,
      customergroup,
      customer,
      status,
    } = await req.json();

    const { id } = params;

    const updateCampaign = await prisma.campaign.update({
      where: {
        id,
      },

      data: {
        name,
        advertiserID,
        isServiceplan,
        ordernumber,
        product,
        onlineCampaign,
        productfamily,
        customergroup,
        customer,
        status,
      },
    });

    return NextResponse.json(
      { success: true, data: updateCampaign },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen" },
      { status: 500 }
    );
  }
};

export { handler as PUT };
