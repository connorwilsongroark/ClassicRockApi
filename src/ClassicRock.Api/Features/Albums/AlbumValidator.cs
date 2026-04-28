using ClassicRock.Api.Infrastructure.Validation;

namespace ClassicRock.Api.Features.Albums;

public static class AlbumValidator
{
    public static ValidationResult ValidateForCreate(CreateAlbumRequest request)
    {
        return Validate(request.Title, request.ReleaseYear, request.CuratedScore);
    }

    public static ValidationResult ValidateForUpdate(UpdateAlbumRequest request)
    {
        return Validate(request.Title, request.ReleaseYear, request.CuratedScore);
    }

    public static string NormalizeTitle(string? title)
    {
        return (title ?? string.Empty).Trim();
    }

    private static ValidationResult Validate(string? title, int releaseYear, decimal? curatedScore)
    {
        var result = new ValidationResult();

        var normalizedTitle = NormalizeTitle(title);

        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            result.AddError("title", "Title is required.");
        }
        else if (normalizedTitle.Length > 200)
        {
            result.AddError("title", "Title must be 200 characters or fewer.");
        }

        if (releaseYear < 1900 || releaseYear > DateTime.UtcNow.Year + 1)
        {
            result.AddError("releaseYear", "Release year must be a valid album release year.");
        }

        if (curatedScore is < 0 or > 10)
        {
            result.AddError("curatedScore", "Curated score must be between 0 and 10.");
        }

        return result;
    }
}