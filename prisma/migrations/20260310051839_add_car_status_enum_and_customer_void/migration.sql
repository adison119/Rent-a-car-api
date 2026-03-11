-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'MAINTENANCE', 'VOID');

-- AlterTable: Car.status from text to CarStatus (existing 'available' -> AVAILABLE)
ALTER TABLE "Car" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Car" ALTER COLUMN "status" TYPE "CarStatus" USING (
  CASE "status"
    WHEN 'available' THEN 'AVAILABLE'::"CarStatus"
    WHEN 'maintenance' THEN 'MAINTENANCE'::"CarStatus"
    WHEN 'void' THEN 'VOID'::"CarStatus"
    ELSE 'AVAILABLE'::"CarStatus"
  END
);
ALTER TABLE "Car" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'::"CarStatus";

-- AlterEnum: add VOID to CustomerStatus
ALTER TYPE "CustomerStatus" ADD VALUE 'VOID';
