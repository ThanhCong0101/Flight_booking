export const convertMessageToMongoDBFormat = (message) => {
    return {
        room_id: message.room_id,
        sender: {
          user_id: message.user_id,
          type: message.user_type
        },
        content: {
            type: message.chat_type,
            data: message.message
        },
        read_status: {
            is_read: message.is_read,
            read_by: message.read_by
        },
      }
}