# 05 — Accessibility

Padrões de acessibilidade (a11y) para a plataforma.

## Princípio

A Plataforma Corredora DF deve ser utilizável por todos — corredores com qualquer capacidade, em qualquer dispositivo.

## Requisitos mínimos

### HTML semântico

```tsx
// ✅ Correto
<nav aria-label="Navegação principal">
  <ul>
    <li><a href="/events">Eventos</a></li>
  </ul>
</nav>

<main>
  <h1>Eventos</h1>
  <article>...</article>
</main>

// ❌ Evitar
<div onClick={goToEvents}>Eventos</div>
```

Usar elementos nativos: `<button>`, `<a>`, `<input>`, `<nav>`, `<main>`, `<section>`.

### Labels e ARIA

```tsx
// Inputs sempre com label associado
<label htmlFor="email">E-mail</label>
<input id="email" type="email" />

// Ou aria-label quando label visual não é possível
<button aria-label="Fechar modal" onClick={onClose}>
  <CloseIcon />
</button>

// Estados dinâmicos
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? "Carregando..." : "Inscrever-se"}
</button>
```

### Foco e navegação por teclado

- Toda ação interativa acessível via `Tab` + `Enter`/`Space`.
- Modais: focus trap + fechar com `Escape`.
- Skip link no topo da página para pular navegação.

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Pular para o conteúdo
</a>
```

### Contraste e cor

- Razão de contraste mínima: **4.5:1** para texto normal, **3:1** para texto grande.
- Nunca comunicar informação apenas por cor — usar ícone ou texto complementar.

```tsx
// ✅ Status com cor + texto
<Badge variant="success">Confirmado</Badge>

// ❌ Apenas cor
<div className="bg-green-500" />
```

### Imagens

```tsx
// Informativa
<img src={event.cover} alt="Maratona de Brasília 2026" />

// Decorativa
<img src={pattern} alt="" role="presentation" />
```

## Checklist por componente

- [ ] Elemento HTML semântico correto
- [ ] `aria-label` ou `<label>` em campos de formulário
- [ ] Navegável por teclado
- [ ] Contraste adequado (verificar com DevTools)
- [ ] `alt` em imagens
- [ ] Estados (`loading`, `disabled`, `error`) comunicados visualmente e para leitores de tela

## Ferramentas

- **Lighthouse** (Chrome DevTools) — auditoria automática
- **axe DevTools** — extensão para testes de a11y
- **NVDA / VoiceOver** — teste manual com leitor de tela

## Referência

Seguimos as diretrizes [WCAG 2.1 nível AA](https://www.w3.org/TR/WCAG21/).
