# 📚 Minha Lista de Leitura

Sistema completo de gerenciamento de lista de leitura com React, Tailwind CSS e Firebase.

## 🚀 Funcionalidades

- ✅ Adicionar livros com foto, nome, link de compra e categoria
- ✅ Marcar livros como "Já lido" e "Comprado"
- ✅ Editar informações dos livros
- ✅ Excluir livros
- ✅ Filtrar por status (lido/não lido, comprado/não comprado)
- ✅ Filtrar por categoria
- ✅ Modo escuro/claro
- ✅ Banco de dados em tempo real (Firebase Firestore)
- ✅ Design responsivo

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- NPM ou Yarn
- Conta no Firebase (gratuita)

## 🔧 Como Instalar

### 1. Extrair os arquivos

Extraia o arquivo ZIP em uma pasta de sua preferência.

### 2. Instalar dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 3. Configurar o Firebase

#### 3.1. Criar projeto no Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Digite um nome para o projeto (ex: "minha-lista-leitura")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

#### 3.2. Criar banco de dados Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Iniciar no modo de teste" (para desenvolvimento)
4. Escolha a localização (ex: southamerica-east1 para São Paulo)
5. Clique em "Ativar"

#### 3.3. Obter credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ > "Configurações do projeto"
2. Role até "Seus aplicativos" e clique no ícone `</>`  (Web)
3. Digite um nome para o app (ex: "web-app")
4. Clique em "Registrar app"
5. Copie as informações do `firebaseConfig`

#### 3.4. Configurar as credenciais no projeto

Abra o arquivo `src/config/firebase.js` e substitua as informações:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_AUTH_DOMAIN_AQUI",
  projectId: "SEU_PROJECT_ID_AQUI",
  storageBucket: "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID_AQUI",
  appId: "SEU_APP_ID_AQUI"
};
```

#### 3.5. Configurar regras de segurança (IMPORTANTE)

1. No Firestore, clique na aba "Regras"
2. Substitua as regras por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /books/{bookId} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em "Publicar"

**ATENÇÃO**: Essas regras são para desenvolvimento. Para produção, implemente regras de autenticação adequadas.

## 🎮 Como Usar

### Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O site estará disponível em: http://localhost:5173

### Build para produção

```bash
npm run build
```

## 📱 Como Usar o Site

### Adicionar um livro

1. Clique em "Adicionar Livro" no menu
2. Preencha as informações:
   - Título (obrigatório)
   - URL da foto (opcional)
   - Link para comprar (opcional)
   - Categoria (obrigatório)
   - Marque se já comprou ou já leu
3. Clique em "Adicionar Livro"

### Visualizar e filtrar livros

1. Na tela principal, você verá todos os seus livros
2. Use os filtros para ver:
   - Livros já lidos ou não lidos
   - Livros comprados ou não comprados
   - Livros por categoria

### Editar um livro

1. Clique no botão "Editar" no card do livro
2. Modifique as informações
3. Clique em "Atualizar Livro"

### Marcar como lido ou comprado

Clique diretamente nos checkboxes no card do livro.

### Excluir um livro

Clique no botão "Excluir" no card do livro e confirme.

### Alternar modo escuro/claro

Clique no botão 🌙/☀️ no canto superior direito.

## 🎨 Tecnologias Utilizadas

- React 18
- Vite
- Tailwind CSS
- Firebase Firestore
- React Router DOM

## 📝 Estrutura do Projeto

```
book-reading-list/
├── src/
│   ├── components/
│   │   ├── Header.jsx       # Cabeçalho e navegação
│   │   └── BookCard.jsx     # Card de exibição do livro
│   ├── pages/
│   │   ├── BookList.jsx     # Página principal com lista
│   │   └── AddBook.jsx      # Página de adicionar/editar
│   ├── config/
│   │   └── firebase.js      # Configuração do Firebase
│   ├── App.jsx              # Componente principal
│   ├── main.jsx            # Entry point
│   └── index.css           # Estilos globais
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🐛 Solução de Problemas

### Erro ao conectar com Firebase

- Verifique se as credenciais em `src/config/firebase.js` estão corretas
- Verifique se o Firestore Database está ativado no console do Firebase
- Verifique se as regras de segurança estão configuradas

### Imagens não aparecem

- Verifique se a URL da imagem está correta e acessível
- Algumas URLs podem ter restrições de CORS

### Erro ao instalar dependências

```bash
# Limpe o cache do npm
npm cache clean --force

# Delete node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstale
npm install
```

## 📄 Licença

Projeto livre para uso pessoal e educacional.

## 🤝 Suporte

Para dúvidas ou problemas, verifique:
- Documentação do Firebase: https://firebase.google.com/docs
- Documentação do React: https://react.dev
- Documentação do Tailwind: https://tailwindcss.com

---

Desenvolvido com ❤️
