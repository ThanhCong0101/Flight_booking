export interface SlateText {
  text: string;
  fontWeight?: string;
  color?: any;
  underline?: boolean;
}

export interface SlateChild {
  children: SlateText[];
  type?: string;
  url?: string;
}

export interface SlateDescription {
  slate: SlateChild[];
  text: string;
}

export interface Choice {
  name: string;
  request: {
    [key: string]: any; // Dynamic key-value pairs
  };
}

export interface ChatResponse {
  time: number;
  type: string;
  payload: {
    slate: {
      id: string;
      content: Array<{
        children?: Array<{
          text: string;
        }>;
      }>;
      messageDelayMilliseconds: number;
    };
    message: string;
    delay: number;

    // Choice type payload
    buttons?: Array<{
      name: string;
      request: {
        [key: string]: any; // Dynamic key-value pairs
      };
    }>;
  };
}

export interface Button {
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
export interface MessageChat {
  type: string;
  isUser: boolean;
  payload?: {
    choice?: Choice[];
    text?: string;
    layout?: string;
    cardV2?: Card[];
    carousel?: Card[];
    formField?: { [key: string]: FormField }
  };
}

export interface FormField {
  type: 'text' | 'select' | 'date';
  label: string;
  placeholder?: string;
  value: string;
  required: boolean;
  options?: string[];
}

export interface PassengerForm {
  passengers: PassengersField[];
}

export interface PassengersField {
  firstName: FormField;
  lastName: FormField;
  gender: FormField;
  passportNumber: FormField;
  passportExpiry: FormField;
  nationality: FormField;
  dateOfBirth: FormField;
  streetAddress: FormField;
  city: FormField;
  country: FormField;
}

export interface DynamicFormFields {
  [key: string]: FormField | { [key: string]: FormField }[];
}
