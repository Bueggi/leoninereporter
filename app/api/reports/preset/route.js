import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const presets = await prisma.reportPreset.findMany({
      where: {
        campaignName: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        weeklyChecks: {
          orderBy: {
            weekOffset: "asc",
          },
        },
      },
      take: 10,
    });

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Error fetching report presets:", error);
    return NextResponse.json(
      { success: false, message: "Fehler beim Laden der Presets" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { campaignName, targetReach, targetBudget, startDate, endDate, weeklyChecks } = await req.json();

    if (!campaignName) {
      return NextResponse.json(
        { success: false, message: "Kampagnen Name fehlt" },
        { status: 400 }
      );
    }

    // Use a transaction to upsert preset and replace weekly checks
    const preset = await prisma.$transaction(async (tx) => {
      // 1. Upsert ReportPreset
      const dbPreset = await tx.reportPreset.upsert({
        where: { campaignName },
        update: {
          targetReach: +targetReach,
          targetBudget: +targetBudget,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        create: {
          campaignName,
          targetReach: +targetReach,
          targetBudget: +targetBudget,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      // 2. Delete existing weekly checks for this preset
      await tx.weeklyCheck.deleteMany({
        where: { presetId: dbPreset.id },
      });

      // 3. Create new weekly checks
      if (weeklyChecks && weeklyChecks.length > 0) {
        await tx.weeklyCheck.createMany({
          data: weeklyChecks.map((check) => ({
            presetId: dbPreset.id,
            weekOffset: +check.weekOffset,
            targetReach: +check.targetReach,
            targetBudget: +check.targetBudget,
          })),
        });
      }

      return tx.reportPreset.findUnique({
        where: { id: dbPreset.id },
        include: { weeklyChecks: true },
      });
    });

    return NextResponse.json({ success: true, preset });
  } catch (error) {
    console.error("Error saving report preset:", error);
    return NextResponse.json(
      { success: false, message: "Fehler beim Speichern des Presets" },
      { status: 500 }
    );
  }
}
