namespace JenusSign.Core.Entities;

/// <summary>
/// Base entity with common properties for all entities
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}

/// <summary>
/// Base entity with business key support
/// </summary>
public abstract class BaseEntityWithBusinessKey : BaseEntity
{
    /// <summary>
    /// Human-readable business key (e.g., BRK-001, AGT-001, CUST-12345)
    /// </summary>
    public string BusinessKey { get; set; } = string.Empty;
}
