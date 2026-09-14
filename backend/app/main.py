from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import settings
from app.database import Base, engine
from app.routers import (
    assistant,
    auth,
    availability,
    dashboard,
    folios,
    guests,
    inventory,
    loyalty,
    menu,
    notifications,
    reorder,
    reservations,
    transactions,
)
from app.seed import seed_if_empty


def ensure_kitchen_schema() -> None:
    columns = {column["name"] for column in inspect(engine).get_columns("inventory_items")}
    if "outlet" in columns:
        return
    with engine.begin() as connection:
        if engine.dialect.name == "sqlite":
            connection.execute(text(
                "ALTER TABLE inventory_items ADD COLUMN outlet VARCHAR NOT NULL DEFAULT 'Main Kitchen'"
            ))
        else:
            connection.execute(text(
                "ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS outlet VARCHAR NOT NULL DEFAULT 'Main Kitchen'"
            ))


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.testing:
        Base.metadata.create_all(bind=engine)
        ensure_kitchen_schema()
        if settings.seed_on_startup:
            seed_if_empty()
    yield


app = FastAPI(
    title="Meridian Hospitality Group API",
    description=(
        "Shared starter baseline API (Section 2 of the ADM case study). "
        "Extend with your team's vertical-specific entities/endpoints per your brief "
        "(Section 4) rather than redesigning what's here."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reservations.router)
app.include_router(auth.router)
app.include_router(guests.router)
app.include_router(folios.router)
app.include_router(availability.router)
app.include_router(dashboard.router)
app.include_router(inventory.router)
app.include_router(loyalty.router)
app.include_router(menu.router)
app.include_router(notifications.router)
app.include_router(reorder.router)
app.include_router(transactions.router)
app.include_router(assistant.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
