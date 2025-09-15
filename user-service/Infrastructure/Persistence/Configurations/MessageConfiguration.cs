using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<MessageEntity>
{
    public void Configure(EntityTypeBuilder<MessageEntity> builder)
    {
        builder.ToTable("messages");

        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(x => x.Text)
            .IsRequired();

        builder.Property(x => x.SentAt)
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(x => x.ReceivedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.HasOne(x => x.Chat)
            .WithMany()
            .HasForeignKey(x => x.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ChatId, x.SentAt }).HasDatabaseName("ix_messages_chatid_sentat");
        builder.HasIndex(x => new { x.UserId, x.SentAt }).HasDatabaseName("ix_messages_userid_sentat");
    }
}
