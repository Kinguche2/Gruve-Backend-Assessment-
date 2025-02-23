/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_ownerId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "ownerId";
