export interface MessageList {
  id: string;
  userInfo: UserInfoModel
  name: string;
  lastMessage: string;
  timestamp: Date;
  avatar: string;
  socket_room_name: string;
}

export interface UserInfoModel {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface MessageMongoDBModel {
  _id: string;
  room_id: string;
  sender: {
    user_id: {
      user_id: string;
      type: typeUser;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      gender: 'male' | 'female' | 'other' | null;
      profile_picture: string;
    };
    type: typeUser;
  };
  content: {
    type:
      | 'text'
      | 'voice'
      | 'image'
      | 'carousel'
      | 'cardV2'
      | 'choice'
      | 'formField';
    data: string;
  };
  read_status: {
    is_read: boolean;
    read_by: Array<{ user_id: string }>;
  };
  created_at: Date;
  updated_at: Date;
}

export enum typeUser {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  ASSISTANT = 'assistant',
}

export interface MessageChat {
  type: typeMessage;
  sender: SenderType;
  payload?: {
    choice?: Choice[];
    text?: string;
    layout?: string;
    card?: Card[];
    carousel?: Card[];
    formField?: { [key: string]: FormField };
  };
  timestamp: Date;
}

export interface SenderType {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
}

export enum typeMessage {
  TEXT = 'text',
  CHOICE = 'choice',
  CAROUSEL = 'carousel',
  CUSTOM_FORM = 'custom_form',
  CARDV2 = 'cardV2',
}

export interface Choice {
  name: string;
  request: {
    [key: string]: any; // Dynamic key-value pairs
  };
}

export interface Card {
  title: string;
  description: SlateDescription;
  imageUrl: string;
  variables: {
    [key: string]: any; // Dynamic key-value pairs
  };
  buttons: Button[];
}

export interface Button {
  name: string;
  request: {
    [key: string]: any; // Dynamic key-value pairs
  };
}

export interface SlateDescription {
  slate: SlateChild[];
  text: string;
}

export interface SlateChild {
  children: SlateText[];
  type?: string;
  url?: string;
}

export interface SlateText {
  text: string;
  fontWeight?: string;
  color?: any;
  underline?: boolean;
}

export interface FormField {
  type: 'text' | 'select' | 'date';
  label: string;
  placeholder?: string;
  value: string;
  required: boolean;
  options?: string[];
}
