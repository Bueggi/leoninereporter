-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_campaignID_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_advertiserID_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_offerGroupID_fkey";

-- DropForeignKey
ALTER TABLE "OfferGroup" DROP CONSTRAINT "OfferGroup_campaignID_fkey";

-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "creatorId" DROP NOT NULL,
ALTER COLUMN "advertiserID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_advertiserID_fkey" FOREIGN KEY ("advertiserID") REFERENCES "Advertiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_campaignID_fkey" FOREIGN KEY ("campaignID") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_offerGroupID_fkey" FOREIGN KEY ("offerGroupID") REFERENCES "OfferGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferGroup" ADD CONSTRAINT "OfferGroup_campaignID_fkey" FOREIGN KEY ("campaignID") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
