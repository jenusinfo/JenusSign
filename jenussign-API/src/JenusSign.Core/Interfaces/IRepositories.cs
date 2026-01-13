using System.Linq.Expressions;
using JenusSign.Core.Entities;

namespace JenusSign.Core.Interfaces;

/// <summary>
/// Generic repository interface
/// </summary>
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// User repository interface
/// </summary>
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByBusinessKeyAsync(string businessKey, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetAgentsByBrokerIdAsync(Guid brokerId, CancellationToken cancellationToken = default);
    Task<string> GenerateBusinessKeyAsync(JenusSign.Core.Enums.UserRole role, CancellationToken cancellationToken = default);
}

/// <summary>
/// Customer repository interface
/// </summary>
public interface ICustomerRepository : IRepository<Customer>
{
    Task<Customer?> GetByBusinessKeyAsync(string businessKey, CancellationToken cancellationToken = default);
    Task<Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IEnumerable<Customer>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Customer>> GetByBrokerIdAsync(Guid brokerId, CancellationToken cancellationToken = default);
    Task<string> GenerateBusinessKeyAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Proposal repository interface
/// </summary>
public interface IProposalRepository : IRepository<Proposal>
{
    Task<Proposal?> GetByBusinessKeyAsync(string businessKey, CancellationToken cancellationToken = default);
    Task<Proposal?> GetByReferenceNumberAsync(string referenceNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proposal>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proposal>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proposal>> GetByBrokerIdAsync(Guid brokerId, CancellationToken cancellationToken = default);
    Task<string> GenerateBusinessKeyAsync(CancellationToken cancellationToken = default);
    Task<string> GenerateReferenceNumberAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Signing session repository interface
/// </summary>
public interface ISigningSessionRepository : IRepository<SigningSession>
{
    Task<SigningSession?> GetByAccessTokenAsync(string accessToken, CancellationToken cancellationToken = default);
    Task<SigningSession?> GetByShortCodeAsync(string shortCode, CancellationToken cancellationToken = default);
    Task<IEnumerable<SigningSession>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SigningSession>> GetActiveSessionsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Unit of work interface
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    ICustomerRepository Customers { get; }
    IProposalRepository Proposals { get; }
    ISigningSessionRepository SigningSessions { get; }
    IRepository<Envelope> Envelopes { get; }
    IRepository<AuditEvent> AuditEvents { get; }
    IRepository<OtpCode> OtpCodes { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
