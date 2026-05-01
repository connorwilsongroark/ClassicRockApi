namespace ClassicRock.Api.Features.Artists;

public sealed record ArtistResponse(
    Guid Id,
    string Name,
    string? Country,
    int? FormedYear
);
public sealed record CreateArtistRequest(
    string Name,
    string? Country,
    int? FormedYear
);
public sealed record UpdateArtistRequest(
    string Name,
    string? Country,
    int? FormedYear
);