export type Role = "user" | "assistant";

export type ChatVideo = {
  url: string;
  productName: string;
  hook: string;
};

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  video?: ChatVideo;
};

export type WebsiteSummary = {
  url: string;
  title: string;
  description: string;
  messaging: string;
};

export type MarketingStrategy = {
  productName: string;
  productDescription: string;
  targetAudience: string;
  marketingAngle: string;
  ugcCaption: string;
  gifSearchTerm: string;
  backgroundSearchTerm: string;
  audioMood: string;
};

export type AssetBundle = {
  gifUrl: string;
  backgroundUrl: string;
  audioUrl?: string;
};

export type ChatApiResponse = {
  message: ChatMessage;
};
