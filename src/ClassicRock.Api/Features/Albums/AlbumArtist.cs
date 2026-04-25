using ClassicRock.Api.Entities;

public sealed class AlbumArtist
{
    public Guid AlbumId { get; set; }
    public Guid ArtistId {get; set;}
    public AlbumArtistRole Role {get; set;}
    public Album Album {get; set;} = null!;
    public Artist Artist { get; set; } = null!;
}

public enum AlbumArtistRole
{
    Primary = 1,
    Featured = 2,
    Composer = 3,
    Producer = 4,
    Various = 5
}