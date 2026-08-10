# Checkpoint F6 — Freeze do MVP acadêmico

**Data:** 2026-08-10  
**Branch:** `feature/faculdade-mvp`  
**Commit de código (F1–F5):** `53828dd` (`feat(web): harden faculty demo UX and hide dead surfaces (F5)`)  
**Escopo F6:** freeze + smoke real + roteiro + checkpoint documental. **Sem** feature nova, merge, PR automático ou alteração de infra/API/contratos.

## Congelamento

| Item | Estado |
|---|---|
| F1–F5 | Congelados |
| Fase 3 | Congelada |
| Fase 4.1 | Encerrada |
| ADR-011 / 4.2 | Congelados |
| 4.2-C1 | Bloqueado até nova autorização |

## Smoke F6 (navegador local)

Jornada executada ponta a ponta:

Home visitante → Login → Home autenticada → Corridas → Detalhe (Meia Maratona) → Inscrição → Meus kits → Perfil → Logout → Login novamente.

Também verificado: `/playground` → Home; nav/footer aprovados; sem `example.com` na jornada; sessão HttpOnly; logout encerra UI autenticada.

**Blockers de apresentação:** nenhum.

## Dívidas pós-MVP (não corrigidas no F6)

- Avisos de hydration do Next em páginas Home/Login (dev overlay) — não bloqueiam o fluxo.
- Título HTML de `/kits` ainda referencia “Retirada de Kits” (cosmético).
- Footers legados em superfícies Kit Pickup fora do roteiro.
- Evolução UX/a11y (clean, TDAH, daltonismo, teclado) — etapa dedicada pós-apresentação.

## Artefatos

- Roteiro: `docs/testing/faculdade-mvp-demo-script.md`
- Credenciais seed: `apps/api/src/auth/README.md`

## Próximo passo (exige nova autorização)

Após a apresentação acadêmica: retomar arquitetura em **4.2-C1** (ou etapa UX/a11y), sem reabrir F1–F5 neste freeze.
