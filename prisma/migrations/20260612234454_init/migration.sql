-- CreateTable
CREATE TABLE "admin_users" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "profile_image_url" VARCHAR(500),
    "background_image_url" VARCHAR(500),
    "instagram_url" VARCHAR(500),
    "telegram_url" VARCHAR(500),
    "youtube_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" BIGSERIAL NOT NULL,
    "artist_id" BIGINT,
    "title" VARCHAR(255) NOT NULL,
    "cover_image_url" VARCHAR(500),
    "release_year" INTEGER,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songs" (
    "id" BIGSERIAL NOT NULL,
    "artist_id" BIGINT,
    "album_id" BIGINT,
    "title" VARCHAR(255) NOT NULL,
    "duration_seconds" INTEGER,
    "audio_url" VARCHAR(500) NOT NULL,
    "cover_image_url" VARCHAR(500),
    "release_year" INTEGER,
    "play_count" BIGINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" BIGSERIAL NOT NULL,
    "artist_id" BIGINT,
    "title" VARCHAR(255) NOT NULL,
    "youtube_url" VARCHAR(500) NOT NULL,
    "youtube_id" VARCHAR(50) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "release_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE INDEX "albums_is_active_created_at_idx" ON "albums"("is_active", "created_at" DESC);

-- CreateIndex
CREATE INDEX "albums_artist_id_idx" ON "albums"("artist_id");

-- CreateIndex
CREATE INDEX "songs_is_active_sort_order_created_at_idx" ON "songs"("is_active", "sort_order", "created_at" DESC);

-- CreateIndex
CREATE INDEX "songs_is_active_play_count_idx" ON "songs"("is_active", "play_count" DESC);

-- CreateIndex
CREATE INDEX "songs_album_id_is_active_sort_order_idx" ON "songs"("album_id", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "songs_title_idx" ON "songs"("title");

-- CreateIndex
CREATE INDEX "videos_is_active_sort_order_created_at_idx" ON "videos"("is_active", "sort_order", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
