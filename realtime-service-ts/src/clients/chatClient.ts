import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {promisify} from 'util';
import type {UserChatExistsRequest, UserChatExistsResponse} from '../types/grpcTypes.js';
import logger from "../config/logger.js";

const GRPC_SERVER_MESSENGER = process.env.GRPC_SERVER_MESSENGER || 'localhost:50051';
const PROTO_PATH = path.resolve(process.cwd(), 'protos/chat.proto');


export class ChatClient {
    private readonly client: any;
    private readonly userChatExistsAsync: (request: UserChatExistsRequest) => Promise<UserChatExistsResponse>;
    constructor(serverAddress: string = GRPC_SERVER_MESSENGER) {
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

        if (!protoDescriptor.chat) {
            throw new Error('Package "chat" not found in proto file. Available packages: ' + Object.keys(protoDescriptor).join(', '));
        }

        const ChatService = (protoDescriptor.chat as any).ChatService;

        if (!ChatService) {
            throw new Error('Service "ChatService" not found in chat package. Available services: ' + Object.keys(protoDescriptor.chat).join(', '));
        }

        this.client = new ChatService(
            serverAddress,
            grpc.credentials.createInsecure()
        );

        console.log('ChatService client created successfully');

        // ping the server to ensure connection
        this.client.waitForReady(Date.now() + 5000, (error: Error | null) => {
            if (error) {
                logger.error('ChatService client connection error:', error);
                throw new Error(`ChatService client connection failed: ${error.message}`);
            } else {
                logger.info('ChatService client is ready');
            }
        });

        this.userChatExistsAsync = promisify(this.client.UserChatExists.bind(this.client));
    }

    async userChatExists(request: UserChatExistsRequest): Promise<UserChatExistsResponse> {
        try {
            return await this.userChatExistsAsync(request);
        } catch (error) {
            console.error('ChatClient.userChatExists error:', error);
            throw error;
        }
    }
    close(): void {
        this.client.close();
    }
}