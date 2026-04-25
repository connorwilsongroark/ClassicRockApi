using ClassicRock.Api.Features.Albums;
using ClassicRock.Api.Features.Artists;

namespace ClassicRock.Api.Entities;

public sealed class Genre
{
    public Guid Id {get; set;}
    public string Name {get; set;} = string.Empty;
    public List<AlbumGenre> AlbumGenres {get; set;} = [];
    public List<ArtistGenre> ArtistGenres {get; set;} = [];
}