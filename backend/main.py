from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import rooms, websk
from app.config import settings


app = FastAPI(title= "Party of Two", version= "1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(websk.router,tags=["WebSocket"])

@app.get("/")
async def health_check():
    return { "status": "healthy", "message": "Party of Two API is running!"}


