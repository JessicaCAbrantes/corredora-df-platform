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
| **Alunos(as)** | Jéssica Costa de Abrantes e Alan Rodrigues Soares |
| **Curso** | Ciência da Computação |
| **Componente Curricular** | Atividade Extensionista II |
| **Título do projeto** | Corredora DF |
| **Modalidade** | Projeto de contexto à comunidade |
| **Submodalidade** | Projeto |
| **ODS** | ODS 8 — Trabalho Decente e Crescimento Econômico |
| **Área do conhecimento** | Tecnologia e desenvolvimento de soluções digitais |
| **Público-alvo** | Corredores do Distrito Federal e comunidade relacionada à corrida de rua |
| **Local/contexto** | Distrito Federal |
| **Situação** | Projeto acadêmico em desenvolvimento |

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

- Home pública;
- Identidade visual inicial;
- Login;
- Sessão autenticada;
- Home autenticada;
- Listagem de corridas;
- Detalhes de corrida;
- Inscrição em corrida;
- Meus kits;
- Perfil;
- Logout;
- Persistência em PostgreSQL;
- Integração entre frontend e backend;
- Jornada principal de usuário validada.

---

## 🚧 Planejado para etapas futuras

- Cadastro público;
- Página completa de parceiros;
- Sistema de cupons;
- Comunidade;
- Blog;
- Treinos;
- Assessoria esportiva;
- Melhorias avançadas de acessibilidade;
- Ambiente de staging;
- Containerização;
- Deploy externo;
- Evolução da infraestrutura;
- Melhorias de segurança e observabilidade.

---

## 🦋 Jornada principal do MVP

A jornada acadêmica atualmente validada é:

**Descobrir → Autenticar → Inscrever → Acompanhar → Sair**

```text
Visitante
   │
   ▼
Home
   │
   ▼
Login
   │
   ▼
Home autenticada
   │
   ▼
Corridas
   │
   ▼
Detalhes da corrida
   │
   ▼
Inscrição
   │
   ▼
Meus kits
   │
   ▼
Perfil
   │
   ▼
Logout
   │
   ▼
Home visitante
```
---
## ♿ Usabilidade e acessibilidade

A experiência do projeto considera a necessidade de criar uma interface
simples e compreensível para diferentes perfis de usuários.

Entre os aspectos considerados estão:

- redução de elementos visuais desnecessários;
- hierarquia visual clara;
- textos objetivos;
- navegação simplificada;
- estados de carregamento e erro;
- preocupação com contraste;
- uso de elementos que não dependam exclusivamente de cores;
- preocupação com usuários com daltonismo/discromatopsia;
- possibilidade de evolução para navegação por teclado;
- evolução futura de recursos de acessibilidade.

Esses aspectos fazem parte da evolução planejada do projeto e ainda serão
aprofundados em etapas futuras.
---

## 🏗️ Arquitetura

A arquitetura atual do MVP pode ser representada de forma simplificada:
```
┌────────────────────┐
│      Next.js       │
│       Web          │
└─────────┬──────────┘
          │
          │ HTTP
          │ Cookie HttpOnly
          ▼
┌────────────────────┐
│      NestJS        │
│       API          │
└─────────┬──────────┘
          │
          │ Prisma
          ▼
┌────────────────────┐
│    PostgreSQL      │
└────────────────────┘
```

---
## Status

🚧 **Em desenvolvimento — MVP acadêmico funcional**

O projeto encontra-se em desenvolvimento e, para fins da Atividade
Extensionista II, possui um MVP funcional com a jornada principal validada
em ambiente local.

O estado atual não representa uma plataforma comercial pronta para produção.

Funcionalidades adicionais, melhorias de infraestrutura, acessibilidade,
segurança e publicação externa permanecem planejadas para etapas futuras.

## Setup rápido (local)

1. Instalar dependências: `pnpm install`
2. Subir Postgres (+ Prometheus/Grafana opcional): `docker compose -f infrastructure/docker-compose.yml up -d` (Postgres **5433**, Prometheus **9090**, Grafana **3002**)
3. Copiar envs:
   - `cp apps/api/.env.example apps/api/.env` — substituir `AUTH_SECRET`
   - `cp apps/web/.env.example apps/web/.env.local`
