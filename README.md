# 🚀 Sistema de Reserva de Recursos Escolares v1.2


<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Status-Ativo-brightgreen?style=for-the-badge" alt="Status">
</p>

## ✨ Sobre o Projeto

Cansado de planilhas e trocas de e-mail para gerenciar os carrinhos de Chromebooks, iPads ou a sala de multimídia? Este projeto é uma solução completa e moderna para a gestão de recursos compartilhados em ambientes educacionais.

Desenvolvido como uma **Single Page Application (SPA)**, o sistema oferece uma experiência de utilizador fluida e responsiva, permitindo que professores façam solicitações de forma intuitiva e que a equipe de TI administre tudo através de um painel de controlo poderoso.

---

## 👨‍🏫 Funcionalidades Principais

### Para Professores (e outros colaboradores):
- **Interface Intuitiva:** Uma página inicial limpa e direta para escolher o recurso desejado.
- **Visualização de Conflitos:** O sistema avisa em tempo real se um horário já está ocupado ou se há um pedido pendente.
- **Formulário Estruturado:** Campos organizados para detalhar o local e a atividade, garantindo que a TI receba toda a informação necessária.
- **Minhas Reservas:** Uma página pessoal para acompanhar o status (`pendente`, `aprovada`, `recusada`) de todos os pedidos.
- **Feedback Claro:** O motivo de uma recusa é sempre exibido para o utilizador.
- **Design Responsivo:** Acesso perfeito a partir de qualquer dispositivo, seja um computador, tablet ou telemóvel.

### Para a Equipe de TI (Administradores): 🛡️
- **Painel de Administração Centralizado:** Uma área completa com três visões estratégicas:
  1.  **Grade Diária:** Uma visualização horizontal e rolável de todos os recursos, mostrando as reservas do dia para uma logística rápida.
  2.  **Programação da Semana:** Uma grelha de Segunda a Sábado para planeamento a médio prazo.
  3.  **Lista de Pedidos:** Uma tabela detalhada com filtros poderosos para encontrar qualquer reserva.
- **Gestão Simplificada:** Aprove ou recuse pedidos com um clique. É obrigatório fornecer um motivo para a recusa.
- **Relatórios Avançados:** Uma página dedicada a business intelligence com filtros por data, departamento e recurso.
- **Exportação para PDF:** Gere relatórios em PDF, tanto sumários como detalhados, com um clique.

---

## 🛠️ Tecnologias Utilizadas

Este projeto é um monorepo com duas partes principais:

| Componente | Tecnologia Principal | Descrição |
| :--- | :--- | :--- |
| **Frontend** | **React & Vite** | Interface reativa e moderna, com um ambiente de desenvolvimento ultrarrápido. |
| | **Tailwind CSS** | Framework de estilização para um design profissional e responsivo. |
| **Backend** | **Node.js & Express**| API RESTful robusta para gerir toda a lógica de negócio. |
| | **MS SQL Server** | Base de dados para armazenamento persistente de todos os dados. |
| | **PDFKit** | Biblioteca para a geração dinâmica de relatórios em PDF. |

---

## 🚀 Como Executar o Projeto

Para ter o ambiente completo a correr localmente, siga estes passos:

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Git](https://git-scm.com/)
- Um servidor Microsoft SQL Server a correr.

### 1. Backend (API)

```bash
# Clone o repositório do backend (se já não o tiver)
git clone https://github.com/seu-usuario/reservas-api.git

# Entre na pasta
cd reservas-api

# Instale as dependências
npm install

# Inicie o servidor
node server.js