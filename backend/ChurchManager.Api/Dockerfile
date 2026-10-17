FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/ChurchManager.Api/ChurchManager.Api.csproj backend/ChurchManager.Api/
RUN dotnet restore backend/ChurchManager.Api/ChurchManager.Api.csproj
COPY backend/ChurchManager.Api/ backend/ChurchManager.Api/
RUN dotnet publish backend/ChurchManager.Api/ChurchManager.Api.csproj -c Release -o /app/publish /p:UseAppHost=false
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ChurchManager.Api.dll"]