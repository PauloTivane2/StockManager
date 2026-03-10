# StockManager - Gestão de Estoque

Sistema profissional de gestão de estoque contruído com Next.js 16 (App Router), Prisma, PostgreSQL e Tailwind CSS.

## 📦 Setup do Banco de Dados (PostgreSQL)

O projecto foi configurado para utilizar PostgreSQL com o ORM **Prisma**.

### 1. Pré-requisitos
- Tens de ter o [Node.js](https://nodejs.org) ou [Bun](https://bun.sh/) instalado
- Instalar o **PostgreSQL** localmente (porta 5432) ou usar um banco de dados online (ex: Supabase, Neon)

### 2. Configurar Variáveis de Ambiente
1. Copia o ficheiro `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abre o ficheiro `.env` e configura a `DATABASE_URL` com as tuas credenciais do PostgreSQL. Por padrão:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/stockmanager?schema=public"
   ```
*(Substitui `postgres` e `password` pelo teu user/senha e `stockmanager` pelo nome do banco)*

### 3. Sincronizar e Preparar o Banco (Migrations)
Com o teu PostgreSQL a correr, executa os comandos na ordem:

1. Gerar os clientes do Prisma:
   ```bash
   bun run db:generate
   ```

2. Executar as migrações (cria as tabelas no DB):
   ```bash
   bun run db:migrate
   ```

3. Popular o banco de dados inicial (Seed com Admin e Produtos Base):
   ```bash
   bun run db:seed
   ```

### 4. Gestão Visual (Prisma Studio)
Podes visualizar, editar e gerir os dados directamente no browser através do **Prisma Studio**:
```bash
bun run db:studio
```

---

## 🚀 Rodar o Projecto
Depois de ter o banco de dados configurado, podes rodar a aplicação:

```bash
bun run dev   # ou npm run dev
```
Acede a [http://localhost:3000](http://localhost:3000)
