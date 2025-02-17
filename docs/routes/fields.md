# Documentação da API de Campos

## Endpoints

### 1. Criar Campo
**Endpoint:** `/field`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria um novo campo associado a um item.

**Parâmetros:**
- `item_id` (integer, obrigatório): ID do item.
- `type_field_id` (integer, obrigatório): ID do tipo de campo.
- `order_field` (integer, obrigatório): Ordem do campo.
- `version_id` (integer, obrigatório): ID da versão.
- `standard_value` (string, opcional): Valor padrão do campo.
- `title_field` (string, obrigatório): Título do campo.
- `feature_id` (integer, opcional): ID da feature associada ao campo.

**Resposta de Sucesso:**
- `201 Created`: Dados do campo criado.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 2. Listar Todos os Campos
**Endpoint:** `/fields`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os campos.

**Resposta de Sucesso:**
- `200 OK`: Lista de todos os campos.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 3. Listar Campos por Versão
**Endpoint:** `/fieldsVersion/:idVersion`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os campos associados a uma versão específica.

**Parâmetros:**
- `idVersion` (integer, obrigatório): ID da versão.

**Resposta de Sucesso:**
- `200 OK`: Lista de campos associados à versão.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 4. Listar Campos por Item
**Endpoint:** `/fields/:idItem`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os campos associados a um item específico.

**Parâmetros:**
- `idItem` (integer, obrigatório): ID do item.

**Resposta de Sucesso:**
- `200 OK`: Lista de campos associados ao item.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 5. Listar Tipos de Campos
**Endpoint:** `/typeFields`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os tipos de campos disponíveis.

**Resposta de Sucesso:**
- `200 OK`: Lista de tipos de campos.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 6. Atualizar Campo
**Endpoint:** `/field/:idField`

**Método:** `PATCH`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza os detalhes de um campo específico.

**Parâmetros:**
- `idField` (integer, obrigatório): ID do campo.
- `item_id` (integer, opcional): ID do item.
- `type_fields_id` (integer, opcional): ID do tipo de campo.
- `order_field` (integer, opcional): Ordem do campo.
- `version_id` (integer, opcional): ID da versão.
- `type_fields` (string, opcional): Tipos de campos.
- `standard_value` (string, opcional): Valor padrão do campo.
- `title_field` (string, opcional): Título do campo.
- `feature_id` (integer, opcional): ID da feature associada ao campo.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Atualizado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "O campo informado não corresponde ao item informado" }`
- `400 Bad Request`: `{ "message": "O campo informado não corresponde a versão informada" }`
- `400 Bad Request`: `{ "message": "Erro ao atualizar" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 7. Deletar Campo
**Endpoint:** `/field/:idField`

**Método:** `DELETE`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Deleta um campo específico.

**Parâmetros:**
- `idField` (integer, obrigatório): ID do campo.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Campo apagado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Campo inexistente" }`
- `400 Bad Request`: `{ "message": "O campo pertence a uma versão concluída" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 8. Trocar Ordem dos Campos
**Endpoint:** `/fieldSwapOrders`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Troca a ordem de dois campos.

**Parâmetros:**
- `id0` (integer, obrigatório): ID do primeiro campo.
- `id1` (integer, obrigatório): ID do segundo campo.
- `order0` (integer, obrigatório): Nova ordem do primeiro campo.
- `order1` (integer, obrigatório): Nova ordem do segundo campo.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "swapado" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Field inexistente" }`
- `400 Bad Request`: `{ "message": "Os campos não são do mesmo caderno" }`
- `400 Bad Request`: `{ "message": "Os campos não são do mesmo item" }`
- `400 Bad Request`: `{ "message": "Os campos pertencem a uma versão concluída" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação", "error": error.toString() }`
