import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {promisify} from 'util';
import type {
    SendMessageRequest,
    SendMessageResponse
} from '../types/grpcTypes.js';
import logger from "../config/logger.js";

// Prefer GRPC_SERVER_MESSENGER, fallback to legacy GRPC_SERVER_CHAT, then default to message-service:7000
const GRPC_SERVER_CHAT = process.env.GRPC_SERVER_MESSENGER || process.env.GRPC_SERVER_CHAT || 'message-service:7000';
const PROTO_PATH = path.resolve(process.cwd(), 'protos/messenger.proto');

export class MessengerClient {
    private readonly client: any;
    private readonly sendMessageAsync: (request: any) => Promise<SendMessageResponse>;

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
    }

    async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
        try {
            const protoRequest = {
                sentAt: {
                    seconds: Math.floor(request.sentAt.getTime() / 1000),
                    nanos: (request.sentAt.getTime() % 1000) * 1000000,
                },
                text: request.text,
                chatId: request.chatId,
            };

            return await this.sendMessageAsync(protoRequest);
        } catch (error) {
            console.error('MessengerClient.sendMessage error:', error);
            throw error;
        }
    }

    close(): void {
        this.client.close();
    }
}