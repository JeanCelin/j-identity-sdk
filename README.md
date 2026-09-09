# J-Identity SDK

SDK JavaScript/TypeScript para integração com o serviço de autenticação **J-Identity**.

O objetivo deste pacote é encapsular as chamadas HTTP e expor uma API pequena e consistente para registrar usuários, autenticar, renovar tokens e consultar o perfil do usuário autenticado.

## Status

✅ Base funcional inicial implementada.

Atualmente, o SDK expõe uma interface de cliente de autenticação baseada em um adapter de servidor e utiliza `fetch` para comunicar com a API do J-Identity. O cliente implementa registro, login, renovação de tokens, logout e consulta do usuário autenticado.

Os tokens são passados explicitamente para os métodos que os utilizam. O SDK não armazena tokens nem mantém sessões automaticamente.

## Objetivo

Em vez de a aplicação montar requisições HTTP diretamente, ela pode usar o cliente do SDK:

```ts
const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  clientId: "client-id",
  clientSecret: "client-secret",
});

const result = await auth.login("jean@example.com", "senha-segura");
```

Isso centraliza a lógica de autenticação e reduz a necessidade de conhecer detalhes do endpoint da API.

## Tecnologias

- TypeScript
- JavaScript
- Fetch API
- Vitest
- Node.js

## Instalação

Instale o pacote:

```bash
npm install j-identity-sdk
```

Então importe o cliente:

```ts
import { createAuthClient } from "j-identity-sdk";
```

## Configuração

A criação do cliente acontece pela função `createAuthClient`:

```ts
import { createAuthClient } from "j-identity-sdk";

const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  clientId: "client-id-123",
  clientSecret: "client-secret-123",
});
```

### `apiUrl`

Define a base URL da API do J-Identity:

```ts
apiUrl: "https://auth.example.com";
```

### `clientId`

Identificador público do cliente registrado na API.

```ts
clientId: "client-id-123";
```

### `clientSecret`

Segredo da aplicação consumidora, enviado no corpo das operações de registro, login, refresh e logout. Como é um segredo, a configuração deve permanecer no ambiente server-side da aplicação consumidora.

```ts
clientSecret: "client-secret-123";
```

## API pública

O cliente expõe estes métodos:

```ts
const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  clientId: "client-id-123",
  clientSecret: "client-secret-123",
});
```

### `register(data)`

Cria um novo usuário na API.

```ts
const user = await auth.register({
  name: "Jean",
  email: "jean@example.com",
  password: "senha-segura",
});

console.log(user);
```

Retorno esperado:

```ts
{
  id: "user-123",
  name: "Jean",
  email: "jean@example.com",
  emailVerified: false,
  isActive: true,
  createdAt: "2026-08-20T00:00:00.000Z",
  updatedAt: "2026-08-20T00:00:00.000Z",
}
```

O endpoint retorna um objeto no formato `{ user: User }`, e o SDK entrega somente o conteúdo de `user` ao consumidor.

### `login(email, password)`

Autentica um usuário e retorna os tokens.

```ts
const result = await auth.login("jean@example.com", "senha-segura");

console.log(result.accessToken);
console.log(result.refreshToken);
```

Tipo de retorno:

```ts
{
  accessToken: "string",
  refreshToken: "string",
}
```

O retorno atual contém somente `accessToken` e `refreshToken`. O SDK não expõe `clientApplicationId`, `familyId` ou outros metadados de sessão.

### `refresh(refreshToken)`

Renova a sessão usando um refresh token enviado pelo consumidor.

```ts
const result = await auth.refresh("refresh-token-123");

console.log(result.accessToken);
```

### `logout(refreshToken)`

Solicita à API a revogação da sessão associada ao refresh token informado. O `clientId` e o `clientSecret` da configuração também são enviados.

```ts
await auth.logout("refresh-token-123");
```

### `me(accessToken)`

Retorna os dados do usuário autenticado com base no access token informado.

```ts
const user = await auth.me("access-token-123");

console.log(user);
```

## Endpoints utilizados

O `ServerAdapter` utiliza os seguintes endpoints. Nos endpoints `register`, `login`, `refresh` e `logout`, `clientId` e `clientSecret` são enviados no corpo da requisição.

