﻿using Application.Common;
using MediatR;

namespace Application.UseCases.Users.Auth.Register;

public record RegisterUserCommand(string Username, string Email,
    string Password,string FirstName,
    string LastName ,DateTime DateOfBirth):IRequest<Result<Guid>>;