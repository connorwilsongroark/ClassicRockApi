using ClassicRock.Api.Entities;

namespace ClassicRock.Api.Features.Albums;

public sealed class AlbumTrack
{
    public Guid AlbumId {get; set;}
    public Guid TrackId { get; set; }
    public int TrackNumber {get; set;}
    public Album Album {get; set;} = null!;
    public Track Track { get; set; } = null!;
}