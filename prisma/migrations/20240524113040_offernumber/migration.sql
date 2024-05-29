/*
  Warnings:

  - You are about to drop the column `audience` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `end` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `frequencycap` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Campaign` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_advertiserID_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_creatorId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "audience",
DROP COLUMN "end",
DROP COLUMN "frequencycap",
DROP COLUMN "start";

-- AlterTable
ALTER TABLE "OfferGroup" ADD COLUMN     "offernumber" SERIAL NOT NULL;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_advertiserID_fkey" FOREIGN KEY ("advertiserID") REFERENCES "Advertiser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
