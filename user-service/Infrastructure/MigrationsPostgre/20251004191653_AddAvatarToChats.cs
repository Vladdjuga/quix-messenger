using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.MigrationsPostgre
{
    /// <inheritdoc />
    public partial class AddAvatarToChats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "chats",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "chats");
        }
    }
}
