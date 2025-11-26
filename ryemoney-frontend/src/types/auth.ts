export type User = {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthUserPayload = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  user: User | AuthUserPayload;
  token: string;
};
