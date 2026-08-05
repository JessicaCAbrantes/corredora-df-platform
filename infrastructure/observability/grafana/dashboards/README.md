# Official Grafana dashboards (as code) live here.
#
# FASE 4.1-C2: `payments-ops-v1.json` — Dashboard Contract D3-A (four panels only).
#
# Conventions (frozen):
# - uid: `payments-ops-v1` (never auto-generated)
# - refresh: 30s
# - datasource: Prometheus (uid `prometheus`)
# - aggregations: counters/histograms → sum/rate/quantile; DB gauges → max() never sum()
#
# This directory is mounted read-only into Grafana. Git remains the source of truth.
