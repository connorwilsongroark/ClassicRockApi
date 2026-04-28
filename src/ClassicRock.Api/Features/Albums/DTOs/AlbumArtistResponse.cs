namespace ClassicRock.Api.Features.Albums;

public sealed record AlbumArtistResponse(
    Guid ArtistId,
    string ArtistName,
    AlbumArtistRole Role
);