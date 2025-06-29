using Application.Common;
using Application.DTOs.User;
using Application.Interfaces.Security;
using AutoMapper;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Users.Data.UpdateUser;

public class UpdateUserHandler:IRequestHandler<UpdateUserCommand,Result<ReadUserDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly IStringHasher _stringHasher;

    public UpdateUserHandler(IUserRepository userRepository, IMapper mapper, IStringHasher stringHasher)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _stringHasher = stringHasher;
    }
    public async Task<Result<ReadUserDto>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var userEntity = await _userRepository.GetByIdAsync(request.UserId,cancellationToken);
        if (userEntity == null)
            return Result<ReadUserDto>.Failure("User not found");
        _mapper.Map(request.Dto, userEntity);
        if(request.Dto.Password!=null)
            userEntity.PasswordHash=_stringHasher.Hash(request.Dto.Password);
        await _userRepository.UpdateAsync(userEntity,cancellationToken);
        return Result<ReadUserDto>.Success(_mapper.Map<ReadUserDto>(userEntity));
    }
}