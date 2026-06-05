-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
