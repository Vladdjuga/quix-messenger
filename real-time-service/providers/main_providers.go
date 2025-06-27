package providers

import (
	"log"
	"realTimeService/clients"
	"realTimeService/configuration"
	"realTimeService/handlers/wsrouter"
	"realTimeService/hubs"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// DependencyInjectionContainer DI Container
type DependencyInjectionContainer struct {
	Hub                *hubs.MainHub
	// GrpcClients
	GrpcMessagesClient *clients.MessageServiceClient
	GrpcChatClient     *clients.ChatServiceClient

	// gRPC connections
	// These are used to close the connections when the service stops
	msgConn  *grpc.ClientConn
	chatConn *grpc.ClientConn

	// Router for WebSocket handling
	Router *wsrouter.Router
}

// NewDependencyInjectionContainer Create a new DI container
func NewDependencyInjectionContainer() *DependencyInjectionContainer {
	return &DependencyInjectionContainer{}
}

// InitializeProviders Initialize the singleton variables
func (d *DependencyInjectionContainer) InitializeProviders(cfg *configuration.Config) {
	d.Hub = hubs.NewMainHub()
	msgConn, err := connectToGRPC(cfg.GrpcMessageClientAddress)
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
		return
	}
	d.GrpcMessagesClient = clients.NewMessageServiceClient(msgConn)
	chatConn, err := connectToGRPC(cfg.GrpcChatClientAddress)
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
		return
	}
	d.GrpcChatClient = clients.NewChatServiceClient(chatConn)
	d.msgConn = msgConn
	d.chatConn = chatConn
	d.Router = wsrouter.NewRouter()
	log.Println("DependencyInjectionContainer initialized with gRPC clients and main hub")
}
func (d *DependencyInjectionContainer) GetHub() *hubs.MainHub {
	return d.Hub
}

func (d *DependencyInjectionContainer) GetMessageClient() *clients.MessageServiceClient {
	return d.GrpcMessagesClient
}

func (d *DependencyInjectionContainer) GetChatClient() *clients.ChatServiceClient {
	return d.GrpcChatClient
}
func (d *DependencyInjectionContainer) GetRouter() *wsrouter.Router {
	return d.Router
}
func (d *DependencyInjectionContainer) Close() error {
	var err1, err2 error
	if d.msgConn != nil {
		log.Println("Closing message connection")
		err1 = d.msgConn.Close()
	}
	if d.chatConn != nil {
		log.Println("Closing chat connection")
		err2 = d.chatConn.Close()
	}
	if err1 != nil {
		return err1
	}
	return err2
}
func connectToGRPC(addr string) (*grpc.ClientConn, error) {
	log.Println("Connecting to gRPC server", addr)
	conn, err := grpc.NewClient(addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		log.Fatalf("gRPC connection failed: %v", err)
		return nil, err
	}
	log.Println("gRPC connection established with ", addr)
	return conn, nil
}
