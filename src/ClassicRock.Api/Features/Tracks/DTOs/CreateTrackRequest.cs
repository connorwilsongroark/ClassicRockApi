namespace ClassicRock.Api.Features.Tracks;

public sealed record CreateTrackRequest(
    string Name,
    TimeSpan? Duration
);