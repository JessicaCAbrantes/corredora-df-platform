# Modal

Componente de diálogo e overlay.

## Objetivo

Exibir conteúdo sobreposto à página — confirmações, formulários rápidos, detalhes expandidos.

## Exemplos de uso

```tsx
<Modal open={isOpen} onClose={handleClose} title="Confirmar inscrição">
  <p>Deseja se inscrever neste evento?</p>
  <Modal.Actions>
    <Button variant="outline" onClick={handleClose}>Cancelar</Button>
    <Button onClick={handleConfirm}>Confirmar</Button>
  </Modal.Actions>
</Modal>
```

## Boas práticas

- Bloquear scroll do body quando aberto.
- Fechar com `Escape` e clique no overlay.
- Gerenciar foco (focus trap) para acessibilidade.
- Usar `role="dialog"` e `aria-modal="true"`.
