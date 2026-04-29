namespace ClassicRock.Api.Features.Albums;

public sealed record AddAlbumTrackRequest(
    Guid TrackId,
    int TrackNumber
);