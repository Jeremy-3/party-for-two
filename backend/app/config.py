from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ALLOWED_ORIGINS: list[str]
    SECRET_KEY: str
    

    class Config:
        env_file = ".env"


settings = Settings()

