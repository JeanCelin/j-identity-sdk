# J-Identity SDK

SDK JavaScript/TypeScript para integração com o **J-Identity**, um serviço centralizado de autenticação.

O objetivo do SDK é fornecer uma API simples e consistente para que aplicações web e, futuramente, aplicações mobile possam utilizar os recursos de autenticação do J-Identity sem precisar conhecer os detalhes das requisições HTTP, armazenamento de tokens ou particularidades de cada plataforma.

## Status

🚧 Em desenvolvimento.

Atualmente, a plataforma **Web** está implementada.

A plataforma **Mobile** está prevista para uma próxima etapa.

## Objetivo

O J-Identity SDK funciona como uma camada de abstração entre a aplicação e a API de autenticação.

Em vez de uma aplicação realizar diretamente requisições como:

```ts
fetch("/auth/login", {
  method: "POST",
  ...
});
```

ela poderá utilizar uma API orientada a autenticação:

```ts
const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  platform: "web",
});

await auth.login(email, password);
```

Isso permite que a aplicação não precise conhecer detalhes da implementação da API.

## Tecnologias

* TypeScript
* JavaScript
* Fetch API
* Vitest
* Node.js para desenvolvimento e build

## Instalação

Quando publicado no npm:

```bash
npm install @jeancelin/auth
```

Depois, importe o cliente:

```ts
import { createAuthClient } from "@jeancelin/auth";
```

## Configuração

O cliente é criado através da função `createAuthClient`.

```ts
import { createAuthClient } from "@jeancelin/auth";

const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  platform: "web",
});
```

### `apiUrl`

Define a URL base da API do J-Identity.

```ts
apiUrl: "https://auth.example.com"
```

### `platform`

Define a plataforma em que o SDK está sendo utilizado.

Atualmente:

```ts
platform: "web"
```

A opção:

```ts
platform: "mobile"
```

está prevista, mas ainda não está implementada.

## Registro

Para criar uma nova conta:

```ts
const user = await auth.register({
  name: "Jean",
  email: "jean@example.com",
  password: "senha-segura",
});

console.log(user);
```

O método retorna os dados do usuário criado.

```ts
type User = {
  id: string;
  name: string;
  email: string;
  // ...
};
```

## Login

O login é realizado através do método `login`:

```ts
const result = await auth.login(
  "jean@example.com",
  "senha-segura"
);
```

O resultado contém o Access Token:

```ts
console.log(result.accessToken);
```

O SDK também mantém o Access Token em memória:

```ts
const token = auth.getAccessToken();

console.log(token);
```

## Obter o usuário autenticado

Depois do login, é possível obter os dados do usuário através de:

```ts
const user = await auth.me();

console.log(user);
```

O SDK utiliza o Access Token armazenado para realizar a requisição autenticada.

Se não houver um Access Token disponível, o método lança um erro:

```ts
Error("Não autenticado")
```

## Refresh Token

O SDK possui suporte à renovação da sessão:

```ts
const result = await auth.refresh();

console.log(result.accessToken);
```

O novo Access Token substitui automaticamente o token armazenado anteriormente.

O mecanismo de Refresh Token é tratado pela API de autenticação e pelo adapter da plataforma.

No ambiente Web, o Refresh Token utiliza cookies enviados através de:

```ts
credentials: "include"
```

O objetivo é manter o Refresh Token fora do acesso direto da aplicação JavaScript, utilizando o mecanismo de cookies do navegador.

## Logout

Para encerrar a sessão:

```ts
await auth.logout();
```

O SDK solicita o encerramento da sessão à API e remove o Access Token mantido em memória.

Mesmo que a requisição de logout falhe, o Access Token local é removido.

## Exemplo completo

Um fluxo básico de autenticação pode ser implementado da seguinte forma:

```ts
import { createAuthClient } from "@jeancelin/auth";

const auth = createAuthClient({
  apiUrl: "https://auth.example.com",
  platform: "web",
});

async function authenticate() {
  try {
    await auth.login(
      "jean@example.com",
      "senha-segura"
    );

    const user = await auth.me();

    console.log("Usuário autenticado:", user);
  } catch (error) {
    console.error("Falha na autenticação:", error);
  }
}

authenticate();
```

