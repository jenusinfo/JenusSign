using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using JenusSign.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JenusSign.Infrastructure.Repositories;

/// <summary>
/// SigningSession repository implementation
/// </summary>
public class SigningSessionRepository : Repository<SigningSession>, ISigningSessionRepository
{
    public SigningSessionRepository(JenusSignDbContext context) : base(context)
    {
    }

    public async Task<SigningSession?> GetByAccessTokenAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Proposal)
                .ThenInclude(p => p!.Agent)
            .Include(s => s.Envelope)
                .ThenInclude(e => e!.Documents)
            .Include(s => s.AuditEvents.OrderBy(a => a.Timestamp))
            .FirstOrDefaultAsync(s => s.AccessToken == accessToken, cancellationToken);
    }

    public async Task<SigningSession?> GetByShortCodeAsync(string shortCode, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Proposal)
            .FirstOrDefaultAsync(s => s.ShortCode == shortCode, cancellationToken);
    }

    public async Task<IEnumerable<SigningSession>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Proposal)
            .Include(s => s.Envelope)
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SigningSession>> GetActiveSessionsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Proposal)
            .Where(s => s.Status != ProposalStatus.Signed && 
                       s.Status != ProposalStatus.Rejected && 
                       s.Status != ProposalStatus.Expired &&
                       s.Status != ProposalStatus.Cancelled)
            .Where(s => !s.ExpiresAt.HasValue || s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public override async Task<SigningSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Proposal)
                .ThenInclude(p => p!.Agent)
                    .ThenInclude(a => a.Broker)
            .Include(s => s.Envelope)
                .ThenInclude(e => e!.Documents)
            .Include(s => s.AuditEvents.OrderBy(a => a.Timestamp))
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }
}
