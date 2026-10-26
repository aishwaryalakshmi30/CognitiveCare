from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class RoutineTaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    period_of_day: str = Field(
        default="morning",
        pattern="^(morning|afternoon|evening|night)$"
    )
    order_index: int = Field(default=0, ge=0)
    icon_name: str = Field(default="sun", max_length=50)


class RoutineTaskRead(BaseModel):
    id: int
    user_id: int
    title: str
    period_of_day: str
    order_index: int
    is_checked: bool
    last_checked_date: Optional[str]
    icon_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
