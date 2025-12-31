import { NextResponse } from "next/server";

import prisma from "../../../../../lib/prisma";

const handler = async (req, { params }) => {
  try {
    const {
      name,
      anrede,
      advertiserID,
      isServiceplan,
      ordernumber,
      product,
      onlineCampaign,
      productfamily,
      customergroup,
      customer,
      status,
      customRiskFee,
      customRiskFeeAmount,
      contact,
      contactEmail,
      trade
    } = await req.json();

    const { id } = params;

    const updateCampaign = await prisma.campaign.update({
      where: {
        id,
      },

      data: {
        name,
        anrede,
        advertiserID,
        isServiceplan,
        ordernumber,
        product,
        onlineCampaign,
        productfamily,
        customergroup,
        customer,
        status,
        customRiskFee,
        contact,
        contactEmail,
        customRiskFeeAmount: +customRiskFeeAmount,
        trade
      },
      include: {
        advertiser: {
          select: {
            name: true,
          },
        },
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
