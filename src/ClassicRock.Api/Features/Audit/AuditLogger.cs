using System.Security.Claims;
using System.Text.Json;
using ClassicRock.Api.Data;
using ClassicRock.Api.Entities;

namespace ClassicRock.Api.Features.Audit;

public sealed class AuditLogger
{
    private readonly AppDbContext _db;

    public AuditLogger(AppDbContext db)
    {
        _db = db;
    }

    public void Add(
        ClaimsPrincipal user,
        string action,
        string entityType,
        string entityId,
        object? details = null
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        var userEmail = user.FindFirstValue(ClaimTypes.Email) ?? user.FindFirstValue("email");

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            UserId = userId,
            UserEmail = userEmail,
            CreatedAtUtc = DateTime.UtcNow,
            DetailsJson = details is null
                ? null
                : JsonSerializer.Serialize(details)
        };

        // NOTE:This does not call SaveChangesAsync because we want the mutation actions and audit log to save in the same db transaction.
        _db.AuditLogs.Add(auditLog);
    }
}