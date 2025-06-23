
# Revir - Frontend

## 📋 Visão Geral
Aplicação Angular para gestão [insira propósito do projeto aqui].  
**Stack**: Angular 17+, Material UI, Arquitetura Limpa + Atomic Design.

---

## 🏗️ Arquitetura
### Estrutura Híbrida
```
src/app/
│
├── core/                      # Camada de domínio (Clean Architecture)
│   ├── application/           # Casos de uso e serviços
│   ├── domain/                # Modelos e interfaces
│   └── infrastructure/        # Implementações concretas
│
├── ports/                     # Portas e adaptadores (Hexagonal)
│   ├── input/                 # Portas de entrada
│   └── output/                # Portas de saída
│
├── ui/                        # Atomic Design
│   ├── atoms/                 # Componentes mínimos (buttons, inputs)
│   ├── molecules/             # Combinações (forms, cards)
│   ├── organisms/             # Componentes complexos
│   ├── templates/             # Layouts estruturais
│   └── pages/                 # Páginas/rotas (ex: login)
│
└── shared/                    # Utilitários
    ├── pipes/                 # Pipes Angular
    └── directives/            # Diretivas customizadas
```

### Princípios Adotados
- **Clean Architecture**: Separação clara entre regras de negócio e detalhes técnicos
- **Atomic Design**: Componentização progressiva para reúso máximo
- **Standalone Components**: Angular 17+ sem NgModule

---

## 🚀 Execução
```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm start

# Build para produção
npm run build
```

---

## ✨ Funcionalidades Implementadas
### Página de Login
- Validação de credenciais mockadas:
  ```ts
  { usuário: "xxxx", senha: "xxxx" }
  ```
- Features:
  - Toggle de visibilidade de senha (👁️)
  - Card centralizado com background image
  - Mensagens de erro contextualizadas
  - Design com Angular Material

---

## 📌 Próximos Passos
- [ ] Integração com backend real
- [ ] Componente de loading
- [ ] Internacionalização (i18n)
- [ ] Testes unitários

---

## 🛠️ Dependências Principais
| Pacote               | Versão   |
|----------------------|----------|
| Angular              | 17+      |
| Angular Material     | ^20.0.3  |
| RxJS                 | ~7.8.0   |

---

## 🤝 Contribuição
1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request
