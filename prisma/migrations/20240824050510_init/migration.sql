/*
  Warnings:

  - A unique constraint covering the columns `[episode_id]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - Made the column `episode_id` on table `Movie` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Movie" ALTER COLUMN "episode_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Movie_episode_id_key" ON "Movie"("episode_id");
