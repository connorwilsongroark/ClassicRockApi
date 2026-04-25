using ClassicRock.Api.Entities;

namespace ClassicRock.Api.Features.Albums;

public sealed class AlbumGenre
{
    public Guid AlbumId {get; set;}
    public Guid GenreId {get; set;}
    public bool IsPrimary {get; set;}
    public int SortOrder {get; set;}
    public Album Album {get; set;} = null!;
    public Genre Genre {get; set;} = null!;
}