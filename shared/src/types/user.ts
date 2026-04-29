export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'email'>;

export interface AuthResponse {
  accessToken: string;
  user: User;
}
