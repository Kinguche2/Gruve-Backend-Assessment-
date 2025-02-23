/*
  Warnings:

  - You are about to drop the column `shard` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "shard";
