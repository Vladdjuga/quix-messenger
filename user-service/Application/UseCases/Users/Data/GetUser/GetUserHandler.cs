using Application.Common;
using Application.DTOs.User;
using AutoMapper;
using Domain.Entities;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Users.Data.GetUser;

public class GetUserHandler:IRequestHandler<GetUserQuery, Result<ReadUserDto?>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetUserHandler(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }
    
    public async Task<Result<ReadUserDto?>> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        UserEntity? user;
        if (!string.IsNullOrEmpty(request.Username))
            user = await _userRepository.GetByUserNameAsync(request.Username,cancellationToken);
        else
            user = await _userRepository.GetByIdAsync(request.UserGuid, cancellationToken);
        
        if (user == null) return Result<ReadUserDto?>.Failure("User not found");
        
        var userDto = _mapper.Map<ReadUserDto>(user);
        return Result<ReadUserDto?>.Success(userDto);
    }
}