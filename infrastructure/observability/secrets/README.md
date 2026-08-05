# Local-only Prometheus bearer for scraping API GET /metrics (FASE 4.1-B).
#
# Setup:
#   cp bearer_token.example bearer_token
#
# Then set the SAME value on the API process:
#   METRICS_ENABLED=true
#   METRICS_BEARER_TOKEN=local-corredora-metrics-dev-token
#
# Never use this token (or this file) in staging/production.
# `bearer_token` is gitignored — do not commit real or shared secrets.
