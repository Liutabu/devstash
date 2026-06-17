-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscriptionCancelAtEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionInterval" TEXT,
ADD COLUMN     "subscriptionPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT;
