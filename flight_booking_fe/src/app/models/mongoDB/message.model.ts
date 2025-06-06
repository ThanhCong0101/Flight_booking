export interface MessageMongoDBModel {
  room_id: string;
  sender: {
    user_id: string;
    type: 'user' | 'admin' | 'guest' | 'assistant';
  };
  content: {
    type:
      | 'text'
      | 'voice'
      | 'image'
      | 'carousel'
      | 'card'
      | 'choices'
      | 'formField';
    data: string;
  };
  read_status: {
    is_read: boolean;
    read_by: Array<{ user_id: string }>;
  };
}
