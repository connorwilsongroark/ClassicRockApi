namespace ClassicRock.Api.Features.Artists;

public sealed record UpdateArtistRequest(
    string Name,
    string? Country,
    int? FormedYear
);