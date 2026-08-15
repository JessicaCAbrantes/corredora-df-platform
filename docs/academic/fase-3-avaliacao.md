# Fase 3 — Avaliação da ação

Avaliação dos resultados da Atividade Extensionista II e do MVP acadêmico Corredora DF.

## Contexto da avaliação

A atividade foi desenvolvida a partir de uma necessidade observada diretamente no contexto da corrida de rua no Distrito Federal.

O contato com a influenciadora Jenifer, do Corredora DF ([@corredoradf](https://www.instagram.com/corredoradf/)), e a participação em uma corrida de rua permitiram observar na prática dificuldades relacionadas à divulgação e organização das informações.

Durante a experiência, foi possível perceber como informações sobre eventos, inscrições, kits, parceiros e serviços podem estar distribuídas em diferentes canais. A partir dessa observação, foi desenvolvida a proposta da plataforma Corredora DF.

## Evolução do projeto

```text
diagnóstico
  → planejamento
  → requisitos
  → identidade visual
  → Home
  → autenticação
  → frontend/backend
  → corridas
  → inscrição
  → kits
  → testes
  → validação (F6)
```

## Resultado alcançado

A plataforma possui, no MVP acadêmico congelado:

| Capacidade | Estado |
|---|---|
| Home pública (visitante) | ✅ |
| Identidade visual inicial | ✅ |
| Login | ✅ |
| Sessão autenticada (cookie HttpOnly) | ✅ |
| Home autenticada | ✅ |
| Listagem de corridas | ✅ |
| Detalhes de corrida | ✅ |
| Inscrição em evento | ✅ |
| Meus kits (acompanhamento) | ✅ |
| Perfil | ✅ |
| Logout | ✅ |
| Persistência em PostgreSQL | ✅ |
| Integração frontend ↔ backend | ✅ |

## Jornada validada

A jornada oficial da demonstração acadêmica:

**Descobrir → Autenticar → Inscrever → Acompanhar → Sair**

Passos executados no smoke F6:

1. Home visitante
2. Login (`runner@corredora.df` — usuário seed, ambiente local)
3. Home autenticada
4. Corridas → Meia Maratona de Brasília
5. Inscrição (confirmada / já inscrito)
6. Meus kits
7. Perfil
8. Logout → Home visitante com **Entrar** visível

Evidências: [faculdade-mvp-f6-checkpoint.md](../testing/faculdade-mvp-f6-checkpoint.md) · [faculdade-mvp-demo-script.md](../testing/faculdade-mvp-demo-script.md).

## Método de validação

A validação foi realizada em **ambiente local** com:

- navegador (jornada real);
- API NestJS (`/health/ready`, endpoints de auth e eventos);
- PostgreSQL via Docker Compose;
- verificação de sessão, loading states e ausência de 404 no roteiro da demo.

Testes automatizados complementares existem nas suítes Web e API do repositório; a evidência principal para a faculdade é a **jornada funcional demonstrável**.

## Limites declarados

- A plataforma **não está pronta para produção** pública.
- Não há deploy externo no escopo do MVP acadêmico.
- Placeholders visuais (imagens de capa) permanecem em algumas superfícies.
- Funcionalidades futuras (cadastro, Treinos, marketplace de parceiros, UX/acessibilidade ampliada, containerização 4.2-C1) estão **planejadas**, não entregues neste marco.

## Contribuição da atividade

A atividade extensionista demonstrou que é possível transformar um diagnóstico de campo em uma **plataforma web funcional**, conectando:

- experiência do usuário;
- autenticação;
- API e persistência;
- fluxo de negócio mínimo (inscrição e acompanhamento).

Isso atende ao objetivo acadêmico de aplicar conhecimentos de Ciência da Computação a um problema real da comunidade local, com escopo e transparência sobre limitações do MVP.

## Avaliação dos objetivos

Avaliação em relação aos [objetivos específicos](./fase-2-acao.md#objetivos-específicos) definidos na Fase 2:

| # | Objetivo específico | Avaliação | Evidência |
|---|---|---|---|
| 1 | Diagnosticar necessidades do ecossistema de corrida no DF | ✅ Atingido | [Fase 1](./fase-1-diagnostico.md): contato com @corredoradf, participação em corrida, problema da fragmentação |
| 2 | Definir escopo de MVP focado na jornada do corredor | ✅ Atingido | Jornada congelada em F6; escopo documentado em [atividade-extensionista.md](./atividade-extensionista.md) |
| 3 | Desenvolver interface web com identidade visual e navegação da demo | ✅ Atingido | Home visitante/autenticada, Butterfly UI, roteiro da demonstração |
| 4 | Implementar autenticação, sessão e logout com integração front/API | ✅ Atingido | Login, cookie HttpOnly, logout validados no smoke F6 |
| 5 | Corridas, inscrição, kits e persistência em PostgreSQL | ✅ Atingido | Roteiro F6 e [checkpoint F6](../testing/faculdade-mvp-f6-checkpoint.md): listagem → detalhe → inscrição → Meus kits; integração API + Prisma + PostgreSQL |
| 6 | Validar jornada completa em ambiente local (F6) | ✅ Atingido | [Checkpoint F6](../testing/faculdade-mvp-f6-checkpoint.md) — sem blockers de apresentação |
| 7 | Documentar resultados, limites e evidências | ✅ Atingido | Fases 1–3, referências, roteiro e material audiovisual institucional |

Nenhum objetivo específico foi registrado como não atingido neste marco. Funcionalidades **fora** dos objetivos acima (cadastro público, Treinos, marketplace, deploy, UX/a11y ampliada) permanecem **planejadas**, conforme [Limites declarados](#limites-declarados).

## Próximos passos (fora do escopo atual)

Após a apresentação acadêmica, evoluções possíveis — todas sujeitas a nova autorização:

- etapa dedicada de UX e acessibilidade;
- retomada da arquitetura de deploy (4.2-C1+);
- expansão funcional conforme backlog de produto.
