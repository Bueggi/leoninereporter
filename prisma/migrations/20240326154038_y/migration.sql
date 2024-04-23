/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Advertiser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelID]` on the table `Creator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `audience` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequencycap` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "audience" TEXT NOT NULL,
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "frequencycap" TEXT NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Advertiser_name_key" ON "Advertiser"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_name_key" ON "Campaign"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_channelID_key" ON "Creator"("channelID");
