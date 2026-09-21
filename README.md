# J-Identity SDK

SDK JavaScript/TypeScript para integração com o serviço de autenticação **J-Identity**.

O pacote encapsula as chamadas HTTP da API e fornece uma interface simples para registro de usuários, login, renovação de tokens, logout e consulta do usuário autenticado.

O SDK foi desenvolvido para aplicações **server-side**, pois a configuração utiliza o `clientSecret` da aplicação consumidora.

## Status

Versão inicial funcional.

O SDK possui:

* registro de usuários;
* login;
* refresh token;
* logout;
* consulta do usuário autenticado;
* cliente HTTP baseado em `fetch`;
* tratamento de erros HTTP;
* testes unitários;
* integração validada com a API J-Identity.

O SDK não armazena tokens nem gerencia sessões automaticamente. Os tokens são fornecidos explicitamente pelos métodos que precisam deles.

## Instalação

```bash
npm install j-identity-sdk
```

Importe o cliente:

```ts
import { createAuthClient } from "j-identity-sdk";
```

## Configuração

O cliente é criado através da função `createAuthClient`:

```ts
import { createAuthClient } from "j-identity-sdk";

const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  clientId: "client-id-123",
  clientSecret: "client-secret-123",
});
```

### `apiUrl`

URL base da API do J-Identity.

```ts
apiUrl: "https://auth.example.com"
```

### `clientId`

Identificador da aplicação cliente registrada na API.

```ts
clientId: "client-id-123"
```

### `clientSecret`

Segredo da aplicação cliente.

```ts
clientSecret: "client-secret-123"
```

O `clientSecret` deve permanecer exclusivamente no ambiente server-side da aplicação. Ele não deve ser exposto ao navegador, código frontend ou aplicações públicas.

## API pública

O cliente expõe os seguintes métodos:

```ts
const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  clientId: "client-id-123",
  clientSecret: "client-secret-123",
});
```

### `register(data)`

Registra um novo usuário na API.

```ts
const user = await auth.register({
  name: "nome",
  email: "email@example.com",
  password: "senha-segura",
});

console.log(user);
```

O usuário retornado possui as seguintes informações:

```ts
{
  id: "user-123",
  name: "nome",
  email: "email@example.com",
  role: "USER",
  emailVerified: false,
  isActive: true,
  createdAt: "2026-08-20T00:00:00.000Z",
  updatedAt: "2026-08-20T00:00:00.000Z",
}
```

O SDK retorna diretamente os dados do usuário..

### `login(email, password)`

Autentica um usuário e retorna os tokens da sessão.

```ts
const result = await auth.login(
  "email@example.com",
  "senha-segura",
);

```

Retorno:

```ts
{
  accessToken: "string",
  refreshToken: "string",
}
```

O SDK não armazena esses tokens automaticamente.

### `refresh(refreshToken)`

Renova os tokens utilizando um refresh token.

```ts
const result = await auth.refresh("refresh-token-123");

```

A API realiza a rotação do refresh token. Portanto, quando um refresh é realizado com sucesso, o consumidor deve passar a utilizar o novo `refreshToken` retornado.

O SDK apenas transporta os tokens e não gerencia esse ciclo automaticamente.

### `logout(refreshToken)`

Solicita à API a revogação da sessão associada ao refresh token informado.

```ts
await auth.logout("refresh-token-123");
```

O `clientId` e o `clientSecret` configurados no cliente são enviados automaticamente pelo SDK.

### `me(accessToken)`

Obtém os dados do usuário autenticado utilizando um access token.

```ts
const user = await auth.me("access-token-123");

console.log(user);
```

retorno exemplo:

```bash

{
  id: "user-123",
  name: "nome",
  email: "email@example.com",
  role: "USER",
  emailVerified: false,
  isActive: true,
  createdAt: "2026-08-20T00:00:00.000Z",
  updatedAt: "2026-08-20T00:00:00.000Z",
}

```

## Endpoints utilizados

O `ServerAdapter` utiliza os seguintes endpoints:

