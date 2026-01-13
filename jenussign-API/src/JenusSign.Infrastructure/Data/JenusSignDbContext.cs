using JenusSign.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace JenusSign.Infrastructure.Data;

/// <summary>
/// Entity Framework DbContext for JenusSign
/// </summary>
public class JenusSignDbContext : DbContext
{
    public JenusSignDbContext(DbContextOptions<JenusSignDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<Envelope> Envelopes => Set<Envelope>();
    public DbSet<SigningSession> SigningSessions => Set<SigningSession>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<OtpCode> OtpCodes => Set<OtpCode>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.BusinessKey).IsUnique();
            
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.BusinessKey).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Phone).HasMaxLength(20);
            
            // Self-referencing relationship: Agent -> Broker
            entity.HasOne(e => e.Broker)
                .WithMany(e => e.Agents)
                .HasForeignKey(e => e.BrokerId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Soft delete filter
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Customer configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.BusinessKey).IsUnique();
            entity.HasIndex(e => e.NavinsCustomerId);
            
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.BusinessKey).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.CompanyName).HasMaxLength(255);
            entity.Property(e => e.IdNumber).HasMaxLength(50);
            
            entity.HasOne(e => e.Agent)
                .WithMany(e => e.Customers)
                .HasForeignKey(e => e.AgentId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Proposal configuration
        modelBuilder.Entity<Proposal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BusinessKey).IsUnique();
            entity.HasIndex(e => e.ReferenceNumber).IsUnique();
            entity.HasIndex(e => e.NavinsProposalId);
            
            entity.Property(e => e.BusinessKey).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Currency).HasMaxLength(3).HasDefaultValue("EUR");
            entity.Property(e => e.Premium).HasPrecision(18, 2);
            entity.Property(e => e.SumInsured).HasPrecision(18, 2);
            entity.Property(e => e.Excess).HasPrecision(18, 2);
            
            entity.HasOne(e => e.Customer)
                .WithMany(e => e.Proposals)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Agent)
                .WithMany(e => e.Proposals)
                .HasForeignKey(e => e.AgentId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Envelope)
                .WithMany(e => e.Documents)
                .HasForeignKey(e => e.EnvelopeId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Envelope configuration
        modelBuilder.Entity<Envelope>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BusinessKey).IsUnique();
            
            entity.Property(e => e.BusinessKey).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Agent)
                .WithMany()
                .HasForeignKey(e => e.AgentId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // SigningSession configuration
        modelBuilder.Entity<SigningSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AccessToken).IsUnique();
            entity.HasIndex(e => e.ShortCode);
            entity.HasIndex(e => e.BusinessKey).IsUnique();
            
            entity.Property(e => e.AccessToken).IsRequired().HasMaxLength(64);
            entity.Property(e => e.ShortCode).HasMaxLength(10);
            entity.Property(e => e.BusinessKey).IsRequired().HasMaxLength(20);
            entity.Property(e => e.OtpCode).HasMaxLength(10);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.FaceMatchScore).HasPrecision(5, 2);
            
            entity.HasOne(e => e.Proposal)
                .WithMany(e => e.SigningSessions)
                .HasForeignKey(e => e.ProposalId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Envelope)
                .WithMany(e => e.SigningSessions)
                .HasForeignKey(e => e.EnvelopeId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasOne(e => e.Customer)
                .WithMany(e => e.SigningSessions)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // AuditEvent configuration
        modelBuilder.Entity<AuditEvent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SigningSessionId);
            entity.HasIndex(e => e.Timestamp);
            
            entity.Property(e => e.ActionDescription).IsRequired().HasMaxLength(500);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.UserAgent).HasMaxLength(1000);
            
            entity.HasOne(e => e.SigningSession)
                .WithMany(e => e.AuditEvents)
                .HasForeignKey(e => e.SigningSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OtpCode configuration
        modelBuilder.Entity<OtpCode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SigningSessionId);
            
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.Property(e => e.CodeHash).IsRequired().HasMaxLength(128);
            entity.Property(e => e.SentTo).IsRequired().HasMaxLength(255);
            entity.Property(e => e.MaskedSentTo).HasMaxLength(255);
            
            entity.HasOne(e => e.SigningSession)
                .WithMany()
                .HasForeignKey(e => e.SigningSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        
        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = DateTime.UtcNow;
                    break;
            }
        }
        
        return base.SaveChangesAsync(cancellationToken);
    }
}
