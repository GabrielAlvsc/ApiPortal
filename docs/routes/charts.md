# Documentação da API de Gráficos

## Endpoints

### 1. Gráficos por Categoria
**Endpoint:** `/charts/byCategory/`

**Método:** `GET`

**Autenticação:** JWT (`jwt.hasUser`)

**Descrição:** Obtém um resumo dos livros agrupados por categoria dentro de um intervalo de datas.

**Parâmetros:**
- `start` (integer, opcional): Timestamp de início.
- `end` (integer, opcional): Timestamp de término.
- `filterByUser` (boolean, opcional): Filtra os livros pelo usuário autenticado (`true` ou `false`).

**Resposta de Sucesso:**
- `200 OK`: Resumo dos livros agrupados por categoria.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Gráficos por Livro
**Endpoint:** `/charts/byBook/`

**Método:** `GET`

**Autenticação:** JWT (`jwt.hasUser`)

**Descrição:** Obtém um resumo dos livros dentro de um intervalo de datas.

**Parâmetros:**
- `start` (integer, opcional): Timestamp de início.
- `end` (integer, opcional): Timestamp de término.
- `filterByUser` (boolean, opcional): Filtra os livros pelo usuário autenticado (`true` ou `false`).

**Resposta de Sucesso:**
- `200 OK`: Resumo dos livros agrupados por status.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 3. Gráficos por Modelo
**Endpoint:** `/charts/byModel/`

**Método:** `GET`

**Autenticação:** JWT (`jwt.hasUser`)

**Descrição:** Obtém um resumo dos livros agrupados por modelo.

**Parâmetros:**
- `filterByUser` (boolean, opcional): Filtra os livros pelo usuário autenticado (`true` ou `false`).

**Resposta de Sucesso:**
- `200 OK`: Resumo dos livros agrupados por modelo.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 4. Gráficos de Livros em Execução
**Endpoint:** `/charts/byBookInExecution/`

**Método:** `GET`

**Autenticação:** JWT (`jwt.hasUser`)

**Descrição:** Obtém um resumo dos livros em execução.

**Parâmetros:**
- Nenhum parâmetro específico além da autenticação.

**Resposta de Sucesso:**
- `200 OK`: Resumo dos livros em execução, incluindo detalhes sobre testes em revisão, execução, aprovados e reprovados.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`
