-- CreateTable
CREATE TABLE "WishlistMovie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "externalMovieId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "posterUrl" TEXT,
    "releaseDate" TEXT,
    "rating" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "WishlistMovie_externalMovieId_key" ON "WishlistMovie"("externalMovieId");
