# 09 — Review Checklist

Lista de verificação para code reviews.

## Antes de abrir o PR

- [ ] Branch atualizada com `develop`
- [ ] Build passa: `pnpm --filter web build`
- [ ] Lint sem erros: `pnpm --filter web lint`
- [ ] Sem `console.log` ou código comentado
- [ ] Sem arquivos desnecessários (`.env`, `node_modules/`, `.next/`)
- [ ] Commit messages seguem Conventional Commits

## Arquitetura

- [ ] Código está na pasta correta (ver `01-folder-structure.md`)
- [ ] Feature não importa internals de outra feature
- [ ] Componentes de `components/ui/` não contêm lógica de negócio
- [ ] Rotas em `app/` são finas — delegam para `features/`
- [ ] Barrel exports (`index.ts`) atualizados

## Código

- [ ] TypeScript sem `any`
- [ ] Props tipadas com interface
- [ ] `"use client"` apenas quando necessário
- [ ] Imports organizados (React → externos → internos)
- [ ] Nomes claros e em inglês
- [ ] Sem duplicação — código reutilizável extraído

## UI e acessibilidade

- [ ] HTML semântico (`button`, `nav`, `main`, `label`)
- [ ] Imagens com `alt`
- [ ] Navegável por teclado
- [ ] Contraste adequado
- [ ] Responsivo (mobile-first)

## Performance

- [ ] `next/image` para imagens (não `<img>`)
- [ ] Sem imports desnecessários de bibliotecas pesadas
- [ ] Dados buscados no servidor quando possível
- [ ] Listas paginadas (não carregar tudo)

## Segurança

- [ ] Sem segredos no código
- [ ] Inputs validados
- [ ] Sem `dangerouslySetInnerHTML`
- [ ] Fetch via `services/`, não direto em componentes

## Testes

- [ ] Testes adicionados/atualizados para lógica nova
- [ ] Testes existentes continuam passando

## Documentação

- [ ] README da pasta atualizado (se nova feature ou componente)
- [ ] Devlog atualizado (se sprint concluído)
- [ ] Comentários apenas para lógica não óbvia

## Para o revisor

- Entender o **porquê**, não apenas o **o quê**
- Sugerir melhorias, não apenas apontar erros
- Aprovar quando o código atende aos critérios — não exigir perfeição
- Responder em até 1 dia útil
