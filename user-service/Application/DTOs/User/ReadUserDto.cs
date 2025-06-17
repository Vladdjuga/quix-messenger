﻿using Application.Interfaces.DTOs;

namespace Application.DTOs.User;

public class ReadUserDto:IReadUserDto
{
    public required Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required DateTime DateOfBirth { get; set; }
}