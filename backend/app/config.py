from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ALLOWED_ORIGINS: str
    SECRET_KEY: str
    

    class Config:
        env_file = ".env"


settings = Settings()

