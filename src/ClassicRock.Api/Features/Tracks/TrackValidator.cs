using ClassicRock.Api.Infrastructure.Validation;

namespace ClassicRock.Api.Features.Tracks;

public static class TrackValidator
{
    public static ValidationResult ValidateForCreate(CreateTrackRequest request)
    {
        return Validate(request.Name, request.Duration);
    }
    public static ValidationResult ValidateForUpdate(UpdateTrackRequest request)
    {
        return Validate(request.Name, request.Duration);
    }
    public static string NormalizeName(string? name)
    {
        return (name ?? string.Empty).Trim();
    }
    public static TimeSpan? NormalizeDuration(TimeSpan? duration) =>
    duration is null
        ? null
        : TimeSpan.FromSeconds(Math.Round(duration.Value.TotalSeconds));
    private static ValidationResult Validate(string? name, TimeSpan? duration)
    {
        var result = new ValidationResult();
        var normalizedName = NormalizeName(name);

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            result.AddError("name", "Name is required.");
        }
        else if (normalizedName.Length > 200)
        {
            result.AddError("name", "Name must be 200 characters or fewer.");
        }

        if (duration is not null)
        {
            var normalizedDuration = TimeSpan.FromSeconds(
                Math.Round(duration.Value.TotalSeconds)
            );

            if (normalizedDuration <= TimeSpan.Zero)
            {
                result.AddError("duration", "Duration must be greater than zero.");
            }
        }

        return result;
    }
}