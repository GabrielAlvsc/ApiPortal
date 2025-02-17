# Documentação da API de Equipamentos

## Endpoints

### 1. Criar Equipamento
**Endpoint:** `/equipments`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria um novo equipamento.

**Parâmetros:**
- `name` (string, obrigatório): Nome do equipamento.
- `vendor` (string, obrigatório): Fabricante do equipamento.
- `price` (number, obrigatório): Preço do equipamento.
- `endofsales` (string, opcional): Data de fim de vendas no formato `DD/MM/YYYY`.

**Resposta de Sucesso:**
- `200 OK`: Dados do equipamento criado.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 2. Listar Equipamentos
**Endpoint:** `/equipments`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os equipamentos ativos.

**Resposta de Sucesso:**
- `200 OK`: Lista de equipamentos ativos, incluindo imagem associada.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 3. Detalhes do Equipamento
**Endpoint:** `/equipments/:id`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém os detalhes de um equipamento específico.

**Parâmetros:**
- `id` (integer, obrigatório): ID do equipamento.

**Resposta de Sucesso:**
- `200 OK`: Detalhes do equipamento.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 4. Atualizar Equipamento
**Endpoint:** `/equipments/:id`

**Método:** `PATCH`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza os detalhes de um equipamento específico.

**Parâmetros:**
- `id` (integer, obrigatório): ID do equipamento.
- `name` (string, opcional): Nome do equipamento.
- `vendor` (string, opcional): Fabricante do equipamento.
- `price` (number, opcional): Preço do equipamento.
- `endofsales` (string, opcional): Data de fim de vendas no formato `DD/MM/YYYY`.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Atualizado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Erro ao atualizar" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 5. Deletar Equipamento
**Endpoint:** `/equipments/:id`

**Método:** `DELETE`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Marca um equipamento como inativo.

**Parâmetros:**
- `id` (integer, obrigatório): ID do equipamento.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Apagado com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`
