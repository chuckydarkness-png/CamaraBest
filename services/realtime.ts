
import { Post, UserProfile, Comment, Message, Conversation } from '../types';
import { Language } from './translations';

const STORAGE_KEYS = {
  POSTS: 'camerabest_posts',
  USER: 'camerabest_current_user',
  LANG: 'camerabest_lang',
  MESSAGES: 'camerabest_messages',
  FRIENDS: 'camerabest_friends'
};

const DEFAULT_USER: UserProfile = {
  id: 'current_user_1',
  name: 'Creative Soul',
  username: 'creativesoul',
  avatar: 'https://picsum.photos/seed/user/200',
  bio: 'Visual artist exploring AI horizons. CameraBest is my playground.',
  followers: 1240,
  following: 890,
  friends: ['u1']
};

const SUGGESTED_USERS: UserProfile[] = [
  { id: 'u1', name: 'Neon Rider', username: 'neon_rider', avatar: 'https://picsum.photos/seed/u1/200', bio: 'Living in the future.', followers: 5000, following: 200 },
  { id: 'u2', name: 'Nature Geek', username: 'nature_geek', avatar: 'https://picsum.photos/seed/u2/200', bio: 'Pixels and Plants.', followers: 3200, following: 450 },
  { id: 'u3', name: 'AI Explorer', username: 'ai_explorer', avatar: 'https://picsum.photos/seed/u3/200', bio: 'Prompt Engineering wizard.', followers: 8900, following: 120 },
  { id: 'u4', name: 'Retro Vibes', username: 'retro_vibes', avatar: 'https://picsum.photos/seed/u4/200', bio: 'Vaporwave aesthetics.', followers: 1500, following: 800 }
];

const seedPosts = (): Post[] => {
  const existing = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (existing) return JSON.parse(existing);

  const initial: Post[] = [
    {
      id: 'p1',
      userId: 'u1',
      username: 'neon_rider',
      userAvatar: 'https://picsum.photos/seed/u1/100',
      mediaUrl: 'https://picsum.photos/seed/m1/800/1200',
      mediaType: 'image',
      caption: 'Cyberpunk sunset created with CameraBest AI!',
      likes: 42,
      comments: [],
      timestamp: Date.now() - 3600000
    },
    {
      id: 'p2',
      userId: 'u3',
      username: 'ai_explorer',
      userAvatar: 'https://picsum.photos/seed/u3/100',
      mediaUrl: 'https://picsum.photos/seed/m3/800/1200',
      mediaType: 'image',
      caption: 'Testing the new 2.5 Flash Image model. Stunning details.',
      likes: 89,
      comments: [],
      timestamp: Date.now() - 5600000
    }
  ];
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(initial));
  return initial;
};

export const RealtimeService = {
  getCurrentUser: (): UserProfile => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : DEFAULT_USER;
  },

  updateUser: (user: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    window.dispatchEvent(new Event('user_updated'));
  },

  getSuggestedUsers: (): UserProfile[] => {
    const user = RealtimeService.getCurrentUser();
    return SUGGESTED_USERS.filter(u => u.id !== user.id);
  },

  getLanguage: (): Language => {
    return (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'en';
  },

  setLanguage: (lang: Language) => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    window.dispatchEvent(new Event('lang_updated'));
  },

  getPosts: (): Post[] => {
    return seedPosts();
  },

  addPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'timestamp'>): Post => {
    const posts = RealtimeService.getPosts();
    const newPost: Post = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      likes: 0,
      comments: [],
      timestamp: Date.now()
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    window.dispatchEvent(new Event('posts_updated'));
    return newPost;
  },

  likePost: (postId: string) => {
    const posts = RealtimeService.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index].likes += 1;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      window.dispatchEvent(new Event('posts_updated'));
    }
  },

  toggleFriend: (friendId: string) => {
    const user = RealtimeService.getCurrentUser();
    const friends = user.friends || [];
    const isFriend = friends.includes(friendId);
    
    if (isFriend) {
      user.friends = friends.filter(id => id !== friendId);
    } else {
      user.friends = [...friends, friendId];
      // Automatically create a conversation when added
      RealtimeService.sendMessage(friendId, "Hey! I just added you on CameraBest.");
    }
    
    RealtimeService.updateUser(user);
  },

  getMessages: (otherUserId: string): Message[] => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    const user = RealtimeService.getCurrentUser();
    return allMessages.filter(m => 
      (m.senderId === user.id && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === user.id)
    ).sort((a, b) => a.timestamp - b.timestamp);
  },

  sendMessage: (receiverId: string, text?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    const user = RealtimeService.getCurrentUser();
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      receiverId,
      text,
      mediaUrl,
      mediaType,
      timestamp: Date.now()
    };
    allMessages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    window.dispatchEvent(new Event('messages_updated'));
    return newMessage;
  },

  getConversations: (): Conversation[] => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    const user = RealtimeService.getCurrentUser();
    const uniqueUsers = new Set<string>();
    
    allMessages.forEach(m => {
      if (m.senderId === user.id) uniqueUsers.add(m.receiverId);
      if (m.receiverId === user.id) uniqueUsers.add(m.senderId);
    });

    return Array.from(uniqueUsers).map(uid => {
      const u = SUGGESTED_USERS.find(su => su.id === uid);
      return {
        userId: uid,
        username: u?.username || uid,
        userAvatar: u?.avatar || `https://picsum.photos/seed/${uid}/100`,
        lastMessage: allMessages.filter(m => m.senderId === uid || m.receiverId === uid).pop()?.text,
        timestamp: Date.now()
      };
    });
  }
};
