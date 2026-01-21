FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 6001

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution and all project files for better layer caching
COPY user-service.sln ./
COPY UI/UI.csproj ./UI/
COPY Infrastructure/Infrastructure.csproj ./Infrastructure/
COPY Application/Application.csproj ./Application/
COPY Domain/Domain.csproj ./Domain/

# Restore dependencies
RUN dotnet restore "UI/UI.csproj"

# Copy the rest of the source code
COPY . .

# Build the project
WORKDIR "/src/UI"
RUN dotnet build "UI.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "UI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:6001

ENTRYPOINT ["dotnet", "UI.dll"]
