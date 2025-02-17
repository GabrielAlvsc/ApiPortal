# Documentação da API de Usuários

## Endpoints

### 1. Listar Usuários
**Endpoint:** `/users`

**Método:** `GET`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Obtém uma lista de todos os usuários cadastrados.

**Parâmetros:** Nenhum

**Resposta de Sucesso:**
- `200 OK`: Lista de usuários com os campos `{ id, username, name, email, profile, ip, company }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Criar Usuário
**Endpoint:** `/users`

**Método:** `POST`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Cria um novo usuário.

**Parâmetros:**
- `username` (string, obrigatório): Nome de usuário.
- `name` (string, obrigatório): Nome completo do usuário.
- `password` (string, obrigatório): Senha do usuário.
- `email` (string, obrigatório): E-mail do usuário.
- `profile` (string, obrigatório): Perfil do usuário.
- `ip` (string, opcional): Endereço IP do usuário.
- `company` (string, opcional): Empresa do usuário.

**Resposta de Sucesso:**
- `201 Created`: `{ "message": "Usuário criado" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Preencha todos os campos {username,name,password,email,profile,ip,company}" }`
- `400 Bad Request`: `{ "message": "Já existe um usuário com este username" }`
- `400 Bad Request`: `{ "message": "Já existe um usuário com este email" }`
- `400 Bad Request`: `{ "message": "Erro ao criar usuário" }`

---

### 3. Atualizar Senha
**Endpoint:** `/updatePassword`

**Método:** `PUT`

**Autenticação:** JWT (`jwt.cdt`)

**Descrição:** Atualiza a senha de um usuário autenticado.

**Parâmetros:**
- `oldPassword` (string, obrigatório): Senha antiga do usuário.
- `newPassword` (string, obrigatório): Nova senha do usuário.

**Resposta de Sucesso:**
- `200 OK`: `{ "message": "Senha alterada com sucesso" }`

**Resposta de Erro:**
- `400 Bad Request`: `{ "message": "Senha antiga incorreta" }`
- `400 Bad Request`: `{ "message": "Erro ao atualizar usuário" }`

---

### Exemplos de Requisições

#### 1. Listar Usuários

**Requisição:**
```http
GET /users HTTP/1.1
Authorization: Bearer <token>
```

**Resposta:**
```json
[
    {
        "id": 1,
        "username": "usuario1",
        "name": "Nome Usuário 1",
        "email": "usuario1@example.com",
        "profile": "admin",
        "ip": "192.168.1.1",
        "company": "Empresa 1"
    },
    {
        "id": 2,
        "username": "usuario2",
        "name": "Nome Usuário 2",
        "email": "usuario2@example.com",
        "profile": "user",
        "ip": "192.168.1.2",
        "company": "Empresa 2"
    }
]
```

#### 2. Criar Usuário

**Requisição:**
```http
POST /users HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
    "username": "usuario3",
    "name": "Nome Usuário 3",
    "password": "senha123",
    "email": "usuario3@example.com",
    "profile": "user",
    "ip": "192.168.1.3",
    "company": "Empresa 3"
}
```

**Resposta:**
```json
{
    "message": "Usuário criado"
}
```

#### 3. Atualizar Senha

**Requisição:**
```http
PUT /updatePassword HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
    "oldPassword": "senhaAntiga",
    "newPassword": "senhaNova"
}
```

**Resposta:**
```json
{
    "message": "Senha alterada com sucesso"
}
```
