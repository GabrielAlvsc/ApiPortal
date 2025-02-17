# Documentação da API de Features

## Endpoints

### 1. Trocar Ordem das Features
**Endpoint:** `/featureSwapOrders`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Troca a ordem de duas features.

**Parâmetros:**
- `id0` (integer, obrigatório): ID da primeira feature.
- `id1` (integer, obrigatório): ID da segunda feature.
- `order0` (integer, obrigatório): Nova ordem da primeira feature.
- `order1` (integer, obrigatório): Nova ordem da segunda feature.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "swap success" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Feature inexistente" }`
- `400 Bad Request`: `{ "message": "As features não são do mesmo caderno" }`
- `400 Bad Request`: `{ "message": "As features pertencem a uma versão concluída" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação", "error": error.toString() }`

---

### 2. Criar Feature
**Endpoint:** `/features`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria uma nova feature.

**Parâmetros:**
- `name` (string, obrigatório): Nome da feature.
- `version_id` (integer, obrigatório): ID da versão.
- `is_variable` (boolean, obrigatório): Indica se a feature é variável.

**Resposta de Sucesso:**
- `201 Created`: Dados da feature criada.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Versão não encontrada" }`
- `400 Bad Request`: `{ "message": "Versão já concluida" }`
- `400 Bad Request`: `{ "message": "Já existe uma feature com esse nome nessa versão" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 3. Obter Detalhes da Feature
**Endpoint:** `/features/:id`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém os detalhes de uma feature específica.

**Parâmetros:**
- `id` (integer, obrigatório): ID da feature.

**Resposta de Sucesso:**
- `200 OK`: Dados da feature.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 4. Atualizar Feature
**Endpoint:** `/features/:id`

**Método:** `PATCH`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza os detalhes de uma feature específica.

**Parâmetros:**
- `id` (integer, obrigatório): ID da feature.
- `name` (string, opcional): Nome da feature.
- `is_variable` (boolean, opcional): Indica se a feature é variável.
- `order` (integer, opcional): Ordem da feature.
- `version_id` (integer, opcional): ID da versão.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Atualizado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Não é possível atualizar uma feature de uma versão concluída" }`
- `400 Bad Request`: `{ "message": "A feature está associada ao item e portanto deve continuar como preenchível durante os testes" }`
- `400 Bad Request`: `{ "message": "Já existe uma feature com esse nome nessa versão" }`
- `400 Bad Request`: `{ "message": "Erro ao atualizar" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 5. Deletar Feature
**Endpoint:** `/features/:id`

**Método:** `DELETE`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Deleta uma feature específica.

**Parâmetros:**
- `id` (integer, obrigatório): ID da feature.

**Resposta de Sucesso:**
- `201 Created`: `{ "message": "Caracteristica apagada com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Característica não encontrada" }`
- `400 Bad Request`: `{ "message": "Não é possível apagar uma feature de uma versão concluída" }`
- `400 Bad Request`: `{ "message": "A feature está associada ao item e não pode ser apagada" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 6. Obter Features Não Associadas a Campos
**Endpoint:** `/getFeaturesCategory/:idVersion`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém uma lista de features não associadas a campos para uma versão específica.

**Parâmetros:**
- `idVersion` (integer, obrigatório): ID da versão.

**Resposta de Sucesso:**
- `200 OK`: Lista de features não associadas.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`
