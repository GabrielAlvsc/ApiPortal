# Documentação das APIs de Segmentos

## Endpoints

### GET `/categories/:id`

Retorna uma categoria específica junto com seus modelos associados.

**Parâmetros:**
- `id`: ID da categoria.

**Resposta de Sucesso:**
```json
{
  "id": "number",
  "name": "string",
  "models": [
    {
      "id": "number",
      "title": "string",
      "active": "boolean",
      ...
    }
  ],
  ...
}
```

**Resposta de Erro:**
```json
{
  "message": "Ocorreu um erro para processar sua solicitação"
}
```

---

### GET `/categories`

Retorna todas as categorias.

**Resposta de Sucesso:**
```json
[
  {
    "id": "number",
    "name": "string",
    ...
  },
  ...
]
```

**Resposta de Erro:**
```json
{
  "message": "Ocorreu um erro para processar sua solicitação"
}
```