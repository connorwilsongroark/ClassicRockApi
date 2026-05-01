namespace ClassicRock.Api.Features.Tracks;

public sealed record CreateTrackRequest(
    string Name,
    TimeSpan? Duration
);
public sealed record TrackResponse(
    Guid Id,
    string Name,
    TimeSpan? Duration
);
public sealed record UpdateTrackRequest(
    string Name,
    TimeSpan? Duration
);