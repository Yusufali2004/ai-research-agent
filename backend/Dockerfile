# ── Stage 1: Builder ──────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install dependencies into a separate layer for caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ──────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY app/ ./app/

# Cloud Run sets PORT env variable (default 8080)
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

# Run from inside the app/ directory so imports resolve correctly
CMD ["sh", "-c", "cd app && uvicorn main:app --host 0.0.0.0 --port $PORT"]
