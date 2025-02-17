# Documentação da API de Itens

## Endpoints

### 1. Trocar Ordem dos Itens
**Endpoint:** `/itemSwapOrders`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Troca a ordem de dois itens.

**Parâmetros:**
- `id0` (integer, obrigatório): ID do primeiro item.
- `id1` (integer, obrigatório): ID do segundo item.
- `order0` (integer, obrigatório): Nova ordem do primeiro item.
- `order1` (integer, obrigatório): Nova ordem do segundo item.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "swap success" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Item inexistente" }`
- `400 Bad Request`: `{ "message": "Os items não são do mesmo caderno" }`
- `400 Bad Request`: `{ "message": "Os itens pertencem a uma versão concluída" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Criar Item
**Endpoint:** `/item`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria um novo item.

**Parâmetros:**
- `version_id` (integer, obrigatório): ID da versão.
- `title` (string, obrigatório): Título do item.
- `description` (string, obrigatório): Descrição do item.
- `fillable` (boolean, obrigatório): Indica se o item é preenchível.
- `mandatory` (boolean, obrigatório): Indica se o item é obrigatório.

**Resposta de Sucesso:**
- `201 Created`: Dados do item criado.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Versão não encontrada" }`
- `400 Bad Request`: `{ "message": "Versão já concluída" }`
- `400 Bad Request`: `{ "message": "Item com o título já existe" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 3. Listar Itens por Versão
**Endpoint:** `/item/version/:idVersion/`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os itens associados a uma versão específica.

**Parâmetros:**
- `idVersion` (integer, obrigatório): ID da versão.

**Resposta de Sucesso:**
- `200 OK`: Lista de itens associados à versão.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 4. Obter Detalhes do Item
**Endpoint:** `/item/:idItem`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém os detalhes de um item específico.

**Parâmetros:**
- `idItem` (integer, obrigatório): ID do item.

**Resposta de Sucesso:**
- `200 OK`: Dados do item.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 5. Atualizar Item
**Endpoint:** `/item/:idItem`

**Método:** `PATCH`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza os detalhes de um item específico.

**Parâmetros:**
- `title` (string, opcional): Título do item.
- `description` (string, opcional): Descrição do item.
- `order` (integer, opcional): Ordem do item.
- `fillable` (boolean, opcional): Indica se o item é preenchível.
- `mandatory` (boolean, opcional): Indica se o item é obrigatório.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Atualizado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Não é possível editar um item de uma versão concluída" }`
- `400 Bad Request`: `{ "message": "Item com o título já existe" }`
- `400 Bad Request`: `{ "message": "Erro ao atualizar" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 6. Deletar Item
**Endpoint:** `/item/:idItem`

**Método:** `DELETE`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Deleta um item específico.

**Parâmetros:**
- `idItem` (integer, obrigatório): ID do item.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Item apagado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Item pertence a uma versão finalizada!" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`
