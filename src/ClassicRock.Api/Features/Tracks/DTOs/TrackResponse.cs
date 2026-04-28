namespace ClassicRock.Api.Features.Tracks;

public sealed record TrackResponse(
    Guid Id,
    string Name,
    TimeSpan? Duration
);