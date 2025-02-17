# backend-cadernos [![Pull on server](https://github.com/Coordenacao-de-Operacoes-de-Rede/backend-cadernos/actions/workflows/deploy.yaml/badge.svg)](https://github.com/Coordenacao-de-Operacoes-de-Rede/backend-cadernos/actions/workflows/deploy.yaml)

This is a repository for backend

# Documentação do Projeto

Este projeto contém diversas APIs organizadas em rotas específicas, além de modelos e arquivos de configuração essenciais para o funcionamento do sistema. Abaixo está uma visão geral da estrutura do projeto e da documentação das rotas disponíveis.

## Estrutura de Diretórios

```
docs/
└── routes/
    ├── book.md
    ├── charts.md
    ├── dump.md
    ├── equipments.md
    ├── features.md
    ├── fields.md
    ├── items.md
    ├── login.md
    ├── models.md
    ├── portal.html
    ├── response.md
    ├── segments.md
    ├── statusBook.md
    ├── uploads.md
    ├── users.md
    ├── versions.md
models/
    ├── books.js
    ├── categories.js
    ├── correction_features.js
    ├── correction_items.js
    ├── equipments.js
    ├── features.js
    ├── fields.js
    ├── images.js
    ├── items.js
    ├── logPdf.js
    ├── models.js
    ├── response_features.js
    ├── response_fields.js
    ├── response_items.js
    ├── statusBook.js
    ├── type_fields_values.js
    ├── type_fields.js
    ├── users.js
    ├── versions.js
routes/
    ├── books.js
    ├── charts.js
    ├── dump.js
    ├── equipments.js
    ├── features.js
    ├── fields.js
    ├── home.js
    ├── items.js
    ├── login.js
    ├── models.js
    ├── pdf.js
    ├── portal.js
    ├── responses.js
    ├── segments.js
    ├── statusBook.js
    ├── upload.js
    ├── users.js
    ├── versions.js
associations.js
auth.js
boot.js
config.js
db.js
index.js
middlewares.js
package-lock.json
package.json
/uploads
```

## Documentação das Rotas

### [Book](docs/routes/book.md)
Documentação das APIs relacionadas ao gerenciamento de livros.

### [Charts](docs/routes/charts.md)
Documentação das APIs para geração e manipulação de gráficos.

### [Dump](docs/routes/dump.md)
APIs para operações de dump de dados.

### [Equipments](docs/routes/equipments.md)
APIs para gerenciar equipamentos.

### [Features](docs/routes/features.md)
Documentação das APIs para gerenciamento de funcionalidades.

### [Fields](docs/routes/fields.md)
APIs relacionadas aos campos utilizados no sistema.

### [Items](docs/routes/items.md)
Documentação das APIs para gerenciamento de itens.

### [Login](docs/routes/login.md)
APIs para autenticação e login de usuários.

### [Models](docs/routes/models.md)
APIs para gerenciamento dos modelos de dados.

### [Portal](docs/routes/portal.html)
Documentação do portal do sistema.

### [Response](docs/routes/response.md)
APIs para gerenciamento de respostas.

### [Segments](docs/routes/segments.md)
APIs relacionadas aos segmentos utilizados no sistema.

### [StatusBook](docs/routes/statusBook.md)
APIs para gerenciamento do status dos livros.

### [Uploads](docs/routes/uploads.md)
Documentação das APIs para upload de arquivos.

### [Users](docs/routes/users.md)
APIs para gerenciamento de usuários.

### [Versions](docs/routes/versions.md)
APIs para gerenciamento de versões.

## Configuração e Inicialização

- `associations.js`: Define as associações entre os modelos.
- `auth.js`: Configurações de autenticação.
- `boot.js`: Inicializa o servidor.
- `config.js`: Arquivo de configuração principal.
- `db.js`: Configurações e conexão com o banco de dados.
- `index.js`: Ponto de entrada da aplicação.
- `middlewares.js`: Middlewares utilizados na aplicação.
- `package-lock.json`: Detalhes de versão dos pacotes instalados.
- `package.json`: Informações e dependências do projeto.
- `/uploads`: Diretório para armazenamento de arquivos enviados.
