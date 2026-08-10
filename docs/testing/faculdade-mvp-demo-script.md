# Faculty MVP — roteiro F4 (Corridas → Meus kits)

Fluxo escolhido após micro-auditoria: **mais estável** que Kit Pickup completo (sem pagamento mock, allowlist de ops ou máquina de estados).

## Pré-requisitos

1. Postgres Compose up (`:5433`)
2. `pnpm --filter api prisma:migrate` + `prisma:seed`
3. API `:3001` + Web `:3000`
4. Login seed: ver `apps/api/src/auth/README.md` (Dev seed credentials)

## Roteiro ao vivo (~5–8 min)

1. Home (visitante) → **Entrar**
2. Login → Home autenticada
3. **Corridas** → abrir **Meia Maratona de Brasília** (`meia-maratona-brasilia`) ou **5K Asa Norte**
4. **Inscreva-se** → feedback + atalhos
5. **Meus kits** → kit da inscrição
6. **Perfil** → **Sair** → Login de novo

## Notas

- Se já inscrita: CTA mostra “Você já está inscrito” + mesmos atalhos; cancelar em Minhas inscrições para repetir.
- Kit Pickup (termo/pagamento/ops) fica **fora** deste F4 — stretch opcional depois da apresentação.
- Capas `example.com` do seed são omitidas na Web (placeholder Butterfly).
