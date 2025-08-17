import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {promisify} from 'util';
import type {UserChatExistsRequest, UserChatExistsResponse} from '../types/grpcTypes.js';

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

        //console.log('Package definition loaded:', Object.keys(packageDefinition));

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

        //console.log('Proto descriptor keys:', Object.keys(protoDescriptor));
        //console.log('Chat package:', protoDescriptor.chat);

        if (!protoDescriptor.chat) {
            //console.error('Available packages:', Object.keys(protoDescriptor));
            throw new Error('Package "chat" not found in proto file. Available packages: ' + Object.keys(protoDescriptor).join(', '));
        }

        const ChatService = (protoDescriptor.chat as any).ChatService;

        if (!ChatService) {
            //console.error('Available services in chat package:', Object.keys(protoDescriptor.chat));
            throw new Error('Service "ChatService" not found in chat package. Available services: ' + Object.keys(protoDescriptor.chat).join(', '));
        }

        this.client = new ChatService(
            serverAddress,
            grpc.credentials.createInsecure()
        );

        console.log('ChatService client created successfully');

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