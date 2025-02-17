# Documentação da API de Caderno

## Endpoints

### 1. Criar Livro
**Endpoint:** `/book`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria um novo livro.

**Parâmetros:**
- `model_id` (integer, obrigatório): ID do modelo.
- `start_date` (string, obrigatório): Data de início no formato `DD/MM/YYYY`.
- `end_date` (string, obrigatório): Data de término no formato `DD/MM/YYYY`.

**Resposta de Sucesso:**
- `201 Created`: `{ "message": "Caderno atribuido com sucesso!" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Versão ainda não foi concluida!" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Listar Caderno
**Endpoint:** `/books`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os Caderno.

**Resposta de Sucesso:**
- `200 OK`: Lista de Caderno formatados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 3. Caderno em Execução
**Endpoint:** `/booksInExecution`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os Caderno em execução com status "Pendente".

**Resposta de Sucesso:**
- `200 OK`: Lista de Caderno formatados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 4. Caderno por Equipamento
**Endpoint:** `/deviceBooks/:idEquipment`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os Caderno associados a um equipamento específico.

**Parâmetros:**
- `idEquipment` (integer, obrigatório): ID do equipamento.

**Resposta de Sucesso:**
- `200 OK`: Informações do equipamento e lista de Caderno formatados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 5. Detalhes do Livro
**Endpoint:** `/book/:id`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Obtém os detalhes de um livro específico.

**Parâmetros:**
- `id` (integer, obrigatório): ID do livro.

**Resposta de Sucesso:**
- `200 OK`: Detalhes do livro formatados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Caderno não encontrado" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 6. Fechar Livro
**Endpoint:** `/closeBook/:idBook`

**Método:** `POST`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Fecha um livro, enviando-o para revisão.

**Parâmetros:**
- `idBook` (integer, obrigatório): ID do livro.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Caderno enviado para revisão!" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Somente o responsável pode fechar o caderno!" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 7. Meus Caderno
**Endpoint:** `/myBooks`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Lista todos os Caderno atribuídos ao usuário autenticado com status "Pendente".

**Resposta de Sucesso:**
- `200 OK`: Lista de Caderno formatados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 8. Caderno por Data
**Endpoint:** `/booksByDate/:start_day/:start_month/:start_year/to/:end_day/:end_month/:end_year/`

**Método:** `GET`

**Autenticação:** JWT (`jwt.hasUser`)

**Descrição:** Lista todos os Caderno entre duas datas específicas.

**Parâmetros:**
- `start_day` (integer, obrigatório): Dia de início.
- `start_month` (integer, obrigatório): Mês de início.
- `start_year` (integer, obrigatório): Ano de início.
- `end_day` (integer, obrigatório): Dia de término.
- `end_month` (integer, obrigatório): Mês de término.
- `end_year` (integer, obrigatório): Ano de término.

**Resposta de Sucesso:**
- `200 OK`: Lista de Caderno formatados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "A data de término deve ser maior que a data de início" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 9. Minhas Revisões
**Endpoint:** `/myReviews`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Lista todos os Caderno atribuídos ao usuário autenticado para revisão.

**Resposta de Sucesso:**
- `200 OK`: Lista de Caderno formatados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 10. Atualizar Livro
**Endpoint:** `/book/:idBook`

**Método:** `PATCH`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza as informações de um livro específico.

**Parâmetros:**
- `user_responsible_id` (integer, opcional): ID do usuário responsável.
- `user_executor_id` (integer, opcional): ID do usuário executor.
- `start_date` (string, opcional): Data de início no formato `DD/MM/YYYY`.
- `end_date` (string, opcional): Data de término no formato `DD/MM/YYYY`.
- `sgd` (string, opcional): Informação adicional.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Caderno atualizado com sucesso!" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "A data de término deve ser maior que a data de início" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 11. Atualizar Status do Livro
**Endpoint:** `/bookStatus/:idBook`

**Método:** `PATCH`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza o status de um livro específico.

**Parâmetros:**
- `status` (string, obrigatório): Novo status do livro.
- `end_date` (string, obrigatório): Data de término.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Caderno atualizado com sucesso!" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 12. Imprimir Livro
**Endpoint:** `/imprimirBook/:idBook`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Obtém os dados formatados de um livro para impressão.

**Parâmetros:**
- `idBook` (integer, obrigatório): ID do livro.

**Resposta de Sucesso:**
- `200 OK`: Dados do livro e sua versão, com recursos e itens.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 13. Caderno Revisados
**Endpoint:** `/booksReviseds`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os Caderno com status "Aprovado", "Suspenso" ou "Revogado".

**Resposta de Sucesso:**
- `200 OK`: `{ "Aprovados": [lista de Caderno aprovados], "Suspensos ou revogados": [lista de Caderno suspensos ou revogados] }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`

---

### 14. Atribuir Caderno
**Endpoint:** `/assignBooks`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Lista todos os equipamentos, modelos e usuários ativos para atribuição de Caderno.

**Resposta de Sucesso:**
- `200 OK`: `{ users: [lista de usuários], models: [lista de modelos], equipaments: [lista de equipamentos] }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro ao processar sua solicitação" }`
