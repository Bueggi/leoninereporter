-- AlterTable
ALTER TABLE "Advertiser" ADD COLUMN     "riskFee" INTEGER;

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "channelIDs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "invoiceAddress" TEXT,
ADD COLUMN     "management" TEXT,
ADD COLUMN     "paymentGoal" INTEGER,
ADD COLUMN     "reverseCharge" BOOLEAN,
ADD COLUMN     "taxable" TEXT;
