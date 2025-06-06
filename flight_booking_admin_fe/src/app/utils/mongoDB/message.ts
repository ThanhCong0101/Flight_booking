import { match } from 'ts-pattern';
import {
  MessageChat,
  MessageMongoDBModel,
  typeMessage,
} from 'src/app/models/mongoDB/message.model';

export const convertMessageMongoToClient = (
  message: MessageMongoDBModel
): MessageChat => {
  const payload: any = {};
  // payload[message.content.type] = message.content.data;

  if (message.content.type === 'text') {
    payload[message.content.type] = message.content.data;
  } else {
    payload[message.content.type] = JSON.parse(message.content.data);
  }

  const messageType: typeMessage = match(message.content.type)
    .with('text', () => typeMessage.TEXT)
    .with('choice', () => typeMessage.CHOICE)
    .with('carousel', () => typeMessage.CAROUSEL)
    .with('formField', () => typeMessage.CUSTOM_FORM)
    .with('cardV2', () => typeMessage.CARDV2)
    .otherwise(() => typeMessage.TEXT);

    console.log("id", message.sender.user_id.user_id)

  return {
    type: messageType,
    payload: payload,
    sender: {
      id: message.sender.user_id.user_id,
      name: message.sender.type,
      avatar: message.sender.user_id.profile_picture,
      isAdmin:
        message.sender.type === 'admin' || message.sender.type === 'assistant',
    },
    timestamp: message.created_at,
  };
};
