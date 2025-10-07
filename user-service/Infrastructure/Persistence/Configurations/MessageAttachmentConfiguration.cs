using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class MessageAttachmentConfiguration : IEntityTypeConfiguration<MessageAttachmentEntity>
{
    public void Configure(EntityTypeBuilder<MessageAttachmentEntity> builder)
    {
        builder.ToTable("message_attachments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(a => a.FileUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.FileSize)
            .IsRequired();

        builder.Property(a => a.MimeType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.UploadedAt)
            .ValueGeneratedOnAdd()
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .IsRequired();

        builder.Property(a => a.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.DeletedAt)
            .HasColumnType("timestamp with time zone");

        // Relationship with Message
        builder.HasOne(a => a.Message)
            .WithMany(m => m.Attachments)
            .HasForeignKey(a => a.MessageId)
            .OnDelete(DeleteBehavior.Cascade); // Delete attachments when message is deleted

        // Indexes
        builder.HasIndex(a => a.MessageId);

        builder.HasIndex(a => a.UploadedAt);

        builder.HasIndex(a => a.IsDeleted);

        builder.HasIndex(a => a.MimeType);
    }
}
