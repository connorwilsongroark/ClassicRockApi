namespace ClassicRock.Api.Infrastructure.Validation;

public sealed class ValidationResult
{
    public Dictionary<string, string[]> Errors {get;} = [];
    public bool IsValid => Errors.Count == 0;

    public void AddError(string field, string message)
    {
        if (Errors.TryGetValue(field, out var existing))
        {
            Errors[field] = [.. existing, message];
            return;
        }

        Errors[field] = [message];
    }
}