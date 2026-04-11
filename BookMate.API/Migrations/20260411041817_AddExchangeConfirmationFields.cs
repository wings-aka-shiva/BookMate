using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookMate.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExchangeConfirmationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HandoverConfirmedByOwner",
                table: "Exchanges",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HandoverConfirmedByRequester",
                table: "Exchanges",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ReturnConfirmedByOwner",
                table: "Exchanges",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ReturnConfirmedByRequester",
                table: "Exchanges",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReturnLocation",
                table: "Exchanges",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HandoverConfirmedByOwner",
                table: "Exchanges");

            migrationBuilder.DropColumn(
                name: "HandoverConfirmedByRequester",
                table: "Exchanges");

            migrationBuilder.DropColumn(
                name: "ReturnConfirmedByOwner",
                table: "Exchanges");

            migrationBuilder.DropColumn(
                name: "ReturnConfirmedByRequester",
                table: "Exchanges");

            migrationBuilder.DropColumn(
                name: "ReturnLocation",
                table: "Exchanges");
        }
    }
}
