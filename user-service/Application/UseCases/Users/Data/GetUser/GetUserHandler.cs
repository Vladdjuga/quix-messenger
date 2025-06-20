using Application.Common;
using Application.DTOs.User;
using Application.Interfaces.DTOs;
using AutoMapper;
using Domain.Entities;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Users.Data.GetUser;

public class GetUserHandler:IRequestHandler<GetUserQuery, Result<IReadUserDto?>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetUserHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }
    
    public async Task<Result<IReadUserDto?>> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        UserEntity? user;
        if (!string.IsNullOrEmpty(request.Username))
            user = await _userRepository.GetByUserNameAsync(request.Username,cancellationToken);
        else
            user = await _userRepository.GetByIdAsync(request.UserGuid, cancellationToken);
        IReadUserDto? userDto=null;
        if (user == null) return Result<IReadUserDto?>.Failure("User not found");
        var isPublic = user.Id != request.UserGuid;
        userDto = isPublic ? _mapper.Map<ReadUserPublicDto>(user) : _mapper.Map<ReadUserDto>(user);
        return Result<IReadUserDto?>.Success(userDto);
    }
}