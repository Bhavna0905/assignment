from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    avatar_url: Optional[str] = None


class AuthSyncRequest(BaseModel):
    google_id: str
    name: str
    email: str
    avatar_url: Optional[str] = None


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    meeting_code: str
    title: str
    description: Optional[str] = None
    host_id: str
    meeting_type: str
    status: str
    scheduled_start: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    created_at: datetime


class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    duration_minutes: Optional[int] = None


class ParticipantCreate(BaseModel):
    display_name: str


class ParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    meeting_id: str
    display_name: str
    joined_at: datetime


class JoinMeetingOut(BaseModel):
    participant: ParticipantOut
    is_host: bool
    host_id: str


class DashboardResponse(BaseModel):
    upcoming: List[MeetingOut]
    recent: List[MeetingOut]


class ScheduleMeetingRequest(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_start: datetime
    duration_minutes: int


class InstantMeetingOut(MeetingOut):
    join_url: str
