This folder marks that the gRPC project was removed from user-service.

Summary:
- REST-only now. Kestrel listens on HTTP/1 at 7001.
- gRPC endpoints and project references were removed.

To restore (if needed):
1) Re-add `Grpc/Grpc.csproj` to the solution and as a ProjectReference in `UI/UI.csproj`.
2) Re-add `builder.Services.AddGrpc()` and `app.MapGrpcService<UI.gRPCClients.ChatService>();` in `UI/Program.cs`.
3) Reinstate Kestrel gRPC endpoint in `UI/appsettings.json`.
4) Re-expose/compose the gRPC port (7000).