using JenusSign.Core.Entities;
using JenusSign.Core.Enums;
using JenusSign.Core.Interfaces;
using JenusSign.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JenusSign.Infrastructure.Repositories;

/// <summary>
/// User repository implementation
/// </summary>
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(JenusSignDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Broker)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByBusinessKeyAsync(string businessKey, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Broker)
            .FirstOrDefaultAsync(u => u.BusinessKey == businessKey, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetAgentsByBrokerIdAsync(Guid brokerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(u => u.BrokerId == brokerId && u.Role == UserRole.Agent)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateBusinessKeyAsync(UserRole role, CancellationToken cancellationToken = default)
    {
        var prefix = User.GetBusinessKeyPrefix(role);
        var count = await _dbSet
            .IgnoreQueryFilters()
            .CountAsync(u => u.BusinessKey.StartsWith(prefix), cancellationToken);
        
        return $"{prefix}-{(count + 1):D3}";
    }

    public override async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(u => u.Broker)
            .Include(u => u.Agents)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }
}
