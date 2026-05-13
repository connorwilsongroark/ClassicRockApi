using ClassicRock.Api.Entities;
using ClassicRock.Api.Features.Albums;
using ClassicRock.Api.Features.Artists;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options): DbContext(options)
{
    public DbSet<Artist> Artists => Set<Artist>();
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Track> Tracks => Set<Track>();
    public DbSet<ArtistGenre> ArtistGenres => Set<ArtistGenre>();
    public DbSet<AlbumGenre> AlbumGenres => Set<AlbumGenre>();
    public DbSet<AlbumArtist> AlbumArtists => Set<AlbumArtist>();
    public DbSet<AlbumTrack> AlbumTracks => Set<AlbumTrack>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Artist>(entity =>
        {
            entity.ToTable("Artists");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Country)
            .HasMaxLength(100);

            entity.HasIndex(x => x.Name)
                .IsUnique();
        });

        modelBuilder.Entity<Album>(entity =>
        {
            entity.ToTable("Albums");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Title)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.CuratedScore).HasPrecision(4,2);

        });

        modelBuilder.Entity<Genre>(entity =>
        {
           entity.ToTable("Genres");
           entity.HasKey(x => x.Id);

           entity.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

            entity.HasIndex(x => x.Name)
                .IsUnique();
        });

        modelBuilder.Entity<Track>(entity =>
        {
            entity.ToTable("Tracks");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();
        });

        modelBuilder.Entity<ArtistGenre>(entity =>
        {
            entity.ToTable("ArtistGenres");
            entity.HasKey(x => new { x.ArtistId, x.GenreId });

            entity.Property(x => x.IsPrimary).IsRequired();

            entity.HasOne(x => x.Artist)
                .WithMany(x => x.ArtistGenres)
                .HasForeignKey(x => x.ArtistId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(x => x.Genre)
                .WithMany(x => x.ArtistGenres)
                .HasForeignKey(x => x.GenreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AlbumGenre>(entity =>
        {
            entity.ToTable("AlbumGenres");
            entity.HasKey(x => new { x.AlbumId, x.GenreId });

            entity.Property(x => x.IsPrimary).IsRequired();

            entity.HasOne(x => x.Album)
                .WithMany(x => x.AlbumGenres)
                .HasForeignKey(x => x.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(x => x.Genre)
                .WithMany(x => x.AlbumGenres)
                .HasForeignKey(x => x.GenreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AlbumArtist>(entity =>
        {
            entity.ToTable("AlbumArtists");
            entity.HasKey(x => new { x.AlbumId, x.ArtistId });

            entity.Property(x => x.Role).IsRequired();

            entity.HasOne(x => x.Album)
                .WithMany(x => x.AlbumArtists)
                .HasForeignKey(x => x.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(x => x.Artist)
                .WithMany(x => x.AlbumArtists)
                .HasForeignKey(x => x.ArtistId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AlbumTrack>(entity =>
        {
            entity.ToTable("AlbumTracks");
            entity.HasKey(x => new { x.AlbumId, x.TrackId });

            entity.HasIndex(x => new {x.AlbumId, x.TrackNumber}).IsUnique();

            entity.Property(x => x.TrackNumber).IsRequired();

            entity.HasOne(x => x.Album)
                .WithMany(x => x.AlbumTracks)
                .HasForeignKey(x => x.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(x => x.Track)
                .WithMany(x => x.AlbumTracks)
                .HasForeignKey(x => x.TrackId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Action)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.EntityType)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.EntityId)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.UserId)
                .HasMaxLength(300);

            entity.Property(x => x.UserEmail)
                .HasMaxLength(300);

            entity.Property(x => x.CreatedAtUtc)
                .IsRequired();

            entity.Property(x => x.DetailsJson);
        });

        
        // base.OnModelCreating(modelBuilder);
    }
}