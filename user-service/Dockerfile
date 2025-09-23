FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 6001

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY user-service.sln ./
COPY UI/UI.csproj ./UI/
COPY Infrastructure/Infrastructure.csproj ./Infrastructure/

COPY UI/wwwroot /app/wwwroot

RUN dotnet restore "./UI/UI.csproj"

COPY .. .


WORKDIR "/src/UI"
RUN dotnet build "UI.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
RUN dotnet publish "UI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "UI.dll"]
