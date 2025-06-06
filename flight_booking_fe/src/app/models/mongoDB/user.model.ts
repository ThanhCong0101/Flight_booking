export interface UserMongoDBModel {
  user_id: String;
  type: 'admin' | 'user' | 'guest' | 'assistant';
  first_name?: String;
  last_name?: String;
  email?: String;
  phone?: String;
  gender?: 'male' | 'female' | 'other' | null;
  is_temporary: boolean;
}
