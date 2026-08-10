# Faculty MVP — roteiro de apresentação (F6)

**Status:** freeze F1–F5 · validado no smoke F6  
**Branch:** `feature/faculdade-mvp` · base/checkpoint código: `53828dd`  
**Fora do escopo da demo:** cadastro, Treinos, Cupons/Parceiros/Blog/Comunidade como páginas, Kit Pickup ops/pagamento, `/playground`, infra 4.2.

---

## 1. Credencial de demonstração

| Campo | Valor |
|---|---|
| E-mail | `runner@corredora.df` |
| Senha | `corredora123` |

Fonte: `apps/api/src/auth/README.md` (Dev seed credentials). **Somente local/CI.**

Corridas recomendadas (seed, inscrição aberta + kit):

- **Meia Maratona de Brasília** — `/corridas/meia-maratona-brasilia`
- **5K Asa Norte** — `/corridas/5k-asa-norte`

---

## 2. Comandos para subir o ambiente

Na raiz do monorepo:

```bash
# 1) Postgres (Compose do projeto — porta local típica :5433)
docker compose up -d

# 2) Migrações + seed (API)
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed

# 3) Serviços (dois terminais)
pnpm --filter api dev
pnpm --filter web dev
```

Checagens rápidas:

- API ready: `GET http://localhost:3001/health/ready` → `{"status":"ready","database":"up"}`
- Web: `http://localhost:3000` → HTTP 200

---

## 3. Roteiro numerado (~5–8 min)

| # | Passo | URL / ação | Estado esperado |
|---|---|---|---|
| 1 | Home visitante | `/` | Nav: Home · Corridas · Meus kits. CTA **Entrar**. Eventos em destaque. Teasers Cupons/Parceiros/Blog **não clicáveis** (“Em breve”). Footer só rotas reais. Sem imagens `example.com`. |
| 2 | Login | Navbar **Entrar** ou `/auth/login` | Formulário e-mail/senha. Loading **Entrando…** no submit. |
| 3 | Home autenticada | redirect `/` | Hero com saudação (ex.: “Bom dia, runner!”). Ações: Meus kits · Perfil · Minhas inscrições · **Sair**. |
| 4 | Corridas | `/corridas` | Lista de provas do seed (abertas / encerradas / em breve). |
| 5 | Detalhe | abrir Meia Maratona (ou 5K Asa Norte) | Título, data, local, **Inscreva-se**. Regulamento = âncora `#regulamento` (não 404). |
| 6 | Inscrição | clicar **Inscreva-se** | Status **Inscrição confirmada** + atalhos Ver meus kits / Minhas inscrições. Se já inscrita: mensagem de já inscrito + mesmos atalhos. |
| 7 | Meus kits | `/kits` | Kit da prova inscrita (somente leitura). Empty state amigável se não houver inscrição. |
| 8 | Perfil | `/perfil` | E-mail `runner@corredora.df` e id seed. |
| 9 | Logout | **Sair** | Loading **Saindo…** → Home visitante com **Entrar** de novo. Sessão encerrada. |
| 10 | Login novamente | `/auth/login` | Mesma credencial → Home autenticada. |

**Não abrir na apresentação:** `/playground` (redireciona para `/`), páginas de Cupons/Parceiros/Blog, fluxo Kit Pickup de pagamento/ops.

---

## 4. Checklist de validação (smoke)

- [ ] Console: sem erro bloqueante na jornada (avisos de hydration do Next em dev podem aparecer — não interrompem o fluxo)
- [ ] Network: rotas do roteiro HTTP 200; API `GET /api/v1/auth/me` autenticado após login
- [ ] Cookie: sessão `corredora_session` HttpOnly (não aparece em `document.cookie`)
- [ ] Loading: Entrando… / Saindo… / Carregando seus kits…
- [ ] Empty / error: empty de kits e erros de API com mensagem legível (sem improvisar)
- [ ] Sem 404 nas URLs do roteiro
- [ ] Seed: eventos + usuário demo
- [ ] API + Web + PostgreSQL up
- [ ] Navbar e Footer da Home só com rotas aprovadas
- [ ] Sem CTAs do roteiro para rota morta; teasers sem link
- [ ] Sem capas `example.com` na jornada
- [ ] Logout realmente volta ao modo visitante

---

## 5. Plano B (serviço não sobe)

| Problema | Ação |
|---|---|
| Docker / Postgres down | `docker compose up -d`; conferir porta `:5433` e `DATABASE_URL` da API |
| Migração / seed quebrada | Em **dev local** apenas: reset de volume Compose se o banco estiver inconsistente → `prisma migrate deploy` + `prisma:seed`. Não usar em produção. |
| API não responde | Reiniciar `pnpm --filter api dev`; checar `:3001/health/ready` |
| Web não responde | Reiniciar `pnpm --filter web dev`; abrir `:3000` |
| Login falha | Confirmar seed; e-mail/senha da tabela acima; cookie de outro ambiente limpo |
| “Já inscrito” no meio da demo | Continuar com atalhos **Meus kits** / cancelar em Minhas inscrições **só se precisar** repetir inscrição |
| Overlay de erro do Next (dev) | Fechar o badge; jornada segue. Não redesenhar nem “consertar” na hora |

---

## 6. Pós-MVP (não fazer agora)

Etapa futura sugerida: **UX + acessibilidade** (interface mais clean, menor carga cognitiva, hierarquia, estados sem depender só de cor, contraste/daltonismo, foco/teclado, consistência, responsividade).

Arquitetura: retomar **4.2-C1** somente com nova autorização explícita (Fase 3 / 4.1 / ADR-011 congelados; 4.2-C1 bloqueado até lá).
