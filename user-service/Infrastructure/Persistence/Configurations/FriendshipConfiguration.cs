using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class FriendshipConfiguration : IEntityTypeConfiguration<FriendshipEntity>
{
    public void Configure(EntityTypeBuilder<FriendshipEntity> builder)
    {
        builder.ToTable("friendships");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd()
            .HasDefaultValueSql("gen_random_uuid()");
        builder.HasOne(x => x.User)
            .WithMany(x => x.Friendships)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();
        builder.HasOne(x => x.Friend)
            .WithMany()
            .HasForeignKey(x => x.FriendId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();
        builder.HasOne(x => x.PrivateChat)
            .WithMany()
            .HasForeignKey(x => x.PrivateChatId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);
        builder.Property(x => x.CreatedAt)
            .ValueGeneratedOnAdd()
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();
        builder.HasIndex(x => new { x.UserId, x.FriendId }).IsUnique();
    }
}