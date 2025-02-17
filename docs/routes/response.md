# Documentação das APIs de Resposta

## Endpoints

### PATCH `/revisionResponseItem/:idResponseItem`

Atualiza as respostas de um item.

**Parâmetros:**
- `idResponseItem`: ID do item de resposta.

**Corpo da Requisição:**
```json
{
  "comment": "string",
  "in_review": "boolean",
  "approval": "boolean"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Item atualizado!"
}
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### PATCH `/responseFeature/:idResponseFeature`

Atualiza uma característica de resposta.

**Parâmetros:**
- `idResponseFeature`: ID da característica de resposta.

**Corpo da Requisição:**
```json
{
  "response": "string",
  "in_review": "boolean",
  "approval": "boolean"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Caracteristica respondida com sucesso!"
}
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### POST `/correctionFeatures/:idResponseFeature`

Cria uma correção para uma característica de resposta.

**Parâmetros:**
- `idResponseFeature`: ID da característica de resposta.

**Corpo da Requisição:**
```json
{
  "revision": "string"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Correção criada com sucesso!"
}
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### PATCH `/correctionFeatures/:idCorrectionFeature`

Atualiza uma correção para uma característica de resposta.

**Parâmetros:**
- `idCorrectionFeature`: ID da correção da característica de resposta.

**Corpo da Requisição:**
```json
{
  "revision": "string",
  "ajusted": "boolean"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Correção atualizada com sucesso!"
}
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### GET `/returnCorrectionFeature/:idResponseFeature`

Retorna as correções de uma característica de resposta.

**Parâmetros:**
- `idResponseFeature`: ID da característica de resposta.

**Resposta de Sucesso:**
```json
[
  {
    "id": "number",
    "revision": "string",
    "ajusted": "boolean",
    "response_feature_id": "number",
    ...
  }
]
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### PATCH `/responseField/:idResponseField`

Atualiza um campo de resposta.

**Parâmetros:**
- `idResponseField`: ID do campo de resposta.

**Corpo da Requisição:**
```json
{
  "response": "string",
  "hash": "string"
}
```

**Resposta de Sucesso:**
```json
{
  "response": "string",
  "hash": "string",
  ...
}
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### POST `/correctionItem/:idResponseItem`

Cria uma correção para um item de resposta.

**Parâmetros:**
- `idResponseItem`: ID do item de resposta.

**Corpo da Requisição:**
```json
{
  "revision": "string"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Correção criada com sucesso!",
  "correctionItem": {
    "revision": "string",
    "ajusted": "boolean",
    "response_item_id": "number",
    ...
  }
}
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### PATCH `/correctionItem/:idCorrectionItem`

Atualiza uma correção para um item de resposta.

**Parâmetros:**
- `idCorrectionItem`: ID da correção do item de resposta.

**Corpo da Requisição:**
```json
{
  "revision": "string",
  "ajusted": "boolean"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Correção atualizada com sucesso!"
}
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```

---

### GET `/returnCorrectionItem/:idResponseItem`

Retorna as correções de um item de resposta.

**Parâmetros:**
- `idResponseItem`: ID do item de resposta.

**Resposta de Sucesso:**
```json
[
  {
    "id": "number",
    "revision": "string",
    "ajusted": "boolean",
    "response_item_id": "number",
    ...
  }
]
```

**Resposta de Erro:**
```json
{
  "message": "Mensagem de erro"
}
```
