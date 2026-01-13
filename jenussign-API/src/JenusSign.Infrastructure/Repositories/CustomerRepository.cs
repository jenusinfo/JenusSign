using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using JenusSign.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JenusSign.Infrastructure.Repositories;

/// <summary>
/// Customer repository implementation
/// </summary>
public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(JenusSignDbContext context) : base(context)
    {
    }

    public async Task<Customer?> GetByBusinessKeyAsync(string businessKey, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Agent)
                .ThenInclude(a => a.Broker)
            .FirstOrDefaultAsync(c => c.BusinessKey == businessKey, cancellationToken);
    }

    public async Task<Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Agent)
            .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<IEnumerable<Customer>> GetByAgentIdAsync(Guid agentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Agent)
                .ThenInclude(a => a.Broker)
            .Where(c => c.AgentId == agentId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Customer>> GetByBrokerIdAsync(Guid brokerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Agent)
                .ThenInclude(a => a.Broker)
            .Where(c => c.Agent.BrokerId == brokerId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateBusinessKeyAsync(CancellationToken cancellationToken = default)
    {
        var count = await _dbSet
            .IgnoreQueryFilters()
            .CountAsync(cancellationToken);
        
        return $"CUST-{(count + 10001):D5}";
    }

    public override async Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Agent)
                .ThenInclude(a => a.Broker)
            .Include(c => c.Proposals)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }
}
