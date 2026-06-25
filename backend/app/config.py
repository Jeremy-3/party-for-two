from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ALLOWED_ORIGINS: list[str] = ["http://localhost:8080"]
    SECRET_KEY: str
    

    class Config:
        env_file = ".env"


settings = Settings()

