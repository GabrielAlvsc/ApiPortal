# Documentação da API de Dump

## Endpoints

### 1. Dump de Modelo
**Endpoint:** `/dump/model/:idModel`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém um dump da última versão de um modelo específico.

**Parâmetros:**
- `idModel` (integer, obrigatório): ID do modelo.

**Resposta de Sucesso:**
- `200 OK`: `{ items: [lista de itens], features: [lista de features] }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Nenhuma versão encontrada" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Carregar Dump de Modelo
**Endpoint:** `/dump/model/:idModel`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Carrega um dump para a última versão de um modelo específico. A versão não pode estar concluída.

**Parâmetros:**
- `idModel` (integer, obrigatório): ID do modelo.
- `items` (array, obrigatório): Lista de itens a serem carregados.
- `features` (array, obrigatório): Lista de features a serem carregadas.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Caderno carregado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Nenhuma versão encontrada" }`
- `400 Bad Request`: `{ "message": "Não pode ser exportado para uma Versão concluída" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`
