using System.Text;
using Application.Common;
using Carter;
using Infrastructure.DI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerGen;
using UI.Endpoints;
using UI.HttpClients;
using UI.Swagger;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);
var config=builder.Configuration;

//Kestrel configuration
builder.WebHost.ConfigureKestrel((context,options) =>
{
    options.Configure(context.Configuration.GetSection("Kestrel"));
});

// Add CORS
builder.Services.AddCors(options => 
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = config["JwtSettings:Issuer"],
            ValidAudience = config["JwtSettings:Audience"], // Not needed if not validating
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["JwtSettings:Key"]!)),
            ValidateIssuer = true,
            ValidateAudience = false, // Do not validate audience
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true
        };
    }
    );
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug() 
    .WriteTo.Console() 
    .WriteTo.File("Logs/log.txt", rollingInterval: RollingInterval.Day) 
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
builder.Services.ConfigureServices();

// Register HttpClient and ChatServiceClient for communicating with user-service
builder.Services.AddHttpClient<ChatServiceClient>((_, client) =>
{
    var url = config.GetConnectionString("UserService") 
              ?? throw new InvalidOperationException("UserService connection string not found");
    client.BaseAddress = new Uri(url);
});

builder.Services.AddCarter();
// gRPC has been removed; REST endpoints via Carter are used

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok("OK"))
    .WithName("HealthCheck")
    .WithTags("HealthCheck");
//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapCarter();
// gRPC service removed

app.Run();
