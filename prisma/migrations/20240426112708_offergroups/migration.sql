/*
  Warnings:

  - You are about to drop the column `offerID` on the `Offer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_offerID_fkey";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "offerID",
ADD COLUMN     "offerGroupID" TEXT;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_offerGroupID_fkey" FOREIGN KEY ("offerGroupID") REFERENCES "OfferGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
