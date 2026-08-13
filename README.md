# 🦋 Corredora DF

Plataforma digital para corredores do Distrito Federal

> Projeto acadêmico desenvolvido no âmbito da Atividade Extensionista II
> do curso de Ciência da Computação.

---

## 👥 Equipe

**Jéssica Costa de Abrantes**
📧 jessicac.abrantes22@gmail.com

**Alan Rodrigues Soares**
📧 albrant2023@gmail.com

---

## 🎓 Informações acadêmicas

| Item | Informação |
|---|---|
| Curso | Ciência da Computação |
| Componente curricular | Atividade Extensionista II |
| Modalidade | Projeto de contexto à comunidade |
| Submodalidade | Projeto |
| ODS | ODS 8 — Trabalho Decente e Crescimento Econômico |
| Área | Tecnologia e desenvolvimento de soluções digitais |

---

## 📌 Sobre o projeto

O Corredora DF é uma plataforma web concebida para centralizar e organizar
informações relacionadas à corrida de rua no Distrito Federal.

A proposta surgiu a partir da observação do contexto local e do contato com
a comunidade de corredores, identificando dificuldades relacionadas à
dispersão de informações sobre corridas, inscrições, kits, parceiros e
serviços relacionados ao esporte.

O projeto busca utilizar a tecnologia para proporcionar uma experiência
digital mais organizada, simples e acessível aos corredores.

---

## 🌎 Contexto da atividade extensionista

A corrida de rua possui forte presença na comunidade esportiva do Distrito
Federal, reunindo corredores iniciantes e experientes e movimentando eventos,
organizadores, assessorias esportivas, influenciadores e parceiros.

Durante a atividade extensionista, houve contato com a influenciadora
Jenifer, do Corredora DF (@corredoradf), e participação em uma corrida de rua,
possibilitando observar diretamente o contexto e identificar oportunidades
de melhoria na divulgação e organização das informações disponíveis aos
corredores.

A partir dessa experiência foi definida a proposta de desenvolvimento da
plataforma.

---

## 🎯 Objetivo

### Objetivo geral

Desenvolver uma plataforma digital capaz de organizar informações sobre
corridas de rua no Distrito Federal e proporcionar uma jornada mais simples
ao corredor, desde a descoberta de eventos até sua inscrição e
acompanhamento.

### Objetivos específicos

- Centralizar informações relacionadas às corridas;
- Facilitar a descoberta de eventos;
- Permitir autenticação de usuários;
- Permitir consulta de detalhes das corridas;
- Implementar inscrição em eventos;
- Permitir acompanhamento das inscrições e kits;
- Aplicar conhecimentos de desenvolvimento web e banco de dados;
- Considerar aspectos de usabilidade e acessibilidade;
- Demonstrar como a transformação digital pode apoiar iniciativas locais.

---

## 🌱 ODS relacionado

### ODS 8 — Trabalho Decente e Crescimento Econômico

O projeto está relacionado ao ODS 8 por utilizar tecnologia para fortalecer
um ecossistema local envolvendo corredores, eventos, organizadores,
influenciadores, assessorias e parceiros.

A plataforma busca contribuir para a organização e divulgação desse
ecossistema, facilitando o acesso às informações e criando uma infraestrutura
digital que poderá futuramente apoiar pequenos empreendedores e prestadores
de serviços relacionados ao esporte.

---

## 🧩 Problema identificado

As informações relacionadas às corridas frequentemente encontram-se
distribuídas entre diferentes canais:

- redes sociais;
- páginas de organizadores;
- plataformas de inscrição;
- páginas de assessorias;
- publicações de influenciadores;
- informações relacionadas à retirada de kits.

Essa fragmentação pode dificultar a localização das informações pelo corredor.

O Corredora DF surge como uma proposta de centralização dessas informações
em uma experiência digital direcionada ao público do Distrito Federal.

---

## 💻 Tecnologias

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- NestJS
- Node.js
- Prisma

### Banco de dados

- PostgreSQL

### Desenvolvimento

- Git
- GitHub
- VS Code

---

## 🔐 Funcionalidades implementadas

O MVP acadêmico atualmente contempla:

- Home pública;
- autenticação de usuários;
- sessão utilizando cookie HttpOnly;
- Home autenticada;
- listagem de corridas;
- detalhes de corrida;
- inscrição em corrida;
- acompanhamento de kits;
- perfil do usuário;
- logout;
- persistência de dados;
- integração frontend/backend.

### Jornada principal


Visitante
   ↓
Home
   ↓
Login
   ↓
Home autenticada
   ↓
Corridas
   ↓
Detalhes da corrida
   ↓
Inscrição
   ↓
Meus kits
   ↓
Perfil
   ↓
Logout


## Status

🚧 Em desenvolvimento

## Setup rápido (local)

1. Instalar dependências: `pnpm install`
2. Subir Postgres (+ Prometheus/Grafana opcional): `docker compose -f infrastructure/docker-compose.yml up -d` (Postgres **5433**, Prometheus **9090**, Grafana **3002**)
3. Copiar envs:
   - `cp apps/api/.env.example apps/api/.env` — substituir `AUTH_SECRET`
   - `cp apps/web/.env.example apps/web/.env.local`
4. Migrar / seed (API): ver scripts em `apps/api`
5. Rodar apps via Turborepo / filtros `api` e `web`
6. (Opcional) Observabilidade local: [docs/platform/observability-local.md](./docs/platform/observability-local.md) · [docs/platform/grafana-local.md](./docs/platform/grafana-local.md)

## Variáveis de ambiente

Documentação completa (API, Web, Docker, CI):

**[docs/setup/environment.md](./docs/setup/environment.md)**

Templates (sem secrets reais):

| App | Template | Arquivo local (gitignored) |
|---|---|---|
| API | [`apps/api/.env.example`](./apps/api/.env.example) | `apps/api/.env` |
| Web | [`apps/web/.env.example`](./apps/web/.env.example) | `apps/web/.env.local` |

## Documentação

Índice: [`docs/README.md`](./docs/README.md)
