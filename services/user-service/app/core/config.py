from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    service_name: str = "User Service"
    postgres_user: str = Field(default="postgres")
    postgres_password: str = Field(default="postgres")
    postgres_db: str = Field(default="travel_platform")
    postgres_host: str = Field(default="postgres")
    postgres_port: str = Field(default="5432")
    postgres_schema: str = Field(default="public")

    clerk_secret_key: str = Field(default="", env="CLERK_SECRET_KEY")

    @property
    def postgres_dsn(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    model_config = SettingsConfigDict(
        env_file="../../.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
