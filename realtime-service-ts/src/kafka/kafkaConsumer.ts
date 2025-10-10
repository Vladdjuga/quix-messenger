import {Kafka, type Consumer, type EachMessagePayload, CompressionCodecs, CompressionTypes} from 'kafkajs';
import logger from '../config/logger.js';

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec

export class KafkaConsumerService {
    private kafka: Kafka;
    private consumer: Consumer;
    private messageHandlers: Map<string, (payload: any) => Promise<void>>;

    constructor(brokers: string[], groupId: string) {
        this.kafka = new Kafka({
            clientId: 'realtime-service-consumer',
            brokers: brokers,
            retry: {
                retries: 10,
                initialRetryTime: 100,
                maxRetryTime: 30000,
            },
            connectionTimeout: 10000,
        });

        this.consumer = this.kafka.consumer({
            groupId: groupId,
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            maxWaitTimeInMs: 100, // Low latency
            retry: {
                retries: 10,
            },
        });

        this.messageHandlers = new Map();

        logger.info(`Kafka consumer initialized with brokers: ${brokers.join(', ')}, groupId: ${groupId}`);
    }

    /**
     * Register a handler for a specific topic
     */
    public registerHandler(topic: string, handler: (payload: any) => Promise<void>): void {
        this.messageHandlers.set(topic, handler);
        logger.info(`Registered handler for topic: ${topic}`);
    }

    /**
     * Connect to Kafka and start consuming
     */
    public async connect(): Promise<void> {
        try {
            await this.consumer.connect();
            logger.info('Kafka consumer connected successfully');

            // Subscribe to all registered topics
            const topics = Array.from(this.messageHandlers.keys());
            if (topics.length === 0) {
                logger.warn('No topics registered for Kafka consumer');
                return;
            }

            for (const topic of topics) {
                await this.consumer.subscribe({ topic, fromBeginning: false });
                logger.info(`Subscribed to Kafka topic: ${topic}`);
            }

            // Start consuming messages
            await this.consumer.run({
                eachMessage: async (payload: EachMessagePayload) => {
                    await this.handleMessage(payload);
                },
            });

            logger.info('Kafka consumer started successfully');
        } catch (error) {
            logger.error('Failed to connect Kafka consumer:', error);
            throw error;
        }
    }

    /**
     * Handle incoming Kafka message
     */
    private async handleMessage(payload: EachMessagePayload): Promise<void> {
        const { topic, partition, message } = payload;

        try {
            if (!message.value) {
                logger.warn(`Received empty message from topic ${topic}, partition ${partition}`);
                return;
            }

            const messageValue = message.value.toString();
            const parsedMessage = JSON.parse(messageValue);

            logger.info(
                `Received Kafka message: topic=${topic}, partition=${partition}, offset=${message.offset}, key=${message.key?.toString()}`
            );

            // Find and execute the handler for this topic
            const handler = this.messageHandlers.get(topic);
            if (handler) {
                await handler(parsedMessage);
                logger.debug(`Successfully processed message from topic ${topic}`);
            } else {
                logger.warn(`No handler registered for topic: ${topic}`);
            }
        } catch (error) {
            logger.error(
                `Error processing Kafka message from topic ${topic}, partition ${partition}, offset ${message.offset}:`,
                error
            );
            // Don't throw - let consumer continue processing other messages
        }
    }

    /**
     * Disconnect from Kafka
     */
    public async disconnect(): Promise<void> {
        try {
            await this.consumer.disconnect();
            logger.info('Kafka consumer disconnected successfully');
        } catch (error) {
            logger.error('Error disconnecting Kafka consumer:', error);
            throw error;
        }
    }

    /**
     * Graceful shutdown
     */
    public async shutdown(): Promise<void> {
        logger.info('Shutting down Kafka consumer...');
        await this.disconnect();
    }
}
