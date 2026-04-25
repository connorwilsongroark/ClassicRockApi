using ClassicRock.Api.Features.Artists;

namespace ClassicRock.Api.Entities;

public sealed class Artist
{
    public Guid Id {get; set;}
    public string Name {get; set;} = string.Empty;
    public string? Country {get; set;}
    public int? FormedYear {get; set;}
    public List<Album> Albums {get; set;} = [];
    public List<ArtistGenre> ArtistGenres {get; set;} = [];
    public List<AlbumArtist> AlbumArtists { get; set; } = [];
}