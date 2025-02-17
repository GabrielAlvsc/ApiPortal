# Documentação da API de Login

## Endpoints

### 1. Login
**Endpoint:** `/login`

**Método:** `POST`

**Autenticação:** Nenhuma (este endpoint é usado para obter um token de autenticação)

**Descrição:** Realiza o login do usuário, gerando um token JWT válido por 12 horas.

**Parâmetros:**
- `username` (string, obrigatório): Nome de usuário.
- `password` (string, obrigatório): Senha do usuário.

**Resposta de Sucesso:**
- `201 Created`: `{ "token": "jwt_token_gerado", "profile": "perfil_do_usuário" }`

**Resposta de Erro:**
- `401 Unauthorized`: `{ "message": "Usuário ou senha incorretos" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`

---

### 2. Login do Portal
**Endpoint:** `/portalLogin`

**Método:** `POST`

**Autenticação:** Nenhuma (este endpoint é usado para obter um token de autenticação)

**Descrição:** Realiza o login do usuário através do portal, gerando um token JWT válido por 12 horas.

**Parâmetros:**
- `username` (string, obrigatório): Nome de usuário.
- `password` (string, obrigatório): Senha do usuário.

**Resposta de Sucesso:**
- `201 Created`: `{ "token": "jwt_token_gerado", "profile": "perfil_do_usuário" }`

**Resposta de Erro:**
- `401 Unauthorized`: `{ "message": "Usuário ou senha incorretos" }`
- `400 Bad Request`: `{ "message": "Ocorreu um erro para processar sua solicitação" }`