4. Migrar / seed (API): ver scripts em `apps/api`
5. Rodar apps via Turborepo / filtros `api` e `web`
6. (Opcional) Observabilidade local: [docs/platform/observability-local.md](./docs/platform/observability-local.md) · [docs/platform/grafana-local.md](./docs/platform/grafana-local.md)

---
## Variáveis de ambiente

Documentação completa (API, Web, Docker, CI):

**[docs/setup/environment.md](./docs/setup/environment.md)**

Templates (sem secrets reais):

| App | Template | Arquivo local (gitignored) |
|---|---|---|
| API | [`apps/api/.env.example`](./apps/api/.env.example) | `apps/api/.env` |
| Web | [`apps/web/.env.example`](./apps/web/.env.example) | `apps/web/.env.local` |

---
## Documentação

Índice: [`docs/README.md`](./docs/README.md)

---

## 🔗 Links do projeto

### 💻 Repositório

[GitHub — Corredora DF](https://github.com/JessicaCAbrantes/corredora-df-platform)

Repositório contendo o código-fonte, documentação, histórico de desenvolvimento
e materiais técnicos do projeto.

### 🌐 Plataforma

**Ambiente de demonstração:** execução local durante a apresentação acadêmica.

> A aplicação atualmente é executada em ambiente local, não estando publicada
> em ambiente de produção externo.

### 📚 Documentação acadêmica

- [Índice da documentação](./docs/README.md)
- [Roteiro da demonstração acadêmica](./docs/testing/faculdade-mvp-demo-script.md)
- [Checkpoint do MVP acadêmico](./docs/testing/faculdade-mvp-f6-checkpoint.md)

### 🧪 Documentação técnica

- [Configuração do ambiente](./docs/setup/environment.md)
- [Observabilidade local](./docs/platform/observability-local.md)
- [Grafana local](./docs/platform/grafana-local.md)

### 📝 Atividade Extensionista

A documentação relacionada à Atividade Extensionista II apresenta o
contexto da atividade, diagnóstico realizado, objetivos, metodologia,
execução, resultados e referências utilizadas.

- [Documentação da Atividade Extensionista](./docs/academic/atividade-extensionista.md)
- [Fase 1 — Diagnóstico e público](./docs/academic/fase-1-diagnostico.md)
- [Fase 2 — Ação extensionista](./docs/academic/fase-2-acao.md)
- [Fase 3 — Avaliação da ação](./docs/academic/fase-3-avaliacao.md)
- [Referências](./docs/academic/referencias.md)

> Os documentos acadêmicos complementam as informações apresentadas no
> formulário da instituição de ensino.

### 🎥 Demonstração

A demonstração acadêmica apresenta a jornada principal do MVP:

**Descobrir → Autenticar → Inscrever → Acompanhar → Sair**

O material audiovisual e/ou fotográfico utilizado como evidência da
atividade extensionista é apresentado conforme solicitado pela instituição
de ensino.

---

## 📄 Licença

Este repositório está sob **licença proprietária (All Rights Reserved)**.
O código e a documentação **não são open source** e não podem ser copiados,
redistribuídos, utilizados comercialmente ou transformados em obras derivadas
sem autorização prévia por escrito dos autores.

A visibilidade pública é **temporária**, exclusivamente para avaliação acadêmica
pela instituição de ensino. Após aprovação do projeto, o repositório retornará
à visibilidade privada.

Consulte o arquivo [LICENSE](./LICENSE) para os termos completos.

---

## ⚠️ Aviso acadêmico

Este repositório faz parte de um projeto acadêmico de graduação.

O sistema está em desenvolvimento e não deve ser interpretado como uma
plataforma comercial pronta para produção.

Funcionalidades, arquitetura, segurança, infraestrutura e experiência do
usuário poderão ser modificadas nas próximas etapas do projeto.

O estado apresentado neste repositório corresponde ao MVP acadêmico
validado para a atividade extensionista.

