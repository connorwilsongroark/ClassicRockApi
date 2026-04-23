namespace ClassicRock.Api.Entities;

public sealed class Album
{
    public Guid Id {get; set;}
    public Guid ArtistId {get; set;}
    public string Title {get; set;} = string.Empty;
    public int ReleaseYear {get; set;}
    public decimal? CuratedScore {get; set;}
    public Artist Artist {get; set;} = null!;
}