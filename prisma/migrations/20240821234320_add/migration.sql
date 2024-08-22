-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "episode_id" INTEGER,
    "opening_crawl" TEXT,
    "producer" TEXT,
    "release_date" TIMESTAMP(3) NOT NULL,
    "species" TEXT[],
    "starships" TEXT[],
    "vehicles" TEXT[],
    "characters" TEXT[],
    "planets" TEXT[],
    "url" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);
