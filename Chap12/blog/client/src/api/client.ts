const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_EXTERNAL_API_URL ||
  "http://localhost:4001";

// ============================================================================
// 1. Token Management in Memory (Chapter 12)
// ============================================================================
let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

// ============================================================================
// 2. Handling Token Refresh and Race Conditions (Chapter 12)
// ============================================================================
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        setAccessToken(null);
        return null;
      }
      const data: { userId: string; accessToken: string } =
        await response.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ============================================================================
// 3. The Base Type-Safe API Client (Chapter 12)
// ============================================================================
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (inMemoryAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Handle 401 Unauthorized with automatic token refresh & race-condition deduplication
  if (
    response.status === 401 &&
    retry &&
    !endpoint.includes("/profile/login") &&
    !endpoint.includes("/profile/refresh")
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiClient<T>(endpoint, options, false);
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Fallback to status text
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ============================================================================
// 4. Domain Types & Typed Endpoint Functions (Chapter 12)
// ============================================================================
export interface UserProfile {
  id: string;
  createdAt?: string;
  updatedAt: string;
  userName: string;
  fullName: string;
  description?: string;
  socialLinkPrimary?: string;
  socialLinkSecondary?: string;
  avatarId?: string;
  role?: "user" | "admin";
}

export interface TopicItem {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkItem {
  id: string;
  updatedAt: string;
  title: string;
  description: string;
  content: string;
  authorId: string;
  userName: string;
  fullName: string;
  authorDesc?: string;
  workTopics?: { id: string; name: string }[];
  workLikes?: { id: string }[];
}

export interface WorkResponseItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  response: string;
  work: { id: string; title: string };
  responder: {
    id: string;
    userName: string;
    fullName: string;
    description?: string;
  };
}

export interface FollowUserItem {
  followId: string;
  id: string;
  updatedAt: string;
  userName: string;
  fullName: string;
  description?: string;
  socialLinkPrimary?: string;
  socialLinkSecondary?: string;
}

// --- Auth & Profile Endpoints ---
export async function loginApi(
  userName: string,
  password: string
): Promise<{ userId: string; accessToken: string }> {
  const result = await apiClient<{ userId: string; accessToken: string }>(
    "/profile/login",
    {
      method: "POST",
      body: JSON.stringify({ userName, password }),
    }
  );
  setAccessToken(result.accessToken);
  return result;
}

export async function registerApi(params: {
  userName: string;
  password: string;
  fullName: string;
  description: string;
  socialLinkPrimary?: string;
  socialLinkSecondary?: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("userName", params.userName);
  formData.append("password", params.password);
  formData.append("fullName", params.fullName);
  formData.append("description", params.description || "");
  if (params.socialLinkPrimary && params.socialLinkPrimary.length >= 2) {
    formData.append("socialLinkPrimary", params.socialLinkPrimary);
  }
  if (params.socialLinkSecondary && params.socialLinkSecondary.length >= 2) {
    formData.append("socialLinkSecondary", params.socialLinkSecondary);
  }

  return apiClient<string>("/profile/new", {
    method: "POST",
    body: formData,
  });
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient<void>("/profile/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export async function getMeApi(): Promise<UserProfile | null> {
  return apiClient<UserProfile | null>("/profile/me", { method: "GET" });
}

export async function getProfileApi(profileId: string): Promise<UserProfile> {
  return apiClient<UserProfile>(`/profile/${profileId}`, { method: "GET" });
}

export async function updateProfileApi(params: {
  profileId: string;
  fullName: string;
  password: string;
  description: string;
  socialLinkPrimary?: string;
  socialLinkSecondary?: string;
}): Promise<void> {
  const formData = new FormData();
  formData.append("profileId", params.profileId);
  formData.append("fullName", params.fullName);
  formData.append("password", params.password);
  formData.append("description", params.description);
  if (params.socialLinkPrimary) {
    formData.append("socialLinkPrimary", params.socialLinkPrimary);
  }
  if (params.socialLinkSecondary) {
    formData.append("socialLinkSecondary", params.socialLinkSecondary);
  }

  return apiClient<void>("/profile/update", {
    method: "POST",
    body: formData,
  });
}

export async function getPopularAuthorsApi(): Promise<UserProfile[]> {
  return apiClient<UserProfile[]>("/profile_popular", { method: "GET" });
}

// --- Posts / Works Endpoints ---
export async function getPopularWorksApi(
  topicId?: string,
  pageSize = 20,
  lastCursor?: string
): Promise<WorkItem[]> {
  return apiClient<WorkItem[]>("/work_popular", {
    method: "POST",
    body: JSON.stringify({ topicId, pageSize, lastCursor }),
  });
}

export async function getWorksByTopicApi(
  topicId: string,
  pageSize = 20,
  lastCursor?: string
): Promise<WorkItem[]> {
  return apiClient<WorkItem[]>("/work_topic", {
    method: "POST",
    body: JSON.stringify({ id: topicId, pageSize, lastCursor }),
  });
}

export async function getLatestWorksByAuthorApi(
  authorId: string,
  pageSize = 20,
  lastCursor?: string
): Promise<WorkItem[]> {
  return apiClient<WorkItem[]>("/work_latest", {
    method: "POST",
    body: JSON.stringify({ id: authorId, pageSize, lastCursor }),
  });
}

export async function getWorksOfFollowedApi(
  followerId: string,
  pageSize = 20,
  lastCursor?: string
): Promise<WorkItem[]> {
  return apiClient<WorkItem[]>("/work_followed", {
    method: "POST",
    body: JSON.stringify({ id: followerId, pageSize, lastCursor }),
  });
}

export async function searchWorksApi(
  searchTxt: string,
  pageSize = 20,
  lastCursor?: string
): Promise<WorkItem[]> {
  return apiClient<WorkItem[]>("/work_search", {
    method: "POST",
    body: JSON.stringify({ searchTxt, id: searchTxt, pageSize, lastCursor }),
  });
}

export async function getWorkApi(workId: string): Promise<WorkItem | null> {
  return apiClient<WorkItem | null>(`/work/${workId}`, { method: "GET" });
}

export async function createWorkApi(params: {
  title: string;
  description: string;
  content: string;
  authorId: string;
  topicIds: string[];
}): Promise<string> {
  return apiClient<string>("/work/new", {
    method: "POST",
    body: JSON.stringify({
      title: params.title,
      description: params.description,
      content: params.content,
      authorId: params.authorId,
      topicIds: params.topicIds,
      imagesPlaceholders: [],
    }),
  });
}

export async function updateWorkApi(params: {
  workId: string;
  title: string;
  description: string;
  content: string;
  topicIds: string[];
}): Promise<void> {
  return apiClient<void>("/work/update", {
    method: "POST",
    body: JSON.stringify({
      workId: params.workId,
      title: params.title,
      description: params.description,
      content: params.content,
      topicIds: params.topicIds,
      imagesPlaceholders: [],
    }),
  });
}

export async function deleteWorkApi(workId: string): Promise<void> {
  return apiClient<void>(`/work/${workId}`, {
    method: "DELETE",
  });
}

// --- Likes & Responses Endpoints ---
export async function likeWorkApi(
  workId: string,
  likerId: string
): Promise<string> {
  return apiClient<string>("/work_like/new", {
    method: "POST",
    body: JSON.stringify({ workId, likerId }),
  });
}

export async function getWorkLikesCountApi(workId: string): Promise<number> {
  return apiClient<number>(`/work_like/${workId}`, { method: "GET" });
}

export async function getWorkResponsesApi(
  workId: string,
  pageSize = 20,
  lastCursor?: string
): Promise<WorkResponseItem[]> {
  return apiClient<WorkResponseItem[]>("/work_resp", {
    method: "POST",
    body: JSON.stringify({ id: workId, pageSize, lastCursor }),
  });
}

export async function createWorkResponseApi(
  workId: string,
  responderId: string,
  response: string
): Promise<string> {
  return apiClient<string>("/work_resp/new", {
    method: "POST",
    body: JSON.stringify({ workId, responderId, response }),
  });
}

// --- Topics Endpoints ---
export async function getAllTopicsApi(): Promise<TopicItem[]> {
  return apiClient<TopicItem[]>("/topic", { method: "GET" });
}

export async function createTopicApi(name: string): Promise<string> {
  return apiClient<string>("/topic/new", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// --- Follow Endpoints ---
export async function createFollowApi(
  followedId: string,
  followerId: string
): Promise<string> {
  return apiClient<string>("/follow/new", {
    method: "POST",
    body: JSON.stringify({ followedId, followerId }),
  });
}

export async function getFollowedApi(
  followerId: string,
  pageSize = 20
): Promise<FollowUserItem[]> {
  return apiClient<FollowUserItem[]>("/follow/followed", {
    method: "POST",
    body: JSON.stringify({ id: followerId, pageSize }),
  });
}

export async function getFollowersApi(
  followedId: string,
  pageSize = 20
): Promise<FollowUserItem[]> {
  return apiClient<FollowUserItem[]>("/follow/followers", {
    method: "POST",
    body: JSON.stringify({ id: followedId, pageSize }),
  });
}

export async function getFollowedCountApi(followerId: string): Promise<number> {
  return apiClient<number>(`/follow/followed/count/${followerId}`, {
    method: "GET",
  });
}

export async function getFollowersCountApi(followedId: string): Promise<number> {
  return apiClient<number>(`/follow/followers/count/${followedId}`, {
    method: "GET",
  });
}
