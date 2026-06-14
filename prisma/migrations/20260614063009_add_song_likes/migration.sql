-- CreateTable
CREATE TABLE "song_likes" (
    "id" BIGSERIAL NOT NULL,
    "song_id" BIGINT NOT NULL,
    "device_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "song_likes_device_id_created_at_idx" ON "song_likes"("device_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "song_likes_song_id_idx" ON "song_likes"("song_id");

-- CreateIndex
CREATE UNIQUE INDEX "song_likes_device_id_song_id_key" ON "song_likes"("device_id", "song_id");

-- AddForeignKey
ALTER TABLE "song_likes" ADD CONSTRAINT "song_likes_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
