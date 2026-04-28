namespace ClassicRock.Api.Features.Artists;

public sealed record CreateArtistRequest(
    string Name,
    string? Country,
    int? FormedYear
);