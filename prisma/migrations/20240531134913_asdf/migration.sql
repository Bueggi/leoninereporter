/*
  Warnings:

  - You are about to drop the column `advertiserID` on the `Campaign` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_advertiserID_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "advertiserID",
ADD COLUMN     "advertiserId" TEXT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
