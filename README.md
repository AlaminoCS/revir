# Revir - Frontend

## 📋 Visão Geral
Aplicação Angular para gestão de vendas com:
- Autenticação de usuários
- Registro de vendas
- Cálculo automático de totais
- Interface responsiva com Angular Material

**Stack**: Angular 17+, Material UI, Arquitetura Limpa + Atomic Design

---

## 🏗️ Arquitetura do Projeto
### Estrutura de Componentes
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

### Principais Funcionalidades Implementadas
- **Sistema de Login** com validação
- **Header** com navegação e informações do usuário
- **Painel de Vendas** com:
  - Filtro de produtos/preços
  - Tabela de itens adicionados
  - Cálculo automático de total
  - Gestão de itens (adicionar/remover)

---

## 🚀 Como Executar
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
ng serve

# Acessar no navegador
http://localhost:4200
```

---

## 🔧 Principais Comandos
| Comando | Descrição |
|---------|-----------|
| `ng generate component` | Cria novo componente |
| `ng build` | Gera versão para produção |
| `ng test` | Executa testes unitários |

---

## 🛠️ Dependências Principais
| Pacote               | Versão   | Uso                     |
|----------------------|----------|-------------------------|
| Angular              | 17+      | Framework principal     |
| Angular Material     | ^20.0.3  | Componentes UI          |
| RxJS                 | ~7.8.0   | Programação reativa     |

---

## 📌 Próximas Implementações
- [ ] Integração com backend real
- [ ] Geração de relatórios
- [ ] Gestão de estoque
- [ ] Dashboard analítico

---

## 🤝 Contribuição
1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença
[MIT](https://choosealicense.com/licenses/mit/)
