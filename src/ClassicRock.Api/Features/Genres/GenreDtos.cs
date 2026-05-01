namespace ClassicRock.Api.Features.Genres;

public sealed record GenreResponse(
    Guid Id,
    string Name
);
public sealed record CreateGenreRequest(string Name);
public sealed record UpdateGenreRequest(
    string Name
);