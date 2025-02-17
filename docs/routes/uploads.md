# Documentação das APIs de Upload de Imagens

## Endpoints

### POST `/uploadEquipmentImages/:idEquipment`

Faz o upload de imagens para um equipamento específico.

**Parâmetros:**
- `idEquipment`: ID do equipamento.

**Corpo da Requisição:**
- Imagens (form-data)

**Resposta de Sucesso:**
```json
{
  "message": "Imagens enviadas e salvas no banco de dados com sucesso!",
  "imagens": [...]
}
```

**Resposta de Erro:**
```json
{
  "message": "Erro ao salvar as imagens no banco de dados.",
  "imagens": [...]
}
```

---

### GET `/EquipmentsImage/:idEquipment`

Retorna todas as imagens de um equipamento específico.

**Parâmetros:**
- `idEquipment`: ID do equipamento.

**Resposta de Sucesso:**
```json
[
  {
    "id": "number",
    "equipments_id": "number",
    "path": "string",
    "name": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  ...
]
```

**Resposta de Erro:**
```json
{
  "message": "Erro ao buscar imagens do banco de dados."
}
```

---

### POST `/upload/:idItem`

Faz o upload de imagens para um item específico.

**Parâmetros:**
- `idItem`: ID do item.

**Corpo da Requisição:**
- Imagens (form-data)

**Resposta de Sucesso:**
```json
{
  "message": "Imagens enviadas e salvas no banco de dados com sucesso!",
  "imagens": [...]
}
```

**Resposta de Erro:**
```json
{
  "message": "Erro ao salvar as imagens no banco de dados.",
  "imagens": [...]
}
```

---

### GET `/images/:idItem`

Retorna todas as imagens de um item específico.

**Parâmetros:**
- `idItem`: ID do item.

**Resposta de Sucesso:**
```json
[
  {
    "id": "number",
    "item_id": "number",
    "path": "string",
    "name": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  ...
]
```

**Resposta de Erro:**
```json
{
  "message": "Erro ao buscar imagens do banco de dados."
}
```

---

### POST `/uploadResponseField/:idResponseField`

Faz o upload de imagens para um campo de resposta específico.

**Parâmetros:**
- `idResponseField`: ID do campo de resposta.

**Corpo da Requisição:**
- Imagens (form-data)

**Resposta de Sucesso:**
```json
{
  "message": "Imagens enviadas e salvas no banco de dados com sucesso!",
  "imagens": [...]
}
```

**Resposta de Erro:**
```json
{
  "message": "Erro ao salvar as imagens no banco de dados.",
  "imagens": [...]
}
```

---

### GET `/imagesResponseField/:idResponseField`

Retorna todas as imagens de um campo de resposta específico.

**Parâmetros:**
- `idResponseField`: ID do campo de resposta.

**Resposta de Sucesso:**
```json
[
  {
    "id": "number",
    "response_field_id": "number",
    "path": "string",
    "name": "string",
    "hash": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  ...
]
```

**Resposta de Erro:**
```json
{
  "message": "Erro ao buscar imagens do banco de dados."
}
```

---

### DELETE `/deleteImage/:idImage`

Deleta uma imagem específica.

**Parâmetros:**
- `idImage`: ID da imagem.

**Resposta de Sucesso:**
```json
{
  "message": "Imagem excluída com sucesso!"
}
```

**Resposta de Erro:**
```json
{
  "message": "Erro ao excluir imagem do banco de dados."
}
```
