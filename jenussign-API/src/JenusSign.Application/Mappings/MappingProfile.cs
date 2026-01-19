using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;
using System.Linq;

namespace JenusSign.Application.Mappings;

/// <summary>
/// AutoMapper profile for entity to DTO mappings
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ConstructUsing(s => new UserDto(
                s.Id,
                s.BusinessKey,
                s.Email ?? string.Empty,
                s.FirstName ?? string.Empty,
                s.LastName ?? string.Empty,
                s.FullName,
                s.Phone,
                s.Role,
                s.IsActive,
                s.BrokerId,
                s.Broker != null ? s.Broker.FullName : null,
                s.Broker != null ? s.Broker.BusinessKey : null,
                s.CreatedAt,
                s.LastLoginAt));

        CreateMap<CreateUserRequest, User>()
            .ForMember(d => d.Id, opt => opt.Ignore())
            .ForMember(d => d.BusinessKey, opt => opt.Ignore())
            .ForMember(d => d.PasswordHash, opt => opt.Ignore())
            .ForMember(d => d.CreatedAt, opt => opt.Ignore())
            .ForMember(d => d.IsActive, opt => opt.MapFrom(_ => true));

        // Customer mappings
        CreateMap<Customer, CustomerDto>()
            .ConstructUsing(s => new CustomerDto(
                s.Id,
                s.BusinessKey,
                s.CustomerType,
                s.FirstName,
                s.LastName,
                s.DisplayName,
                s.CompanyName,
                s.RegistrationNumber,
                s.Email,
                s.Phone,
                s.Address,
                s.City,
                s.PostalCode,
                s.Country,
                s.IdNumber,
                s.AgentId,
                s.Agent != null ? s.Agent.FullName : string.Empty,
                s.Agent != null ? s.Agent.BusinessKey : string.Empty,
                s.Agent != null ? s.Agent.BrokerId : null,
                s.Agent != null && s.Agent.Broker != null ? s.Agent.Broker.FullName : null,
                s.Agent != null && s.Agent.Broker != null ? s.Agent.Broker.BusinessKey : null,
                s.NavinsCustomerId,
                s.CreatedAt
            ));

        CreateMap<CreateCustomerRequest, Customer>()
            .ForMember(d => d.Id, opt => opt.Ignore())
            .ForMember(d => d.BusinessKey, opt => opt.Ignore())
            .ForMember(d => d.AgentId, opt => opt.Ignore())
            .ForMember(d => d.CreatedAt, opt => opt.Ignore());

        // Proposal mappings
        CreateMap<Proposal, ProposalDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.DisplayName))
            .ForMember(d => d.CustomerBusinessKey, opt => opt.MapFrom(s => s.Customer.BusinessKey))
            .ForMember(d => d.AgentName, opt => opt.MapFrom(s => s.Agent.FullName))
            .ForMember(d => d.AgentBusinessKey, opt => opt.MapFrom(s => s.Agent.BusinessKey))
            .ForMember(d => d.BrokerId, opt => opt.MapFrom(s => s.Agent.BrokerId))
            .ForMember(d => d.BrokerName, opt => opt.MapFrom(s => s.Agent.Broker != null ? s.Agent.Broker.FullName : null))
            .ForMember(d => d.BrokerBusinessKey, opt => opt.MapFrom(s => s.Agent.Broker != null ? s.Agent.Broker.BusinessKey : null));

        CreateMap<CreateProposalRequest, Proposal>()
            .ForMember(d => d.Id, opt => opt.Ignore())
            .ForMember(d => d.BusinessKey, opt => opt.Ignore())
            .ForMember(d => d.ReferenceNumber, opt => opt.Ignore())
            .ForMember(d => d.AgentId, opt => opt.Ignore())
            .ForMember(d => d.Status, opt => opt.MapFrom(_ => Core.Enums.ProposalStatus.Draft))
            .ForMember(d => d.IssueDate, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(d => d.CreatedAt, opt => opt.Ignore());

        // SigningSession mappings
        CreateMap<SigningSession, SigningSessionDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.DisplayName))
            .ForMember(d => d.ProposalReference, opt => opt.MapFrom(s => s.Proposal != null ? s.Proposal.ReferenceNumber : null));

        // Document info mapping
        CreateMap<Proposal, DocumentInfoDto>()
            .ForMember(d => d.Pages, opt => opt.MapFrom(s => s.DocumentPages))
            .ForMember(d => d.DownloadUrl, opt => opt.Ignore());

        // Customer proposal mapping (for customer portal)
        CreateMap<Proposal, CustomerProposalDto>()
            .ForMember(d => d.AgentName, opt => opt.MapFrom(s => s.Agent.FullName))
            .ForMember(d => d.AgentPhone, opt => opt.MapFrom(s => s.Agent.Phone))
            .ForMember(d => d.AgentEmail, opt => opt.MapFrom(s => s.Agent.Email))
            .ForMember(d => d.SigningUrl, opt => opt.Ignore()); // Set in controller

        // Envelope mappings
        CreateMap<Envelope, EnvelopeDto>()
            .ConstructUsing((s, ctx) => new EnvelopeDto(
                s.Id,
                s.BusinessKey,
                s.Name,
                s.Description,
                s.Status,
                s.CustomerId,
                s.Customer != null ? s.Customer.DisplayName : string.Empty,
                s.Customer != null ? s.Customer.BusinessKey : string.Empty,
                s.AgentId,
                s.Agent != null ? s.Agent.FullName : string.Empty,
                s.Agent != null ? s.Agent.BusinessKey : string.Empty,
                s.Documents != null ? s.Documents.Count : 0,
                s.Documents != null ? ctx.Mapper.Map<IEnumerable<DocumentInfoDto>>(s.Documents) : Enumerable.Empty<DocumentInfoDto>(),
                s.ExpiresAt,
                s.CustomerMessage,
                s.CreatedAt
            ));

        CreateMap<CreateEnvelopeRequest, Envelope>()
            .ForMember(d => d.Id, opt => opt.Ignore())
            .ForMember(d => d.BusinessKey, opt => opt.Ignore())
            .ForMember(d => d.AgentId, opt => opt.Ignore())
            .ForMember(d => d.Status, opt => opt.MapFrom(_ => Core.Enums.ProposalStatus.Draft))
            .ForMember(d => d.CreatedAt, opt => opt.Ignore());

        // SystemLog mappings
        CreateMap<SystemLog, SystemLogDto>()
            .ForMember(d => d.Metadata, opt => opt.MapFrom<MetadataResolver>());
    }
}

public class MetadataResolver : IValueResolver<SystemLog, SystemLogDto, Dictionary<string, object>?>
{
    public Dictionary<string, object>? Resolve(SystemLog source, SystemLogDto destination, Dictionary<string, object>? destMember, ResolutionContext context)
    {
        if (string.IsNullOrEmpty(source.Metadata))
            return null;
        
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(source.Metadata);
        }
        catch
        {
            return null;
        }
    }
}
