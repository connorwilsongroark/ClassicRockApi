using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClassicRock.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCascadeDeleteBehaviorAndAlbumTrackIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlbumArtists_Artists_ArtistId",
                table: "AlbumArtists");

            migrationBuilder.DropForeignKey(
                name: "FK_AlbumGenres_Genres_GenreId",
                table: "AlbumGenres");

            migrationBuilder.DropForeignKey(
                name: "FK_AlbumTracks_Tracks_TrackId",
                table: "AlbumTracks");

            migrationBuilder.DropForeignKey(
                name: "FK_ArtistGenres_Genres_GenreId",
                table: "ArtistGenres");

            migrationBuilder.CreateIndex(
                name: "IX_AlbumTracks_AlbumId_TrackNumber",
                table: "AlbumTracks",
                columns: new[] { "AlbumId", "TrackNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumArtists_Artists_ArtistId",
                table: "AlbumArtists",
                column: "ArtistId",
                principalTable: "Artists",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumGenres_Genres_GenreId",
                table: "AlbumGenres",
                column: "GenreId",
                principalTable: "Genres",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumTracks_Tracks_TrackId",
                table: "AlbumTracks",
                column: "TrackId",
                principalTable: "Tracks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ArtistGenres_Genres_GenreId",
                table: "ArtistGenres",
                column: "GenreId",
                principalTable: "Genres",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlbumArtists_Artists_ArtistId",
                table: "AlbumArtists");

            migrationBuilder.DropForeignKey(
                name: "FK_AlbumGenres_Genres_GenreId",
                table: "AlbumGenres");

            migrationBuilder.DropForeignKey(
                name: "FK_AlbumTracks_Tracks_TrackId",
                table: "AlbumTracks");

            migrationBuilder.DropForeignKey(
                name: "FK_ArtistGenres_Genres_GenreId",
                table: "ArtistGenres");

            migrationBuilder.DropIndex(
                name: "IX_AlbumTracks_AlbumId_TrackNumber",
                table: "AlbumTracks");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumArtists_Artists_ArtistId",
                table: "AlbumArtists",
                column: "ArtistId",
                principalTable: "Artists",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumGenres_Genres_GenreId",
                table: "AlbumGenres",
                column: "GenreId",
                principalTable: "Genres",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AlbumTracks_Tracks_TrackId",
                table: "AlbumTracks",
                column: "TrackId",
                principalTable: "Tracks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ArtistGenres_Genres_GenreId",
                table: "ArtistGenres",
                column: "GenreId",
                principalTable: "Genres",
                principalColumn: "Id");
        }
    }
}
