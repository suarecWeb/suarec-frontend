import api from "./axios_config";

export enum ReportStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum ReportReason {
  SPAM = "spam",
  HARASSMENT = "harassment",
  HATE_SPEECH = "hate_speech",
  VIOLENCE = "violence",
  SEXUAL_CONTENT = "sexual_content",
  MISINFORMATION = "misinformation",
  INTELLECTUAL_PROPERTY = "intellectual_property",
  ILLEGAL_ACTIVITY = "illegal_activity",
  OTHER = "other",
}

export enum ReportContentType {
  PUBLICATION = "publication",
  COMMENT = "comment",
  MESSAGE = "message",
  USER_PROFILE = "user_profile",
}

export interface ContentReport {
  id: number;
  reporter_id: number;
  reporter: { id: number; name: string; email: string };
  reported_user_id: number;
  reportedUser: { id: number; name: string; email: string };
  content_type: ReportContentType;
  content_id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewed_by?: number;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

interface GetReportsResponse {
  data: ContentReport[];
  total: number;
  page: number;
  limit: number;
}

const baseURL = "/suarec/moderation";

const getReports = (params?: {
  status?: ReportStatus;
  page?: number;
  limit?: number;
}) => api.get<GetReportsResponse>(`${baseURL}/reports`, { params });

const updateReportStatus = (
  id: number,
  data: { status: ReportStatus; resolution_notes?: string },
) => api.patch(`${baseURL}/reports/${id}/status`, data);

const ModerationService = { getReports, updateReportStatus };
export default ModerationService;
