﻿using Application.Common;
using Application.DTOs.User;
using MediatR;

namespace Application.UseCases.Users.Data.UpdateUser;

public record UpdateUserCommand(UpdateUserDto Dto, Guid UserId):IRequest<Result<ReadUserDto>>;