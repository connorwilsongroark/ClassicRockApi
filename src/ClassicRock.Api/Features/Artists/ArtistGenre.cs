using ClassicRock.Api.Entities;

namespace ClassicRock.Api.Features.Artists;

public sealed class ArtistGenre
{
    public Guid ArtistId { get; set; }
    public Guid GenreId { get; set; }
    public bool IsPrimary {get; set; }
    public int SortOrder { get; set; }
    public Artist Artist { get; set; } = null!;
    public Genre Genre { get; set; } = null!;
}