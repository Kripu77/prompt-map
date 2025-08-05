export type MindmapMode = 'lite' | 'comprehensive';

export interface UserSettings {
  userId: string;
  showReasoning: boolean;
  mindmapMode: MindmapMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettingsUpdate {
  showReasoning?: boolean;
  mindmapMode?: MindmapMode;
}