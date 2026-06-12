# ── Stage 1: build frontend ────────────────────────────────────────────────
FROM node:lts-alpine AS builder
WORKDIR /build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
ARG VITE_ALLOW_REGISTRATION=false
ENV VITE_ALLOW_REGISTRATION=$VITE_ALLOW_REGISTRATION
RUN cd frontend && npm run build
# Output lands in /build/pb_public (vite outDir = ../pb_public)

# ── Stage 2: PocketBase runtime ────────────────────────────────────────────
FROM alpine AS runtime

ARG POCKETBASE_VERSION=0.27.1
ARG TARGETARCH

RUN apk add --no-cache ca-certificates wget unzip && \
    case "${TARGETARCH}" in \
      amd64) ARCH=amd64 ;; \
      arm64) ARCH=arm64 ;; \
      *)     echo "Unsupported arch: ${TARGETARCH}"; exit 1 ;; \
    esac && \
    wget -qO /tmp/pb.zip \
      "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_${ARCH}.zip" && \
    unzip /tmp/pb.zip pocketbase -d /pb && \
    rm /tmp/pb.zip && \
    chmod +x /pb/pocketbase

WORKDIR /pb

COPY --from=builder /build/pb_public ./pb_public
COPY pb_migrations/ ./pb_migrations/
COPY pb_hooks/      ./pb_hooks/

EXPOSE 8090

# pb_data/ lives at /pb/pb_data — mount a volume here for persistence
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
