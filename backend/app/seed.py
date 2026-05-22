import random
import string
from datetime import datetime, time, timedelta
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Meeting, Participant, User


def generate_meeting_code() -> str:
    digits = "".join(random.choices(string.digits, k=10))
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"


async def seed_db(db: AsyncSession) -> None:
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none() is not None:
        return

    now = datetime.utcnow()
    user_id = str(uuid4())

    user = User(
        id=user_id,
        name="Vedik",
        email="vedik@example.com",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=Vedik",
    )
    db.add(user)

    tomorrow = now.date() + timedelta(days=1)
    in_two_days = now.date() + timedelta(days=2)
    in_four_days = now.date() + timedelta(days=4)

    upcoming_meetings = [
        Meeting(
            id=str(uuid4()),
            meeting_code=generate_meeting_code(),
            title="Team Standup",
            description="Daily team sync",
            host_id=user_id,
            meeting_type="scheduled",
            status="created",
            scheduled_start=datetime.combine(tomorrow, time(10, 0)),
            duration_minutes=30,
        ),
        Meeting(
            id=str(uuid4()),
            meeting_code=generate_meeting_code(),
            title="Design Review",
            description="Review latest UI mockups",
            host_id=user_id,
            meeting_type="scheduled",
            status="created",
            scheduled_start=datetime.combine(in_two_days, time(14, 0)),
            duration_minutes=60,
        ),
        Meeting(
            id=str(uuid4()),
            meeting_code=generate_meeting_code(),
            title="1:1 Sync",
            description=None,
            host_id=user_id,
            meeting_type="scheduled",
            status="created",
            scheduled_start=datetime.combine(in_four_days, time(11, 0)),
            duration_minutes=45,
        ),
    ]
    db.add_all(upcoming_meetings)

    kickoff_start = now - timedelta(days=3)
    retro_start = now - timedelta(weeks=1)

    past_meetings = [
        Meeting(
            id=str(uuid4()),
            meeting_code=generate_meeting_code(),
            title="Project Kickoff",
            description="Kickoff for Q2 project",
            host_id=user_id,
            meeting_type="instant",
            status="ended",
            scheduled_start=kickoff_start,
            duration_minutes=60,
            created_at=kickoff_start,
        ),
        Meeting(
            id=str(uuid4()),
            meeting_code=generate_meeting_code(),
            title="Sprint Retrospective",
            description="Sprint 12 retro",
            host_id=user_id,
            meeting_type="instant",
            status="ended",
            scheduled_start=retro_start,
            duration_minutes=45,
            created_at=retro_start,
        ),
    ]
    db.add_all(past_meetings)

    for meeting in past_meetings:
        db.add(
            Participant(
                id=str(uuid4()),
                meeting_id=meeting.id,
                user_id=user_id,
                display_name="Vedik",
                joined_at=meeting.scheduled_start or now,
                left_at=(meeting.scheduled_start or now)
                + timedelta(minutes=meeting.duration_minutes or 0),
            )
        )

    await db.commit()
