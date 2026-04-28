namespace ClassicRock.Api.Features.Tracks;

public sealed record UpdateTrackRequest(
    string Name,
    TimeSpan? Duration
);