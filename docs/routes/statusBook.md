# Documentação das APIs de StatusBook

## Endpoints

### POST `/statusBook/:idBook`

Altera o status de um livro específico.

**Parâmetros:**
- `idBook`: ID do livro.

**Corpo da Requisição:**
```json
{
  "status": "string",
  "comment": "string"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Status alterado!"
}
```

**Resposta de Erro:**
```json
{
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```

---

### GET `/statusBook/:idBook`

Retorna todos os status de um livro específico.

**Parâmetros:**
- `idBook`: ID do livro.

**Resposta de Sucesso:**
```json
[
  {
    "id": "number",
    "idBook": "number",
    "status": "string",
    "comment": "string",
    "user_id": "number",
    "createdAt": "date",
    "updatedAt": "date",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      ...
    }
  },
  ...
]
```

**Resposta de Erro:**
```json
{
  "message": "Ocorreu um erro ao processar sua solicitação"
}
```
