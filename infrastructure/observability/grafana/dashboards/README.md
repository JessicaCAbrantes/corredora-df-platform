# Official Grafana dashboards (as code) live here.
#
# FASE 4.1-C2: `payments-ops-v1.json` — Dashboard Contract D3-A (four panels only).
# FASE 4.1-C3: edit → export → commit — see docs/platform/dashboard-as-code.md
#
# Conventions (frozen):
# - uid: `payments-ops-v1` (never auto-generated)
# - refresh: 30s
# - datasource: Prometheus (uid `prometheus`)
# - aggregations: counters/histograms → sum/rate/quantile; DB gauges → max() never sum()
#
# Do not hand-edit JSON for visual changes. Edit in local Grafana, export, replace this file,
# review the diff, preserve uid. Panel titles/set require D3-A contract update first.
#
# This directory is mounted read-only into Grafana. Git remains the source of truth.
