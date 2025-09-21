namespace Application.DTOs;

public class FileDto
{
    public required string Name { get; set; }
    public required string ContentType { get; set; }
    public required byte[] Content { get; set; }
}