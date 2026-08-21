-- CreateEnum
CREATE TYPE "VisaAction" AS ENUM ('ADDED', 'ENTRY', 'EXIT', 'UPDATED');

-- CreateTable
CREATE TABLE "VisaLog" (
    "id" TEXT NOT NULL,
    "visaPersonId" TEXT NOT NULL,
    "action" "VisaAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisaLog_visaPersonId_idx" ON "VisaLog"("visaPersonId");

-- AddForeignKey
ALTER TABLE "VisaLog" ADD CONSTRAINT "VisaLog_visaPersonId_fkey" FOREIGN KEY ("visaPersonId") REFERENCES "VisaPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
