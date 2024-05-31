/*
  Warnings:

  - You are about to drop the column `advertiserId` on the `Campaign` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_advertiserId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "advertiserId",
ADD COLUMN     "advertiserID" TEXT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_advertiserID_fkey" FOREIGN KEY ("advertiserID") REFERENCES "Advertiser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
