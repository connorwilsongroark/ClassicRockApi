namespace ClassicRock.Api.Features.Artists;

public sealed record ArtistResponse(
    Guid Id,
    string Name,
    string? Country,
    int? FormedYear
);