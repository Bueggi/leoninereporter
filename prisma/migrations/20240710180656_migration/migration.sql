-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "customer" TEXT,
ADD COLUMN     "customergroup" TEXT,
ADD COLUMN     "isServiceplan" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "onlineCampaign" TEXT,
ADD COLUMN     "product" TEXT,
ADD COLUMN     "productfamily" TEXT;
