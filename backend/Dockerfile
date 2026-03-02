FROM python:3.12-slim

# System dependencies (asyncpg needs libpq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer cache)
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copy source
COPY . .

# Run Alembic migrations then start Uvicorn
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
