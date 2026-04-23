using ClassicRock.Api.Infrastructure.Validation;

namespace ClassicRock.Api.Features.Genres;

public static class GenreValidator
{
    public static ValidationResult ValidateForCreate(CreateGenreRequest request)
    {
        return ValidateName(request.Name);
    }
    public static ValidationResult ValidateForUpdate(UpdateGenreRequest request)
    {
        return ValidateName(request.Name);
    }
    public static string NormalizeName(string? name)
    {
        return (name ?? string.Empty).Trim();
    }
    private static ValidationResult ValidateName(string? name)
    {
        var result = new ValidationResult();
        var normalizedName = NormalizeName(name);

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            result.AddError("name", "Name is required.");
            return result;
        }

        if (normalizedName.Length > 100)
        {
            result.AddError("name", "Name must be 100 characters or fewer.");
        }

        return result;
    }
}