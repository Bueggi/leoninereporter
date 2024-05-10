/*
  Warnings:

  - You are about to drop the column `campaignID` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `creatorIds` on the `Offer` table. All the data in the column will be lost.
  - Added the required column `rotation` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_campaignID_fkey";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "campaignID",
DROP COLUMN "creatorIds",
ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "offerID" TEXT,
ADD COLUMN     "product" "PRODUCT",
ADD COLUMN     "reach" INTEGER,
ADD COLUMN     "rotation" TEXT NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3),
ADD COLUMN     "tkp" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "OfferGroup" (
    "id" TEXT NOT NULL,
    "campaignID" TEXT,

    CONSTRAINT "OfferGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_offerID_fkey" FOREIGN KEY ("offerID") REFERENCES "OfferGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferGroup" ADD CONSTRAINT "OfferGroup_campaignID_fkey" FOREIGN KEY ("campaignID") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
