using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.MigrationsPostgre
{
    /// <inheritdoc />
    public partial class FixChatMessagesNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_messages_chats_ChatEntityId",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_messages_ChatEntityId",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "ChatEntityId",
                table: "messages");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ChatEntityId",
                table: "messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_messages_ChatEntityId",
                table: "messages",
                column: "ChatEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_messages_chats_ChatEntityId",
                table: "messages",
                column: "ChatEntityId",
                principalTable: "chats",
                principalColumn: "Id");
        }
    }
}
