export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
}

export interface Meeting {
  id: string;
  meeting_code: string;
  title: string;
  description?: string | null;
  host_id: string;
  meeting_type: string;
  status: string;
  scheduled_start?: string | null;
  duration_minutes?: number | null;
  created_at: string;
}

export interface DashboardMeetings {
  upcoming: Meeting[];
  recent: Meeting[];
}

export interface JoinMeetingResponse {
  participant: {
    id: string;
    meeting_id: string;
    display_name: string;
    joined_at: string;
  };
  is_host: boolean;
  host_id: string;
}

export interface MeetingParticipant {
  peerId: string;
  name: string;
  isLocal: boolean;
  muted: boolean;
}
