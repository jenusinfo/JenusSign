using JenusSign.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JenusSign.Infrastructure.Services;

/// <summary>
/// Local file system document storage service
/// In production, replace with Azure Blob Storage
/// </summary>
public class LocalDocumentStorageService : IDocumentStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalDocumentStorageService> _logger;

    public LocalDocumentStorageService(IConfiguration configuration, ILogger<LocalDocumentStorageService> logger)
    {
        _basePath = configuration["Storage:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "Documents");
        _logger = logger;
        
        // Ensure base directory exists
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> SaveDocumentAsync(byte[] content, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        var folderPath = Path.Combine(_basePath, folder);
        Directory.CreateDirectory(folderPath);

        var uniqueFileName = $"{Guid.NewGuid():N}_{fileName}";
        var filePath = Path.Combine(folderPath, uniqueFileName);

        await File.WriteAllBytesAsync(filePath, content, cancellationToken);
        
        _logger.LogInformation("Document saved: {FilePath}", filePath);
        return Path.Combine(folder, uniqueFileName);
    }

    public async Task<byte[]> GetDocumentAsync(string path, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, path);
        
        if (!File.Exists(fullPath))
            throw new FileNotFoundException("Document not found", path);

        return await File.ReadAllBytesAsync(fullPath, cancellationToken);
    }

    public Task<bool> DeleteDocumentAsync(string path, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, path);
        
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Document deleted: {FilePath}", fullPath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    public Task<string> GetTemporaryUrlAsync(string path, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        // For local storage, just return the relative path
        // In production with Azure Blob Storage, this would generate a SAS token URL
        return Task.FromResult($"/documents/{path}");
    }
}
