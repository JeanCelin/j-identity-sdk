# J-Identity SDK

SDK JavaScript/TypeScript para integração com o serviço de autenticação **J-Identity**.

O objetivo deste pacote é encapsular as chamadas HTTP e expor uma API pequena e consistente para registrar usuários, autenticar, renovar tokens e consultar o perfil do usuário autenticado.

## Status

✅ Base funcional inicial implementada.

Atualmente, o SDK expõe uma interface de cliente de autenticação baseada em um adapter de servidor e utiliza `fetch` para comunicar com a API do J-Identity.

Os tokens são passados explicitamente para os métodos que os utilizam.

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

Segredo do cliente, usado em operações de registro e login.

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

### `refresh(refreshToken)`

Renova a sessão usando um refresh token enviado pelo consumidor.

```ts
const result = await auth.refresh("refresh-token-123");

console.log(result.accessToken);
```

### `logout(refreshToken)`

Revoga a sessão na API usando o refresh token informado.

```ts
await auth.logout("refresh-token-123");
```

### `me(accessToken)`

Retorna os dados do usuário autenticado com base no access token informado.

```ts
const user = await auth.me("access-token-123");

console.log(user);
```

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

- o cliente não mantém o access token em memória;
- o refresh token não é gerenciado automaticamente por este SDK;
- o desenvolvedor passa os tokens explicitamente para as operações que necessitam deles;
- a autenticação é feita usando um cliente identificado por `clientId` e `clientSecret`.

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
