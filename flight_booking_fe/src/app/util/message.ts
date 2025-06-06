import { MessageChat } from '../models/chatbot.model';
import { MessageMongoDBModel } from '../models/mongoDB/message.model';

export const convertMessageMongoToClient = (
  message: MessageMongoDBModel
): MessageChat => {
  const payload: any = {};
  if (message.content.type === 'text') {
    payload[message.content.type] = message.content.data;
  } else {
    payload[message.content.type] = JSON.parse(message.content.data);
  }

  console.log('payload', payload);

  return {
    type: message.content.type,
    payload: payload,
    isUser: message.sender.type === 'user' || message.sender.type === 'guest',
  };
};
