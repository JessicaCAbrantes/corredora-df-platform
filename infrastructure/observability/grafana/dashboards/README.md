# Official Grafana dashboards (as code) live here.
#
# FASE 4.1-C1: provider is wired; no payment dashboards yet.
# FASE 4.1-C2: add payments-ops-v1.json (uid must be exactly `payments-ops-v1`).
#
# Conventions (frozen):
# - uid: stable string matching the Dashboard Contract (e.g. payments-ops-v1)
# - refresh: 30s
# - datasource: Prometheus (uid `prometheus`)
# - aggregations: counters/histograms → sum/rate/quantile; DB gauges → max() never sum()
#
# This directory is mounted read-only into Grafana. Git remains the source of truth.
