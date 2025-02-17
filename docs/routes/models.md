# Documentação da API de Modelos

## Endpoints

### 1. Criar Modelo
**Endpoint:** `/models`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria um novo modelo e uma versão inicial para o mesmo.

**Parâmetros:**
- Vários parâmetros de acordo com o modelo.

**Resposta de Sucesso:**
- `201 Created`: Dados do modelo criado.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Listar Modelos Ativos
**Endpoint:** `/models`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os modelos ativos.

**Resposta de Sucesso:**
- `200 OK`: Lista de modelos ativos.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 3. Listar Todos os Modelos
**Endpoint:** `/modelsAll`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Lista todos os modelos.

**Resposta de Sucesso:**
- `200 OK`: Lista de todos os modelos.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 4. Obter Versão de um Modelo
**Endpoint:** `/model/:idModel/version/:idVersion`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Obtém os detalhes de uma versão específica de um modelo.

**Parâmetros:**
- `idModel` (integer, obrigatório): ID do modelo.
- `idVersion` (integer, obrigatório): ID da versão.

**Resposta de Sucesso:**
- `200 OK`: Detalhes do modelo, versão, features e itens.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 5. Obter Detalhes de um Livro do Modelo
**Endpoint:** `/myBooks/:idBook/model/:idModel/version/:idVersion`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Obtém os detalhes de um livro específico de um modelo.

**Parâmetros:**
- `idBook` (integer, obrigatório): ID do livro.
- `idModel` (integer, obrigatório): ID do modelo.
- `idVersion` (integer, obrigatório): ID da versão.

**Resposta de Sucesso:**
- `200 OK`: Detalhes do modelo, versão, features e itens do livro.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Você não tem acesso a esse caderno" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 6. Obter Detalhes de uma Revisão do Modelo
**Endpoint:** `/myReviews/:idBook/model/:idModel/version/:idVersion`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém os detalhes de uma revisão específica de um modelo.

**Parâmetros:**
- `idBook` (integer, obrigatório): ID do livro.
- `idModel` (integer, obrigatório): ID do modelo.
- `idVersion` (integer, obrigatório): ID da versão.

**Resposta de Sucesso:**
- `200 OK`: Detalhes do modelo, versão, features e itens da revisão.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Você não tem acesso a esse caderno" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 7. Obter Conteúdo do Modelo
**Endpoint:** `/model/content/:idModel`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém o conteúdo de um modelo específico, incluindo sua versão mais recente.

**Parâmetros:**
- `idModel` (integer, obrigatório): ID do modelo.

**Resposta de Sucesso:**
- `200 OK`: Detalhes do modelo, versão recente, features e itens.

**Resposta de Erro:**
- `404 Not Found`: `{ "message": "Nenhuma versão encontrada para este modelo." }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 8. Atualizar Modelo
**Endpoint:** `/models/:id`

**Método:** `PATCH`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza os detalhes de um modelo específico.

**Parâmetros:**
- `id` (integer, obrigatório): ID do modelo.
- `title` (string, opcional): Título do modelo.
- `category_id` (integer, opcional): ID da categoria.
- `active` (boolean, opcional): Status ativo do modelo.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Atualizado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Erro ao atualizar" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 9. Desativar Modelo
**Endpoint:** `/models`

**Método:** `DELETE`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Desativa um modelo específico.

**Parâmetros:**
- `id` (integer, obrigatório): ID do modelo.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Desativado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 10. Imprimir Modelo
**Endpoint:** `/imprimirModel/:idModel`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém todos os detalhes de um modelo específico, incluindo todas as versões.

**Parâmetros:**
- `idModel` (integer, obrigatório): ID do modelo.

**Resposta de Sucesso:**
- `200 OK`: Detalhes do modelo, versões, features e itens.

**Resposta de Erro:**
- `404 Not Found`: `{ "message": "Nenhuma versão encontrada para este modelo." }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 11. Modelos Concluídos
**Endpoint:** `/concludedModels`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os modelos que têm versões concluídas.

**Resposta de Sucesso:**
- `200 OK`: Lista de modelos concluídos.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`