## API

O `AuthClient` atualmente disponibiliza os seguintes métodos:

| Método                   | Descrição                         |
| ------------------------ | --------------------------------- |
| `register(data)`         | Cria uma nova conta               |
| `login(email, password)` | Realiza o login                   |
| `refresh()`              | Renova o Access Token             |
| `me()`                   | Retorna o usuário autenticado     |
| `logout()`               | Encerra a sessão                  |
| `getAccessToken()`       | Retorna o Access Token armazenado |

## Arquitetura

O SDK utiliza uma arquitetura baseada em adapters.

A ideia é separar a interface pública do SDK das particularidades de cada plataforma.

Atualmente:

```text
Application
     │
     ▼
 AuthClient
     │
     ▼
 AuthAdapter
     │
     ├── WebAdapter
     │
     └── MobileAdapter (futuro)
     │
     ▼
 HttpClient
     │
     └── FetchHttpClient
     │
     ▼
 J-Identity API
```

O `AuthClient` concentra a API pública utilizada pela aplicação.

O `AuthAdapter` define as operações de autenticação que uma plataforma precisa implementar.

O `WebAdapter` implementa essas operações para navegadores.

O `HttpClient` abstrai a comunicação HTTP, enquanto o `FetchHttpClient` fornece a implementação utilizando a Fetch API.

Essa separação permite adicionar suporte a outras plataformas sem modificar a API pública utilizada pela aplicação.

## Tratamento de erros

Erros HTTP são representados pela classe `HttpError`.

```ts
try {
  await auth.login(email, password);
} catch (error) {
  if (error instanceof HttpError) {
    console.log(error.status);
  }
}
```

O `HttpError` disponibiliza o status HTTP retornado pela API:

```ts
error.status
```

Isso permite que a aplicação trate diferentes respostas da API de acordo com sua necessidade.

## Plataforma Web

A implementação atual utiliza recursos nativos do navegador, principalmente a Fetch API e cookies.

O fluxo de autenticação Web utiliza:

```text
Login
  │
  ├── Access Token → mantido pelo SDK em memória
  │
  └── Refresh Token → cookie enviado pelo navegador

Refresh
  │
  └── novo Access Token → substitui o anterior

Logout
  │
  ├── sessão revogada pela API
  └── Access Token removido da memória
```

A implementação mobile será adicionada posteriormente através de um adapter específico para dispositivos móveis.

## Desenvolvimento

Clone o projeto e instale as dependências:

```bash
git clone <repository-url>

cd j-identity-sdk

npm install
```

Para executar o projeto em desenvolvimento:

```bash
npm run dev
```

Para executar o build:

```bash
npm run build
```

Os testes podem ser executados com:

```bash
npm test
```

## Princípios do projeto

O SDK busca seguir alguns princípios:

* API pública simples.
* Separação entre autenticação e transporte HTTP.
* Separação entre plataforma e lógica de autenticação.
* Tipagem forte com TypeScript.
* Facilidade para adicionar novas plataformas.
* Segurança como parte da arquitetura, e não como responsabilidade exclusiva da aplicação consumidora.
* Implementação independente do framework utilizado pela aplicação.

O SDK não é específico de React, Next.js ou qualquer outro framework. A intenção é que ele possa ser utilizado por diferentes aplicações JavaScript/TypeScript.

## Roadmap

Algumas das próximas etapas planejadas incluem:

* [x] `AuthClient`
* [x] Registro
* [x] Login
* [x] Logout
* [x] Refresh Token
* [x] Access Token em memória
* [x] `HttpClient`
* [x] `WebAdapter`
* [x] Tratamento básico de erros HTTP
* [x] Testes unitários iniciais
* [ ] Implementação do `MobileAdapter`
* [ ] Integração com armazenamento seguro para mobile
* [ ] Publicação no npm
* [ ] Documentação completa da API
* [ ] Mais testes de integração
* [ ] Melhorias no gerenciamento automático da sessão

## Licença

Projeto em desenvolvimento.

A licença será definida posteriormente.
