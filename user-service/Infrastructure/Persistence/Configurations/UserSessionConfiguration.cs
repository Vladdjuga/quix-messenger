using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class UserSessionConfiguration:IEntityTypeConfiguration<UserSessionEntity>
{
    public void Configure(EntityTypeBuilder<UserSessionEntity> builder)
    {
        builder.ToTable("user_sessions");
        builder.HasKey(us => us.Id);
        builder.Property(us => us.Id)
            .ValueGeneratedOnAdd()
            .HasDefaultValueSql("gen_random_uuid()");
        builder.HasOne(us => us.User)
            .WithMany(u => u.Sessions)
            .HasForeignKey(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();
        builder.Property(us => us.HashedToken)
            .IsRequired()
            .HasMaxLength(255);
        builder.Property(us => us.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
        builder.Property(us => us.ExpiresAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");
    }
}