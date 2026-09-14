import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

// Automated cleanup function to delete report presets that haven't been reported/updated in 60 days
async function performCleanup() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 60);

    const deleted = await prisma.reportPreset.deleteMany({
      where: {
        lastQueried: {
          lt: cutoffDate,
        },
      },
    });

    if (deleted.count > 0) {
      console.log(`[Cleanup] Deleted ${deleted.count} report presets older than 60 days.`);
    }
  } catch (error) {
    console.error("[Cleanup] Error during automated preset cleanup:", error);
  }
}

export async function GET(req) {
  try {
    // Run cleanup asynchronously in the background
    performCleanup().catch(err => console.error(err));

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const all = searchParams.get("all") === "true";

    if (!query || all) {
      const presets = await prisma.reportPreset.findMany({
        orderBy: { campaignName: "asc" },
      });
      return NextResponse.json(presets);
    }

    const presets = await prisma.reportPreset.findMany({
      where: {
        campaignName: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 20,
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
    // Run cleanup asynchronously in the background
    performCleanup().catch(err => console.error(err));

    const { campaignName, targetReach, targetBudget, startDate, endDate, showCreatives, showLineItems } = await req.json();

    if (!campaignName) {
      return NextResponse.json(
        { success: false, message: "Kampagnen Name fehlt" },
        { status: 400 }
      );
    }

    const cleanNumber = (val) => {
      if (typeof val === "number") return val;
      if (!val) return 0;
      const cleaned = val.toString().replace(/[\s.,]/g, "");
      return Number(cleaned) || 0;
    };

    const parsedReach = Math.round(cleanNumber(targetReach));
    const parsedBudget = cleanNumber(targetBudget);

    const updateData = {
      targetReach: parsedReach,
      targetBudget: parsedBudget,
      startDate,
      endDate,
      lastQueried: new Date(),
    };
    if (typeof showCreatives === "boolean") updateData.showCreatives = showCreatives;
    if (typeof showLineItems === "boolean") updateData.showLineItems = showLineItems;

    const createData = {
      campaignName,
      targetReach: parsedReach,
      targetBudget: parsedBudget,
      startDate,
      endDate,
      showCreatives: typeof showCreatives === "boolean" ? showCreatives : true,
      showLineItems: typeof showLineItems === "boolean" ? showLineItems : true,
      lastQueried: new Date(),
    };

    const preset = await prisma.reportPreset.upsert({
      where: { campaignName },
      update: updateData,
      create: createData,
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
