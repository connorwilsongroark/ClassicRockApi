using ClassicRock.Api.Features.Albums;

namespace ClassicRock.Api.Entities;

public sealed class Track
{
    public Guid Id {get; set;}
    public string Name {get; set;}
    public TimeSpan? Duration {get; set;}
    public List<AlbumTrack> AlbumTracks {get; set;} = [];
}