using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClassicRock.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveArtistIdFromAlbums : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Albums_Artists_ArtistId",
                table: "Albums");

            migrationBuilder.DropIndex(
                name: "IX_Albums_ArtistId_Title",
                table: "Albums");

            migrationBuilder.DropColumn(
                name: "ArtistId",
                table: "Albums");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ArtistId",
                table: "Albums",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Albums_ArtistId_Title",
                table: "Albums",
                columns: new[] { "ArtistId", "Title" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Albums_Artists_ArtistId",
                table: "Albums",
                column: "ArtistId",
                principalTable: "Artists",
                principalColumn: "Id");
        }
    }
}
