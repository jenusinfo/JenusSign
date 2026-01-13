using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using JenusSign.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JenusSign.Infrastructure.Repositories;

/// <summary>
/// Proposal repository implementation
/// </summary>
public class ProposalRepository : Repository<Proposal>, IProposalRepository
{
    public ProposalRepository(JenusSignDbContext context) : base(context)
    {
    }

    public async Task<Proposal?> GetByBusinessKeyAsync(string businessKey, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Agent)
                .ThenInclude(a => a.Broker)
            .FirstOrDefaultAsync(p => p.BusinessKey == businessKey, cancellationToken);
    }

    public async Task<Proposal?> GetByReferenceNumberAsync(string referenceNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Agent)
            .FirstOrDefaultAsync(p => p.ReferenceNumber == referenceNumber, cancellationToken);
    }

    public async Task<IEnumerable<Proposal>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Agent)
                .ThenInclude(a => a.Broker)
            .Where(p => p.CustomerId == customerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proposal>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Agent)
                .ThenInclude(a => a.Broker)
            .Where(p => p.AgentId == agentId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Proposal>> GetByBrokerIdAsync(Guid brokerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Agent)
                .ThenInclude(a => a.Broker)
            .Where(p => p.Agent.BrokerId == brokerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateBusinessKeyAsync(CancellationToken cancellationToken = default)
    {
        var count = await _dbSet
            .IgnoreQueryFilters()
            .CountAsync(cancellationToken);
        
        return $"PROP-{(count + 50001):D5}";
    }

    public async Task<string> GenerateReferenceNumberAsync(CancellationToken cancellationToken = default)
    {
        var year = DateTime.UtcNow.Year;
        var countThisYear = await _dbSet
            .IgnoreQueryFilters()
            .CountAsync(p => p.ReferenceNumber.StartsWith($"PR-{year}"), cancellationToken);
        
        return Proposal.GenerateReferenceNumber(year, countThisYear + 1);
    }

    public override async Task<Proposal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Customer)
            .Include(p => p.Agent)
                .ThenInclude(a => a.Broker)
            .Include(p => p.SigningSessions)
            .Include(p => p.Envelope)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }
}
