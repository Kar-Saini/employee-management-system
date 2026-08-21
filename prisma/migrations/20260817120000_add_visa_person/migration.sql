-- CreateTable
CREATE TABLE "VisaPerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passport_num" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "entry_date" DATE NOT NULL,
    "exit_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaPerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisaPerson_passport_num_idx" ON "VisaPerson"("passport_num");
