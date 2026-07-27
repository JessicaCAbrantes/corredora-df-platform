# assets/

Recursos estáticos importados pelo código.

## Objetivo

Armazenar imagens, ícones SVG e fontes que são importados diretamente nos componentes, com otimização e hash do bundler.

## Exemplos de uso

```tsx
import logo from "@/assets/logo.svg";

<img src={logo.src} alt="Corredora DF" />
```

## Diferença para `public/`

- `public/` — arquivos servidos pela URL raiz (`/logo.png`), sem processamento.
- `assets/` — arquivos importados via `import`, processados pelo bundler.

## Boas práticas

- Usar `assets/` para recursos que precisam de otimização (imagens, SVGs inline).
- Usar `public/` para favicons, `robots.txt` e arquivos estáticos por URL.
- Organizar por tipo: `assets/images/`, `assets/icons/`, `assets/fonts/`.
