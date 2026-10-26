from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, require_elderly_or_caregiver
from app.models.user import User
from app.models.memory_card import MemoryCard
from app.schemas.memory_card import MemoryCardCreate, MemoryCardRead

router = APIRouter(prefix="/memory-cards", tags=["Memory Cards & Familiar Photos"])


@router.get("/", response_model=List[MemoryCardRead])
def get_memory_cards(
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Retrieves familiar-person and familiar-place photo cards for the senior."""
    return db.query(MemoryCard).filter(
        MemoryCard.user_id == current_user.id
    ).order_by(desc(MemoryCard.created_at)).all()


@router.post("/", response_model=MemoryCardRead, status_code=status.HTTP_201_CREATED)
def create_memory_card(
    card_in: MemoryCardCreate,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Creates a memory card with familiar photo, description, and reassurance prompt."""
    card = MemoryCard(
        user_id=current_user.id,
        category=card_in.category,
        name_or_title=card_in.name_or_title,
        relation=card_in.relation,
        description=card_in.description,
        photo_url=card_in.photo_url or "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
        audio_prompt=card_in.audio_prompt or f"This is {card_in.name_or_title}, your {card_in.relation}."
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory_card(
    card_id: int,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Removes a memory card."""
    card = db.query(MemoryCard).filter(
        MemoryCard.id == card_id,
        MemoryCard.user_id == current_user.id
    ).first()
    if not card:
        raise HTTPException(status_code=404, detail="Memory card not found.")
    
    db.delete(card)
    db.commit()
    return None
