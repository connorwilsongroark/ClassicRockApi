namespace ClassicRock.Api.Features.Albums;

// Note that this DTO is only focused on creating the album w/o any references to artist or genre, since those are many-to-many
public sealed record CreateAlbumRequest(
    string Title,
    int ReleaseYear,
    decimal? CuratedScore
);