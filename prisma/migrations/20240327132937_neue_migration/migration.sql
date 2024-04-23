-- CreateEnum
CREATE TYPE "PRODUCT" AS ENUM ('NONSKIPPABLE', 'SKIPPABLE', 'BUMPTER');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "ordernumber" TEXT,
ALTER COLUMN "frequencycap" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "dispo" TEXT,
    "reach" INTEGER,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "product" "PRODUCT",
    "tkp" DOUBLE PRECISION,
    "campaignID" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_campaignID_fkey" FOREIGN KEY ("campaignID") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
