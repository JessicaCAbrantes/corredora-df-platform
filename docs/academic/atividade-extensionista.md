# Atividade Extensionista II — Corredora DF

Documentação acadêmica do projeto desenvolvido no curso de Ciência da Computação, complementar ao formulário institucional da Atividade Extensionista II.

## Identificação

| Campo | Informação |
|---|---|
| **Alunos** | Jéssica Costa de Abrantes ([jessicac.abrantes22@gmail.com](mailto:jessicac.abrantes22@gmail.com)) · Alan Rodrigues Soares ([albrant2023@gmail.com](mailto:albrant2023@gmail.com)) |
| **Curso** | Ciência da Computação |
| **Componente curricular** | Atividade Extensionista II |
| **Eixo curricular (material da disciplina)** | Transformação Digital para Pequenos Negócios — aplicado ao ecossistema de corrida de rua no DF |
| **Título do projeto** | Corredora DF |
| **Modalidade** | Projeto de contexto à comunidade |
| **Submodalidade** | Projeto |
| **ODS** | [ODS 8 — Trabalho Decente e Crescimento Econômico](https://sdgs.un.org/goals/goal8) |
| **Área** | Tecnologia e desenvolvimento de soluções digitais |
| **Público-alvo** | Corredores do Distrito Federal e comunidade relacionada à corrida de rua |
| **Local / contexto** | Distrito Federal |
| **Situação** | Projeto acadêmico em desenvolvimento — MVP funcional congelado para apresentação |

## Repositório e evidências

| Recurso | Caminho |
|---|---|
| Código-fonte | [JessicaCAbrantes/corredora-df-platform](https://github.com/JessicaCAbrantes/corredora-df-platform) |
| Roteiro de demonstração | [faculdade-mvp-demo-script.md](../testing/faculdade-mvp-demo-script.md) |
| Checkpoint do MVP (F6) | [faculdade-mvp-f6-checkpoint.md](../testing/faculdade-mvp-f6-checkpoint.md) |

## Objetivo da atividade

Desenvolver uma proposta tecnológica que centralize e organize informações relevantes ao ecossistema de corrida de rua no Distrito Federal — eventos, inscrições, kits e serviços relacionados — oferecendo uma experiência digital coerente ao corredor.

A atividade não se limita à construção de interface: busca demonstrar integração entre frontend, backend, autenticação e persistência de dados, com validação de jornada real em ambiente local.

## Estrutura documental

| Documento | Conteúdo |
|---|---|
| [Fase 1 — Diagnóstico](./fase-1-diagnostico.md) | Contexto observado, necessidades identificadas e relação com o ODS 8 |
| [Fase 2 — Ação](./fase-2-acao.md) | Justificativa, objetivos, resultados esperados, materiais, metodologia e stack |
| [Fase 3 — Avaliação](./fase-3-avaliacao.md) | Resultados, jornada validada e limites do MVP |
| [Referências](./referencias.md) | Bibliografia e documentação técnica utilizada |

## Escopo do MVP acadêmico (congelado)

O MVP validado para apresentação cobre a jornada:

**Descobrir → Autenticar → Inscrever → Acompanhar → Sair**

Funcionalidades fora desse escopo (cadastro público, Treinos, Cupons/Parceiros/Blog como páginas, deploy em produção, containerização 4.2-C1) permanecem planejadas ou congeladas conforme checkpoint F6.

## Limites e transparência acadêmica

> O estado apresentado neste repositório corresponde ao **MVP acadêmico validado** para a Atividade Extensionista II.

> O sistema está em desenvolvimento e **não deve ser interpretado** como uma plataforma comercial pronta para produção.

- A plataforma **não está publicada** em ambiente de produção externo; a demonstração ocorre em execução local.
- O MVP **não deve ser apresentado** como produto comercial pronto ou com impacto econômico comprovado.
- Evoluções futuras (UX/acessibilidade, infraestrutura de staging, novas funcionalidades) dependem de autorização explícita após a apresentação acadêmica.

## Acessibilidade (escopo atual)

A plataforma **não deve ser descrita como totalmente acessível** neste marco.

Aspectos já considerados no MVP acadêmico incluem HTML semântico, landmarks, estados de loading em texto e diretrizes documentadas no repositório ([ADR-009](../architecture/adr/ADR-009-acessibilidade.md), [guia de engenharia](../engineering/05-accessibility.md)).

Evoluções planejadas — fora do escopo congelado — incluem revisão de contraste, foco/teclado, redução de carga cognitiva e adequações para daltonismo e neurodiversidade, conforme registrado no checkpoint F6.
