import { ReadUserDto } from "@/lib/dto/ReadUserDto";
import { api } from "@/app/api";
import { UserStatus } from "@/lib/types/enums";
import { getUserStatuses } from "./userSearchService";

export interface ProfileData extends ReadUserDto {
  status: UserStatus | 'self';
  friendshipId?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export async function fetchUserByUsername(username: string): Promise<ReadUserDto> {
  try {
    const response = await api.user.searchUsers(username, 1);
    const users = response.data;
    const userData = users.find(u => u.username === username);
    
    if (!userData) {
      throw new Error("User not found");
    }
    
    return userData;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw new Error('Failed to load user profile');
  }
}

export async function getProfileWithStatus(
  username: string, 
  currentUser: ReadUserDto
): Promise<ProfileData> {
  // Check if viewing own profile
  if (currentUser.username === username) {
    return {
      ...currentUser,
      status: 'self'
    };
  }
  
  // Fetch user data
  const user = await fetchUserByUsername(username);
  
  // Get relationship status
  const usersWithStatus = await getUserStatuses([user]);
  const userWithStatus = usersWithStatus[0];
  
  return {
    ...user,
    status: userWithStatus.status,
    friendshipId: userWithStatus.friendshipId
  };
}
