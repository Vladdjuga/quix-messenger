import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {promisify} from 'util';
import type {
    GetMessageRequest,
    GetMessageResponse,
    MessageResponse,
    SendMessageRequest,
    SendMessageResponse
} from '../types/grpcTypes.js';
import logger from "../config/logger.js";

const GRPC_SERVER_CHAT = process.env.GRPC_SERVER_CHAT || 'localhost:50052';
const PROTO_PATH = path.resolve(process.cwd(), 'protos/messenger.proto');

export class MessengerClient {
    private readonly client: any;
    private readonly sendMessageAsync: (request: any) => Promise<SendMessageResponse>;
    private readonly getMessageAsync: (request: GetMessageRequest) => Promise<GetMessageResponse>;

    constructor(serverAddress: string = GRPC_SERVER_CHAT) {
        const packageDefinition = protoLoader.loadSync(
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            }
        );

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

        if (!protoDescriptor.messenger) {
            throw new Error('Package "messenger" not found in proto file. Available packages: ' + Object.keys(protoDescriptor).join(', '));
        }

        const Messenger = (protoDescriptor.messenger as any).Messenger;

        if (!Messenger) {
            throw new Error('Service "Messenger" not found in messenger package. Available services: ' + Object.keys(protoDescriptor.messenger).join(', '));
        }

        this.client = new Messenger(
            serverAddress,
            grpc.credentials.createInsecure()
        );

        console.log('Messenger client created successfully');

        // ping the server to ensure connection
        this.client.waitForReady(Date.now() + 5000, (error: Error | null) => {
            if (error) {
                logger.error('MessageService client connection error:', error);
                throw new Error(`MessageService client connection failed: ${error.message}`);
            } else {
                logger.info('MessageService client is ready');
            }
        });

        this.sendMessageAsync = promisify(this.client.SendMessage.bind(this.client));
        this.getMessageAsync = promisify(this.client.GetMessage.bind(this.client));
    }

    async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
        try {
            const protoRequest = {
                sentAt: {
                    seconds: Math.floor(request.sentAt.getTime() / 1000),
                    nanos: (request.sentAt.getTime() % 1000) * 1000000,
                },
                text: request.text,
                userId: request.userId,
                chatId: request.chatId,
            };

            return await this.sendMessageAsync(protoRequest);
        } catch (error) {
            console.error('MessengerClient.sendMessage error:', error);
            throw error;
        }
    }

    // possibly won't be used
    async getMessage(request: GetMessageRequest): Promise<GetMessageResponse> {
        try {
            const response = await this.getMessageAsync(request);

            const messages: MessageResponse[] = response.messages.map((msg: any) => ({
                id: msg.id,
                sentAt: new Date(msg.sentAt.seconds * 1000 + msg.sentAt.nanos / 1000000),
                receivedAt: new Date(msg.receivedAt.seconds * 1000 + msg.receivedAt.nanos / 1000000),
                text: msg.text,
                userId: msg.userId,
                chatId: msg.chatId,
                status: msg.status,
            }));

            return { messages };
        } catch (error) {
            console.error('MessengerClient.getMessage error:', error);
            throw error;
        }
    }



    close(): void {
        this.client.close();
    }
}