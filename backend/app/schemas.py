"""Pydantic request/response schemas mirroring the Core Data Model and API contract."""

from datetime import date, datetime
from decimal import Decimal

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import FolioStatus, ReorderStatus, ReservationStatus

# ---- Guest ----


class GuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    phone: str | None = None
    loyalty_tier: str
    created_at: datetime


class GuestPreferences(BaseModel):
    dietary: list[str] = []
    room_preferences: list[str] = []
    notes: list[str] = []


class GuestDetail(GuestOut):
    preferences: GuestPreferences


# ---- Property / RatePlan ----
# Not exposed via their own endpoints yet (not in the Section 2.3 contract) — kept
# here so team briefs that add e.g. a properties list endpoint can reuse them.


class PropertyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    brand: str
    address: str | None = None
    timezone: str


class RatePlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    name: str
    nightly_rate: Decimal
    cancellation_policy: str | None = None


# ---- Reservation / Folio ----


class ReservationCreate(BaseModel):
    guest_id: str
    property_id: str
    rate_plan_id: str | None = None
    check_in: date
    check_out: date
    status: ReservationStatus = ReservationStatus.confirmed


class ReservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    guest_id: str
    property_id: str
    rate_plan_id: str | None = None
    check_in: date
    check_out: date
    status: ReservationStatus


class FolioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    reservation_id: str
    line_items: list[dict]
    balance: Decimal
    status: FolioStatus


class ReservationDetail(ReservationOut):
    guest: GuestOut
    folio: FolioOut | None = None


# ---- Availability ----


class AvailabilitySlot(BaseModel):
    rate_plan_id: str
    rate_plan_name: str
    nightly_rate: Decimal
    capacity: int
    booked: int
    available: bool


# ---- Meridian Kitchens vertical (Section 4) ----


class InventoryItemCreate(BaseModel):
    property_id: str | None = None
    outlet: str = "Main Kitchen"
    name: str
    category: str
    quantity: Decimal = Decimal(0)
    unit: str
    reorder_threshold: Decimal = Decimal(0)


class InventoryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    outlet: str
    name: str
    category: str
    quantity: Decimal
    unit: str
    reorder_threshold: Decimal
    updated_at: datetime


class LoyaltyAccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    guest_id: str
    points_balance: Decimal
    tier: str
    updated_at: datetime


class LoyaltyMemberOut(LoyaltyAccountOut):
    name: str
    email: EmailStr


class InventoryStockUpdate(BaseModel):
    quantity: Decimal = Field(ge=0)
    action: Literal["add", "remove"] = "add"


class InventorySummary(BaseModel):
    total: int
    in_stock: int
    low_stock: int
    out_of_stock: int
    in_stock_percent: float
    low_stock_percent: float
    out_of_stock_percent: float


class DashboardOut(BaseModel):
    property_name: str
    summary: InventorySummary
    top_member: LoyaltyMemberOut | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: str
    property_id: str | None = None
    outlet: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MenuItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    outlet: str
    name: str
    price: Decimal
    ingredients: list[str]
    allergens: list[str]


class TransactionCreate(BaseModel):
    guest_id: str
    outlet: str
    amount: Decimal


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    guest_id: str
    outlet: str
    amount: Decimal
    points_earned: Decimal
    created_at: datetime


class TransactionResult(BaseModel):
    transaction: TransactionOut
    guest_name: str
    points_balance: Decimal
    tier: str
    tier_changed: bool


class LoyaltyAdjustment(BaseModel):
    points_delta: Decimal


class ReorderRequestCreate(BaseModel):
    property_id: str
    inventory_item_id: str
    quantity: Decimal


class ReorderRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    inventory_item_id: str
    quantity: Decimal
    status: ReorderStatus
    requested_at: datetime


class ReorderStatusUpdate(BaseModel):
    status: ReorderStatus


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    message: str
    created_at: datetime
    read: str


class AssistantQuery(BaseModel):
    prompt: str


class AssistantReply(BaseModel):
    response: str
