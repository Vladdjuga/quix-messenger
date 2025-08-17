import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {promisify} from 'util';
import type {UserChatExistsRequest, UserChatExistsResponse} from '../types/grpcTypes.js';

const GRPC_SERVER_MESSENGER = process.env.GRPC_SERVER_MESSENGER || 'localhost:50051';

export class ChatClient {
    private readonly client: any;
    private readonly userChatExistsAsync: (request: UserChatExistsRequest) => Promise<UserChatExistsResponse>;
    constructor(serverAddress: string = GRPC_SERVER_MESSENGER) {
        const packageDefinition = protoLoader.loadSync(
            path.join(__dirname, '../../protos/chat.proto'),
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            }
        );

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        const ChatService = (protoDescriptor.chat as any).ChatService;

        this.client = new ChatService(
            serverAddress,
            grpc.credentials.createInsecure()
        );

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