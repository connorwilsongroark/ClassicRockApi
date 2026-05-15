namespace ClassicRock.Api.Features.Albums;

// =====================
// Album Requests
// =====================

public sealed record CreateAlbumRequest(
    string Title,
    int ReleaseYear,
    decimal? CuratedScore
);

public sealed record UpdateAlbumRequest(
    string Title,
    int ReleaseYear,
    decimal? CuratedScore
);

// =====================
// Album Relationship Requests
// =====================

public sealed record AddAlbumArtistRequest(
    Guid ArtistId,
    AlbumArtistRole Role
);

public sealed record UpdateAlbumArtistRequest(
    AlbumArtistRole Role
);

public sealed record AddAlbumGenreRequest(
    Guid GenreId,
    bool IsPrimary
);

public sealed record UpdateAlbumGenreRequest(
    bool IsPrimary
);

public sealed record AddAlbumTrackRequest(
    Guid TrackId,
    int TrackNumber
);

public sealed record UpdateAlbumTrackRequest(
    int TrackNumber
);

// =====================
// Album Responses
// =====================

public sealed record AlbumResponse(
    Guid Id,
    string Title,
    int ReleaseYear,
    decimal? CuratedScore,
    string? PrimaryArtistName,
    string? PrimaryGenreName
);

public sealed record AlbumDetailResponse(
    Guid Id,
    string Title,
    int ReleaseYear,
    decimal? CuratedScore,
    IReadOnlyList<AlbumArtistResponse> Artists,
    IReadOnlyList<AlbumGenreResponse> Genres,
    IReadOnlyList<AlbumTrackResponse> Tracks
);

public sealed record AlbumArtistResponse(
    Guid ArtistId,
    string ArtistName,
    AlbumArtistRole Role
);

public sealed record AlbumGenreResponse(
    Guid GenreId,
    string GenreName,
    bool IsPrimary
);

public sealed record AlbumTrackResponse(
    Guid TrackId,
    string TrackName,
    TimeSpan? Duration,
    int TrackNumber
);

public sealed record AlbumBrowseResponse(
    Guid Id,
    string Title,
    int ReleaseYear,
    decimal? CuratedScore,
    IReadOnlyList<string> Artists,
    IReadOnlyList<string> Genres
);
// =====================
// Album Queries
// =====================
public sealed record AlbumBrowseQuery(
    string? Artist,
    string? Genre,
    int? ReleaseYear,
    int? Decade,
    string? Search,
    string? Sort,
    int Page = 1,
    int PageSize = 20
);

// =====================
// Album - Quick Add
// =====================
public sealed record QuickAddAlbumRequest(
    string Title,
    int ReleaseYear,
    decimal? CuratedScore,
    List<QuickAddTrackRequest> Tracks
);

public sealed record QuickAddTrackRequest(
    string Name,
    TimeSpan? Duration
);
public sealed record QuickAddAlbumResponse(
    Guid Id,
    string Title,
    int ReleaseYear,
    decimal? CuratedScore,
    IReadOnlyList<AlbumTrackResponse> Tracks
);