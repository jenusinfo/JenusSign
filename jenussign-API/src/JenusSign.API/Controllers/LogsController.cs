using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using JenusSign.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using System.Text;

namespace JenusSign.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin,Employee")]
public class LogsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<LogsController> _logger;

    public LogsController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<LogsController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get system logs with filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SystemLogListResponse>> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? eventType = null,
        [FromQuery] string? severity = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var searchLower = (search ?? string.Empty).ToLowerInvariant();

        var predicate = (Expression<Func<SystemLog, bool>>)(log =>
            (string.IsNullOrWhiteSpace(eventType) || eventType == "ALL" || log.EventType == eventType) &&
            (string.IsNullOrWhiteSpace(severity) || severity == "ALL" || log.Severity == severity) &&
            (!fromDate.HasValue || log.Timestamp >= fromDate.Value) &&
            (!toDate.HasValue || log.Timestamp <= toDate.Value.AddDays(1)) &&
            (string.IsNullOrWhiteSpace(searchLower) ||
                (log.Message ?? string.Empty).ToLower().Contains(searchLower) ||
                (log.EnvelopeRef ?? string.Empty).ToLower().Contains(searchLower) ||
                (log.CustomerName ?? string.Empty).ToLower().Contains(searchLower) ||
                (log.UserName ?? string.Empty).ToLower().Contains(searchLower)));

        var totalCount = await _unitOfWork.SystemLogs.CountAsync(predicate);

        var logs = await _unitOfWork.SystemLogs.GetAllAsync(
            predicate: predicate,
            orderBy: q => q.OrderByDescending(l => l.Timestamp),
            page: page,
            pageSize: pageSize);

        return Ok(new SystemLogListResponse(
            Logs: _mapper.Map<IEnumerable<SystemLogDto>>(logs),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        ));
    }

    /// <summary>
    /// Get a single log entry by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SystemLogDto>> GetLog(Guid id)
    {
        var log = await _unitOfWork.SystemLogs.GetByIdAsync(id);
        if (log == null)
        {
            return NotFound(new { message = "Log entry not found" });
        }

        return Ok(_mapper.Map<SystemLogDto>(log));
    }

    /// <summary>
    /// Get log statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<SystemLogStatsResponse>> GetStats(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        Expression<Func<SystemLog, bool>> datePredicate = log =>
            (!fromDate.HasValue || log.Timestamp >= fromDate.Value) &&
            (!toDate.HasValue || log.Timestamp <= toDate.Value.AddDays(1));

        var allLogs = await _unitOfWork.SystemLogs.FindAsync(datePredicate);
        var logsList = allLogs.ToList();

        return Ok(new SystemLogStatsResponse(
            TotalCount: logsList.Count,
            InfoCount: logsList.Count(l => l.Severity == "INFO"),
            WarningCount: logsList.Count(l => l.Severity == "WARNING"),
            ErrorCount: logsList.Count(l => l.Severity == "ERROR"),
            FromDate: fromDate,
            ToDate: toDate
        ));
    }

    /// <summary>
    /// Export logs as CSV
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportLogs(
        [FromQuery] string format = "csv",
        [FromQuery] string? search = null,
        [FromQuery] string? eventType = null,
        [FromQuery] string? severity = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var searchLower = (search ?? string.Empty).ToLowerInvariant();

        var predicate = (Expression<Func<SystemLog, bool>>)(log =>
            (string.IsNullOrWhiteSpace(eventType) || eventType == "ALL" || log.EventType == eventType) &&
            (string.IsNullOrWhiteSpace(severity) || severity == "ALL" || log.Severity == severity) &&
            (!fromDate.HasValue || log.Timestamp >= fromDate.Value) &&
            (!toDate.HasValue || log.Timestamp <= toDate.Value.AddDays(1)) &&
            (string.IsNullOrWhiteSpace(searchLower) ||
                (log.Message ?? string.Empty).ToLower().Contains(searchLower) ||
                (log.EnvelopeRef ?? string.Empty).ToLower().Contains(searchLower) ||
                (log.CustomerName ?? string.Empty).ToLower().Contains(searchLower) ||
                (log.UserName ?? string.Empty).ToLower().Contains(searchLower)));

        var logs = await _unitOfWork.SystemLogs.GetAllAsync(
            predicate: predicate,
            orderBy: q => q.OrderByDescending(l => l.Timestamp));

        if (format.ToLower() == "json")
        {
            var jsonLogs = _mapper.Map<IEnumerable<SystemLogDto>>(logs);
            return Ok(jsonLogs);
        }

        // CSV export
        var csv = new StringBuilder();
        csv.AppendLine("Timestamp,EventType,Severity,Message,EnvelopeRef,CustomerName,UserName,IpAddress");

        foreach (var log in logs)
        {
            csv.AppendLine($"\"{log.Timestamp:yyyy-MM-dd HH:mm:ss}\",\"{log.EventType}\",\"{log.Severity}\",\"{EscapeCsv(log.Message)}\",\"{log.EnvelopeRef ?? ""}\",\"{EscapeCsv(log.CustomerName)}\",\"{EscapeCsv(log.UserName)}\",\"{log.IpAddress ?? ""}\"");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"system-logs-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        return value.Replace("\"", "\"\"");
    }
}
