using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ChatConfiguration: IEntityTypeConfiguration<ChatEntity>
{
    public void Configure(EntityTypeBuilder<ChatEntity> builder)
    {
        builder.ToTable("chats");
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()");
        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200)
            .HasConversion(
                v => v.Length > 200 ? v.Substring(0, 197) + "..." : v,
                v => v
            );
        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(x => x.ChatType)
            .IsRequired()
            .HasConversion<string>();
    }
}