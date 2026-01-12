
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  friends?: string[]; // IDs of friends
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: number;
}

export interface Conversation {
  userId: string;
  username: string;
  userAvatar: string;
  lastMessage?: string;
  timestamp: number;
}

export type EditorTool = 'ai-effects' | 'video-gen' | 'filters' | 'text';

export interface AIResponse {
  imageUrl?: string;
  videoUrl?: string;
  text?: string;
}