| Método | Endpoint         | Autenticação / corpo                                    |
| ------ | ---------------- | ------------------------------------------------------- |
| `POST` | `/auth/register` | `name`, `email`, `password`, `clientId`, `clientSecret` |
| `POST` | `/auth/login`    | `email`, `password`, `clientId`, `clientSecret`         |
| `POST` | `/auth/refresh`  | `refreshToken`, `clientId`, `clientSecret`              |
| `POST` | `/auth/logout`   | `refreshToken`, `clientId`, `clientSecret`              |
| `GET`  | `/auth/me`       | `Authorization: Bearer <accessToken>`                   |

O SDK serializa os corpos das requisições como JSON e normaliza uma barra final da `apiUrl` antes de concatenar os endpoints.

Respostas HTTP fora da faixa de sucesso geram um `HttpError` contendo o status HTTP.

## Fluxo básico

Um fluxo simples de utilização pode ser:

```ts
import { createAuthClient } from "j-identity-sdk";

const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  clientId: "client-id-123",
  clientSecret: "client-secret-123",
});

async function authenticate() {
  const user = await auth.register({
    name: "nome",
    email: "email@example.com",
    password: "senha-segura",
  });

  console.log("Usuário criado:", user);

  const loginResult = await auth.login(
    "email@example.com",
    "senha-segura",
  );

  console.log("Access Token:", loginResult.accessToken);
  console.log("Refresh Token:", loginResult.refreshToken);

  const authenticatedUser = await auth.me(
    loginResult.accessToken,
  );

  console.log("Usuário autenticado:", authenticatedUser);
}

authenticate();
```

## Tokens e sessões

O SDK não mantém estado de autenticação automaticamente.

O consumidor é responsável por armazenar os tokens de acordo com o ambiente da aplicação e fornecê-los aos métodos correspondentes:

* `accessToken` → utilizado por `me()`;
* `refreshToken` → utilizado por `refresh()` e `logout()`.

A API J-Identity é responsável pelo gerenciamento da sessão, incluindo:

* expiração de refresh tokens;
* rotação de refresh tokens;
* detecção de reutilização;
* revogação de sessões;
* revogação da família de tokens.

Essas regras pertencem ao serviço de autenticação e não são implementadas como gerenciamento automático de sessão dentro do SDK.

## Arquitetura

A estrutura do SDK é baseada em adapters e abstrações de transporte HTTP:

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

`AuthClient`

Interface pública utilizada pela aplicação consumidora.

`AuthAdapter`

Define o contrato das operações de autenticação.

`ServerAdapter`

Implementa as operações de autenticação utilizando a API J-Identity.

`HttpClient`

Abstrai a comunicação HTTP.

`FetchHttpClient`

Implementação do `HttpClient` utilizando a Fetch API.

## Tratamento de erros

Erros HTTP são representados pela classe `HttpError`.

```ts
try {
  await auth.login(
    "email@example.com",
    "senha-segura",
  );
} catch (error) {
  if (error instanceof Error && "status" in error) {
    console.log((error as { status: number }).status);
  }
}
```

O `HttpError` expõe o status HTTP através da propriedade:

```ts
error.status;
```

Por exemplo:

```text
401
```

para uma requisição não autorizada ou:

```text
409
```

para um conflito, como uma tentativa de registrar um email já existente.

## Segurança

O `clientSecret` é uma credencial da aplicação cliente e deve ser mantido em ambiente server-side.

Não utilize o SDK diretamente em código frontend que será enviado ao navegador quando isso implicar expor o `clientSecret`.

Uma aplicação frontend pode se comunicar com seu próprio backend, enquanto o backend utiliza o J-Identity SDK para realizar as operações autenticadas.

## Desenvolvimento

Clone o projeto e instale as dependências:

```bash
git clone <repository-url>

cd j-identity-sdk

npm install
```

Executar os testes:

```bash
npm test
```

Compilar o projeto:

```bash
npm run build
```

## Licença

A licença do projeto será definida posteriormente.

