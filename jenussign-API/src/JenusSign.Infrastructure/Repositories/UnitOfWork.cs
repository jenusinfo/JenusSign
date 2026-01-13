using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using JenusSign.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace JenusSign.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementation
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly JenusSignDbContext _context;
    private IDbContextTransaction? _transaction;

    private IUserRepository? _users;
    private ICustomerRepository? _customers;
    private IProposalRepository? _proposals;
    private ISigningSessionRepository? _signingSessions;
    private IRepository<Envelope>? _envelopes;
    private IRepository<AuditEvent>? _auditEvents;
    private IRepository<OtpCode>? _otpCodes;

    public UnitOfWork(JenusSignDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public ICustomerRepository Customers => _customers ??= new CustomerRepository(_context);
    public IProposalRepository Proposals => _proposals ??= new ProposalRepository(_context);
    public ISigningSessionRepository SigningSessions => _signingSessions ??= new SigningSessionRepository(_context);
    public IRepository<Envelope> Envelopes => _envelopes ??= new Repository<Envelope>(_context);
    public IRepository<AuditEvent> AuditEvents => _auditEvents ??= new Repository<AuditEvent>(_context);
    public IRepository<OtpCode> OtpCodes => _otpCodes ??= new Repository<OtpCode>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
