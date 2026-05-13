namespace ClassicRock.Api.Entities;

public sealed class AuditLog
{
    public Guid Id { get; set; }

    public string Action { get; set; } = string.Empty;

    public string EntityType { get; set; } = string.Empty;

    public string EntityId { get; set; } = string.Empty;

    public string? UserId { get; set; }

    public string? UserEmail { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public string? DetailsJson { get; set; }
}