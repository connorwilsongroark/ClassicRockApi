namespace ClassicRock.Api.Auth;

public static class Permissions
{
    public const string CreateAlbums = "create:albums";
    public const string UpdateAlbums = "update:albums";
    public const string DeleteAlbums = "delete:albums";

    public const string CreateArtists = "create:artists";
    public const string UpdateArtists = "update:artists";
    public const string DeleteArtists = "delete:artists";

    public const string CreateGenres = "create:genres";
    public const string UpdateGenres = "update:genres";
    public const string DeleteGenres = "delete:genres";

    public const string CreateTracks = "create:tracks";
    public const string UpdateTracks = "update:tracks";
    public const string DeleteTracks = "delete:tracks";

    public const string ManageAlbumArtists = "manage:album-artists";
    public const string ManageAlbumGenres = "manage:album-genres";
    public const string ManageAlbumTracks = "manage:album-tracks";

    public static readonly string[] All =
    [
        CreateAlbums,
        UpdateAlbums,
        DeleteAlbums,

        CreateArtists,
        UpdateArtists,
        DeleteArtists,

        CreateGenres,
        UpdateGenres,
        DeleteGenres,

        CreateTracks,
        UpdateTracks,
        DeleteTracks,

        ManageAlbumArtists,
        ManageAlbumGenres,
        ManageAlbumTracks
    ];
}