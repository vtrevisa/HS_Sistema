Onde implementar a função deleteLead

1) Hook HTTP (onde fazer a chamada e tratar respostas)
- Arquivo: frontend/src/http/use-lead.ts
- Por que: centraliza as mutations/requests e tratamento (toasts, invalidation do cache via react-query). Já existe `deleteMutation` neste hook — apenas garanta que ele é retornado como `deleteLead`.
- Exemplo de retorno:

```ts
return {
  saveLeads: saveMutation,
  updateLead: updateMutation,
  deleteLead: deleteMutation, // <-- garantir que está aqui
  deleteLeadAttachment: deleteAttachmentMutation,
  leadsDB,
};
```

2) Container / Caller (onde adicionar confirmação e lógica de UI)
- Arquivo: frontend/src/components/Companies/index.tsx
- Por que: centraliza lógica do componente (confirmação, loading state, chamadas a hooks) e evita acoplar a tabela a lógica de API.
- Exemplo:

```ts
import { useLead } from '@/http/use-lead'
...
const { saveLeads, deleteLead } = useLead()

function handleDeleteLead(company: CompanyRequest) {
  if (!company?.id) return
  if (!confirm(`Deletar ${company.company}?`)) return
  deleteLead.mutate(company.id)
}

<CompaniesTable
  ...
  deleteLead={handleDeleteLead}
/>
```

3) Tabela (apenas UI)
- Arquivo: frontend/src/components/Companies/companies-table.tsx
- Por que: apenas invoca o handler recebido via props; mantém a tabela como componente apenas de apresentação.
- Exemplo:

```ts
interface CompaniesTableProps {
  ...
  deleteLead?: (company: CompanyRequest) => void
}

// botão de deletar
<Button onClick={() => deleteLead?.(company)} ...>
  <Trash2 size={14} />
</Button>
```

Boas práticas / melhorias opcionais
- Mostrar confirmação (no container) antes de deletar.
- Usar `deleteLead.mutate(id, { onMutate, onError, onSettled })` para otimistic update com `queryClient`.
- Desabilitar o botão quando `deleteLead.isLoading` ou gerenciar `deletingId` no estado para bloquear só o item sendo removido.
- Centralizar toasts/erros no `use-lead.ts` para consistência.

Resumo
- Implementar a ação real no `use-lead.ts` (já existe lá como mutation).
- No container `Companies/index.tsx` crie `handleDeleteLead` que chama `deleteLead.mutate(id)` e passe para a tabela.
- Na tabela apenas chame a prop `deleteLead?.(company)` no botão.

Se quiser, posso aplicar esses trechos como patches no seu repositório—diga apenas se prefere que eu os crie agora.