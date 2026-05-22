import random
import string
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models import Meeting, Participant, User
from app.schemas import (
    AuthSyncRequest,
    DashboardResponse,
    InstantMeetingOut,
    MeetingOut,
    JoinMeetingOut,
    ParticipantCreate,
    ParticipantOut,
    ScheduleMeetingRequest,
    UserOut,
)

router = APIRouter(tags=["meetings"])


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_utc_naive(dt: datetime) -> datetime:
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def generate_instant_meeting_code() -> str:
    digits = string.digits
    return (
        "".join(random.choices(digits, k=3))
        + "-"
        + "".join(random.choices(digits, k=3))
        + "-"
        + "".join(random.choices(digits, k=4))
    )


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    x_user_email: str | None = Header(None, alias="X-User-Email"),
) -> User:
    if x_user_email:
        result = await db.execute(select(User).where(User.email == x_user_email))
        user = result.scalar_one_or_none()
        if user:
            return user
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_meeting_by_code(db: AsyncSession, code: str) -> Meeting:
    result = await db.execute(select(Meeting).where(Meeting.meeting_code == code))
    meeting = result.scalar_one_or_none()
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/auth/sync", response_model=UserOut)
async def sync_auth(body: AuthSyncRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if user:
        user.name = body.name
        user.avatar_url = body.avatar_url
    else:
        user = User(
            id=str(uuid4()),
            name=body.name,
            email=body.email,
            avatar_url=body.avatar_url,
        )
        db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/meetings", response_model=DashboardResponse)
async def list_meetings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = utc_now_naive()

    upcoming_result = await db.execute(
        select(Meeting)
        .where(
            and_(
                Meeting.host_id == user.id,
                Meeting.meeting_type == "scheduled",
                Meeting.status == "created",
                Meeting.scheduled_start.isnot(None),
                Meeting.scheduled_start >= now,
            )
        )
        .order_by(Meeting.scheduled_start.asc())
    )
    upcoming = upcoming_result.scalars().all()

    recent_result = await db.execute(
        select(Meeting)
        .options(selectinload(Meeting.participants))
        .where(
            and_(
                Meeting.host_id == user.id,
                or_(
                    Meeting.status == "ended",
                    and_(
                        Meeting.meeting_type == "instant",
                        Meeting.created_at <= now,
                    ),
                    and_(
                        Meeting.meeting_type == "scheduled",
                        Meeting.scheduled_start.isnot(None),
                        Meeting.scheduled_start < now,
                    ),
                ),
            )
        )
        .order_by(Meeting.created_at.desc())
        .limit(5)
    )
    recent = recent_result.scalars().all()

    return DashboardResponse(
        upcoming=[MeetingOut.model_validate(m) for m in upcoming],
        recent=[MeetingOut.model_validate(m) for m in recent],
    )


@router.post("/meetings/instant", response_model=InstantMeetingOut)
async def create_instant_meeting(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    meeting = Meeting(
        id=str(uuid4()),
        meeting_code=generate_instant_meeting_code(),
        title=f"{user.name}'s Instant Meeting",
        host_id=user.id,
        meeting_type="instant",
        status="created",
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)

    join_url = f"{settings.FRONTEND_URL}/meeting/{meeting.meeting_code}"
    return InstantMeetingOut(
        **MeetingOut.model_validate(meeting).model_dump(),
        join_url=join_url,
    )


@router.post("/meetings/schedule", response_model=MeetingOut)
async def schedule_meeting(
    body: ScheduleMeetingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scheduled_start = to_utc_naive(body.scheduled_start)
    if scheduled_start <= utc_now_naive():
        raise HTTPException(
            status_code=400,
            detail="Scheduled start must be in the future",
        )

    meeting = Meeting(
        id=str(uuid4()),
        meeting_code=generate_instant_meeting_code(),
        title=body.title,
        description=body.description,
        host_id=user.id,
        meeting_type="scheduled",
        status="created",
        scheduled_start=scheduled_start,
        duration_minutes=body.duration_minutes,
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    return meeting


@router.get("/meetings/{code}", response_model=MeetingOut)
async def get_meeting(code: str, db: AsyncSession = Depends(get_db)):
    meeting = await get_meeting_by_code(db, code)
    return meeting


@router.post("/meetings/{code}/participants", response_model=JoinMeetingOut)
async def add_participant(
    code: str,
    body: ParticipantCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    meeting = await get_meeting_by_code(db, code)

    participant = Participant(
        id=str(uuid4()),
        meeting_id=meeting.id,
        user_id=user.id,
        display_name=body.display_name,
    )
    db.add(participant)
    await db.commit()
    await db.refresh(participant)
    return JoinMeetingOut(
        participant=ParticipantOut.model_validate(participant),
        is_host=meeting.host_id == user.id,
        host_id=meeting.host_id,
    )