| Método | Endpoint         | Corpo ou autenticação                                   |
| ------ | ---------------- | ------------------------------------------------------- |
| `POST` | `/auth/register` | `name`, `email`, `password`, `clientId`, `clientSecret` |
| `POST` | `/auth/login`    | `email`, `password`, `clientId`, `clientSecret`         |
| `POST` | `/auth/refresh`  | `refreshToken`, `clientId`, `clientSecret`              |
| `POST` | `/auth/logout`   | `refreshToken`, `clientId`, `clientSecret`              |
| `GET`  | `/auth/me`       | Header `Authorization: Bearer <accessToken>`            |

O SDK serializa os corpos como JSON e normaliza uma barra final de `apiUrl` antes de concatenar o endpoint. Respostas HTTP fora da faixa de sucesso geram `HttpError` com o status HTTP.

## Fluxo básico

```ts
import { createAuthClient } from "j-identity-sdk";

const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  clientId: "client-id-123",
  clientSecret: "client-secret-123",
});

async function authenticate() {
  const registerResult = await auth.register({
    name: "Jean",
    email: "jean@example.com",
    password: "senha-segura",
  });

  console.log("Usuário criado:", registerResult);

  const loginResult = await auth.login("jean@example.com", "senha-segura");

  const user = await auth.me(loginResult.accessToken);

  console.log("Usuário autenticado:", user);
}

authenticate();
```

## Arquitetura

A estrutura atual do SDK é baseada em adapters e abstrações de transporte HTTP:

```text
Application
     │
     ▼
 AuthClient
     │
     ▼
 AuthAdapter
     │
     └── ServerAdapter
           │
           ▼
        HttpClient
           │
           └── FetchHttpClient
                 │
                 ▼
             J-Identity API
```

### Componentes

- `AuthClient`: expõe a API pública utilizada pela aplicação.
- `AuthAdapter`: define o contrato das operações de autenticação.
- `ServerAdapter`: implementa as chamadas HTTP para a API do J-Identity.
- `HttpClient`: abstrai a comunicação HTTP.
- `FetchHttpClient`: implementação concreta usando `fetch`.

## Tratamento de erros

Erros HTTP são representados por `HttpError`.

```ts
try {
  await auth.login("jean@example.com", "senha-segura");
} catch (error) {
  if (error instanceof Error && "status" in error) {
    console.log((error as { status: number }).status);
  }
}
```

A classe expõe o status HTTP do erro:

```ts
error.status;
```

## Observações importantes

- o cliente não mantém o access token nem o refresh token em memória;
- o refresh token deve ser fornecido explicitamente para `refresh` e `logout`, e o access token para `me`;
- a autenticação das aplicações consumidoras é feita com `clientId` e `clientSecret` nos endpoints de registro, login, refresh e logout;
- `me` autentica a requisição somente com o access token no header `Authorization`;
- o SDK não implementa armazenamento de tokens, renovação automática, controle de sessões ou logout automático.

### Sessões e refresh token rotation

O contrato público atual do SDK trabalha apenas com `accessToken` e `refreshToken`. Não há parâmetros nem retornos para `clientApplicationId` ou `familyId`, e não há lógica no SDK para rotação de refresh tokens, detecção de reutilização, revogação de família ou revogação direta de sessão por identificador.

O método `logout(refreshToken)` apenas envia o refresh token ao endpoint `/auth/logout`; qualquer política adicional aplicada pelo serviço de autenticação não é implementada nem controlada pelo SDK.

Esses comportamentos podem ser documentados com mais detalhes quando houver suporte correspondente no contrato da API e na implementação do SDK.

## Desenvolvimento

Clone o projeto e instale as dependências:

```bash
git clone <repository-url>
cd j-identity-sdk
npm install
```

Executar testes:

```bash
npm test
```

Compilar o projeto:

```bash
npm run build
```

## Roadmap

Algumas próximas etapas planejadas incluem:

- [x] `AuthClient`
- [x] Registro
- [x] Login
- [x] Refresh token
- [x] Logout
- [x] `HttpClient`
- [x] `FetchHttpClient`
- [x] Tratamento básico de erros HTTP
- [x] Testes unitários iniciais
- [ ] Publicação no npm

## Licença

Projeto em desenvolvimento.

A licença será definida posteriormente.
