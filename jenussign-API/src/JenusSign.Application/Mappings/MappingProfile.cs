using AutoMapper;
using JenusSign.Application.DTOs;
using JenusSign.Core.Entities;

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
            .ForMember(d => d.FullName, opt => opt.MapFrom(s => s.FullName))
            .ForMember(d => d.BrokerName, opt => opt.MapFrom(s => s.Broker != null ? s.Broker.FullName : null))
            .ForMember(d => d.BrokerBusinessKey, opt => opt.MapFrom(s => s.Broker != null ? s.Broker.BusinessKey : null));

        CreateMap<CreateUserRequest, User>()
            .ForMember(d => d.Id, opt => opt.Ignore())
            .ForMember(d => d.BusinessKey, opt => opt.Ignore())
            .ForMember(d => d.PasswordHash, opt => opt.Ignore())
            .ForMember(d => d.CreatedAt, opt => opt.Ignore())
            .ForMember(d => d.IsActive, opt => opt.MapFrom(_ => true));

        // Customer mappings
        CreateMap<Customer, CustomerDto>()
            .ForMember(d => d.DisplayName, opt => opt.MapFrom(s => s.DisplayName))
            .ForMember(d => d.AgentName, opt => opt.MapFrom(s => s.Agent.FullName))
            .ForMember(d => d.AgentBusinessKey, opt => opt.MapFrom(s => s.Agent.BusinessKey))
            .ForMember(d => d.BrokerId, opt => opt.MapFrom(s => s.Agent.BrokerId))
            .ForMember(d => d.BrokerName, opt => opt.MapFrom(s => s.Agent.Broker != null ? s.Agent.Broker.FullName : null))
            .ForMember(d => d.BrokerBusinessKey, opt => opt.MapFrom(s => s.Agent.Broker != null ? s.Agent.Broker.BusinessKey : null));

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
    }
}
