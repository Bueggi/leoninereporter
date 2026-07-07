import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { formData, selections, product, goalType } = body;

    // Combine notes and targeting into a readable string
    const inboundNotes = `
=== ANGEFRAGTES FORMAT ===
Product: ${product?.name || "-"}
Model: ${product?.model || "-"}

=== TARGETING ===
Zielmarkt: ${formData.targetMarket || "-"}
Alter: ${selections?.age?.join(", ") || "-"}
Geschlecht: ${selections?.gender?.join(", ") || "-"}
Inventar: ${selections?.inventory?.join(", ") || "-"}
Umfelder: ${selections?.genre?.join(", ") || "-"}

=== WEITERE INFOS ===
${formData.notes || "-"}
    `.trim();

    const newRequest = await prisma.inboundRequest.create({
      data: {
        advertiser: formData.advertiser, 
        product: formData.product,
        goalType: goalType || null,
        budget: formData.budget ? String(formData.budget) : null,
        reach: formData.reach ? String(formData.reach) : null,
        dateStart: formData.dateStart || null,
        dateEnd: formData.dateEnd || null,
        inboundNotes: inboundNotes,
        
        firstname: formData.firstname,
        lastname: formData.lastname,
        company: formData.company,
        email: formData.email,
        phone: formData.phone || null,
      },
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating inbound request:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
