import { KafkaConsumerService } from './kafkaConsumer.js';
import { handleNewMessageEvent } from './handlers/newMessageHandler.js';
import logger from '../config/logger.js';
import {handleEditedMessageEvent} from "./handlers/editedMessageHandler.js";
import {handleMessageDeletedEvent} from "./handlers/deleteMessageHandler.js";

let kafkaConsumer: KafkaConsumerService | null = null;

export async function initializeKafka(brokers: string[]): Promise<void> {
    try {
        logger.info('Initializing Kafka consumer...');

        kafkaConsumer = new KafkaConsumerService(brokers, 'realtime-service-group');

        // Register handlers for different topics
        kafkaConsumer.registerHandler('messenger.events.newMessage', handleNewMessageEvent);
        kafkaConsumer.registerHandler('messenger.events.editMessage', handleEditedMessageEvent);
        kafkaConsumer.registerHandler('messenger.events.deleteMessage', handleMessageDeletedEvent);

        // Connect and start consuming
        await kafkaConsumer.connect();

        logger.info('Kafka consumer initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize Kafka consumer:', error);
        throw error;
    }
}

export async function shutdownKafka(): Promise<void> {
    if (kafkaConsumer) {
        await kafkaConsumer.shutdown();
        kafkaConsumer = null;
    }
}

export function getKafkaConsumer(): KafkaConsumerService | null {
    return kafkaConsumer;
}
