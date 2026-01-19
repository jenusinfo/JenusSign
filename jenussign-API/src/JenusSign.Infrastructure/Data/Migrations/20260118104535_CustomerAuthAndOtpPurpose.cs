using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JenusSign.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class CustomerAuthAndOtpPurpose : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "SigningSessionId",
                table: "OtpCodes",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                table: "OtpCodes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Purpose",
                table: "OtpCodes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Token",
                table: "OtpCodes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Customers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiresAt",
                table: "Customers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OtpCodes_CustomerId",
                table: "OtpCodes",
                column: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_OtpCodes_Customers_CustomerId",
                table: "OtpCodes",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OtpCodes_Customers_CustomerId",
                table: "OtpCodes");

            migrationBuilder.DropIndex(
                name: "IX_OtpCodes_CustomerId",
                table: "OtpCodes");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "OtpCodes");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "OtpCodes");

            migrationBuilder.DropColumn(
                name: "Token",
                table: "OtpCodes");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiresAt",
                table: "Customers");

            migrationBuilder.AlterColumn<Guid>(
                name: "SigningSessionId",
                table: "OtpCodes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }
    }
}
