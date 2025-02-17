# Documentação da API de Versões

## Endpoints

### 1. Gerar Comentário de Versão
**Endpoint:** `/generateComment/:idVersion`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Gera um comentário comparando a versão atual com a versão anterior de um modelo específico.

**Parâmetros:**
- `idVersion` (integer, obrigatório): ID da versão.

**Resposta de Sucesso:**
- `201 Created`: `{ comment: "comentário gerado" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Listar Todas as Versões
**Endpoint:** `/version`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém uma lista de todas as versões.

**Parâmetros:** Nenhum

**Resposta de Sucesso:**
- `201 Created`: Lista de versões.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 3. Listar Todas as Versões (Acesso Público)
**Endpoint:** `/versionAll`

**Método:** `GET`

**Autenticação:** JWT (`jwt.all`)

**Descrição:** Obtém uma lista de todas as versões, acessível por todos os usuários autenticados.

**Parâmetros:** Nenhum

**Resposta de Sucesso:**
- `201 Created`: Lista de versões.

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 4. Editar Versão
**Endpoint:** `/editVersion/:idVersion`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria uma nova versão com base em uma versão existente, desde que a versão existente esteja concluída.

**Parâmetros:**
- `idVersion` (integer, obrigatório): ID da versão a ser editada.

**Resposta de Sucesso:**
- `201 Created`: `{ "message": "Nova versão criada e atualizada com sucesso!" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Essa versão ainda não foi concluída para criar uma nova" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 5. Concluir Versão
**Endpoint:** `/closeVersion/:idVersion`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Conclui uma versão, desde que todas as features preenchíveis estejam associadas a um campo.

**Parâmetros:**
- `idVersion` (integer, obrigatório): ID da versão a ser concluída.
- `comment` (string, opcional): Comentário sobre a conclusão da versão.

**Resposta de Sucesso:**
- `201 Created`: `{ "message": "Versão concluída com sucesso!" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Existem features preenchíveis não associadas a um campo!" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### Exemplos de Requisições

#### 1. Gerar Comentário de Versão

**Requisição:**
```http
GET /generateComment/1 HTTP/1.1
Authorization: Bearer <token>
```

**Resposta:**
```json
{
    "comment": "Adicionados: \"Novo Item\"\nRemovidos: \"Item Antigo\"\nAlterados: \"Item Modificado\""
}
```

#### 2. Listar Todas as Versões

**Requisição:**
```http
GET /version HTTP/1.1
Authorization: Bearer <token>
```

**Resposta:**
```json
[
    {
        "id": 1,
        "version": 1,
        "model_id": 1,
        "concluded": true,
        "comment": "Primeira versão"
    },
    {
        "id": 2,
        "version": 2,
        "model_id": 1,
        "concluded": false,
        "comment": "Versão em andamento"
    }
]
```

#### 3. Editar Versão

**Requisição:**
```http
POST /editVersion/1 HTTP/1.1
Authorization: Bearer <token>
```

**Resposta:**
```json
{
    "message": "Nova versão criada e atualizada com sucesso!"
}
```

#### 4. Concluir Versão

**Requisição:**
```http
POST /closeVersion/1 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
    "comment": "Versão finalizada com sucesso"
}
```

**Resposta:**
```json
{
    "message": "Versão concluída com sucesso!"
}
```