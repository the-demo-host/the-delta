export type QuestionStatus = "open" | "hidden" | "answered";

export type SortOrder = "top" | "newest";

export interface Question {
  id: number;
  text: string;
  author: string;
  votes: number;
  status: QuestionStatus;
  createdAt: string;
}

export interface NewQuestion {
  text: string;
  author?: string;
}

export interface FeatureProgress {
  id: string;
  title: string;
  passed: number;
  total: number;
}

export interface Progress {
  features: FeatureProgress[];
  updatedAt: string | null;
}
