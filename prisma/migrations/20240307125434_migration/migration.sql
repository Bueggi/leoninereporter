-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "advertiserID" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportID" TEXT NOT NULL,
    "channelID" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "revenueAdsense" DOUBLE PRECISION NOT NULL,
    "revenueSubscription" DOUBLE PRECISION NOT NULL,
    "revenueShortsSubscription" DOUBLE PRECISION NOT NULL,
    "revenueShortsAds" DOUBLE PRECISION NOT NULL,
    "revenuePaidFeatures" DOUBLE PRECISION NOT NULL,
    "revenueAdManager" DOUBLE PRECISION NOT NULL,
    "revenueAusgleich" DOUBLE PRECISION NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "payout" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ReportEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_advertiserID_fkey" FOREIGN KEY ("advertiserID") REFERENCES "Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEntry" ADD CONSTRAINT "ReportEntry_reportID_fkey" FOREIGN KEY ("reportID") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
