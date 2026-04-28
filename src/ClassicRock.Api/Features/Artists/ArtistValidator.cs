using ClassicRock.Api.Infrastructure.Validation;

namespace ClassicRock.Api.Features.Artists;

public static class ArtistValidator
{
    private const int MaxNameLength = 150;
    private const int MaxCountryLength = 100;
    private const int MinFormedYear = 1900;

    public static ValidationResult ValidateForCreate(CreateArtistRequest request)
    {
        return Validate(request.Name, request.Country, request.FormedYear);
    }

    public static ValidationResult ValidateForUpdate(UpdateArtistRequest request)
    {
        return Validate(request.Name, request.Country, request.FormedYear);
    }

    public static string NormalizeName(string? name)
    {
        return (name ?? string.Empty).Trim();
    }

    public static string? NormalizeCountry(string? country)
    {
        var normalizedCountry = country?.Trim();

        return string.IsNullOrWhiteSpace(normalizedCountry)
            ? null
            : normalizedCountry;
    }

    private static ValidationResult Validate(string? name, string? country, int? formedYear)
    {
        var result = new ValidationResult();

        var normalizedName = NormalizeName(name);
        var normalizedCountry = NormalizeCountry(country);

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            result.AddError("name", "Name is required.");
        }
        else if (normalizedName.Length > MaxNameLength)
        {
            result.AddError("name", $"Name must be {MaxNameLength} characters or fewer.");
        }

        if (normalizedCountry is not null && normalizedCountry.Length > MaxCountryLength)
        {
            result.AddError("country", $"Country must be {MaxCountryLength} characters or fewer.");
        }

        if (formedYear.HasValue &&
            (formedYear.Value < MinFormedYear || formedYear.Value > DateTime.UtcNow.Year + 1))
        {
            result.AddError("formedYear", "Formation year must be a valid year.");
        }

        return result;
    }
}