using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.MigrationsPostgre
{
    /// <inheritdoc />
    public partial class FixUserChatConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChatRole",
                table: "user_chat");

            migrationBuilder.AddColumn<int>(
                name: "ChatRole",
                table: "user_chat",
                type: "integer",
                nullable: false,
                defaultValue: 0); 
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChatRole",
                table: "user_chat");

            migrationBuilder.AddColumn<string>(
                name: "ChatRole",
                table: "user_chat",
                type: "text",
                nullable: false,
                defaultValue: "User");
        }
    }
}
