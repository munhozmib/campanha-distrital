# Configuração do Banco de Dados

## Recomendação: Supabase (gratuito, PostgreSQL)

### Por que Supabase?
- Free tier generoso: 500 MB, projetos ilimitados
- PostgreSQL gerenciado sem configuração de servidor
- Dashboard bonito para visualizar respostas
- API REST automática (já usada neste projeto)
- Exportação para CSV em 1 clique

### Passo a passo

#### 1. Criar conta e projeto
1. Acesse https://supabase.com e crie uma conta gratuita
2. Clique em "New project"
3. Dê um nome (ex: `pesquisa-zaqueu`) e anote a senha do banco
4. Escolha a região **South America (São Paulo)**
5. Aguarde ~2 minutos para provisionar

#### 2. Criar a tabela `responses`
No dashboard do Supabase, vá em **SQL Editor** e execute:

```sql
CREATE TABLE responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text,
  q1          text,   -- Eleger sem sujar?
  q2          text,   -- Conhece o Zaqueu?
  q3          text,   -- Votaria?
  q4          text,   -- Sabia das UBS?
  q5          text[], -- Redes sociais (array)
  q6          text,   -- Quer acompanhar?
  nome        text,   -- Nome (se q6=Sim)
  telefone    text,   -- Telefone (se q6=Sim)
  user_agent  text,
  ip          text,
  created_at  timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (anon key pode inserir)
CREATE POLICY "Permitir insert público"
  ON responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permitir SELECT público (para os gráficos de resultado)
CREATE POLICY "Permitir select público"
  ON responses FOR SELECT
  TO anon
  USING (true);
```

#### 3. Pegar as credenciais
No dashboard do Supabase:
- Vá em **Settings → API**
- Copie:
  - **Project URL** → esse é o `SUPABASE_URL`
  - **anon / public key** → esse é o `SUPABASE_ANON_KEY`

#### 4. Configurar no Netlify
No dashboard do Netlify:
1. Vá em **Site settings → Environment variables**
2. Adicione:
   - `SUPABASE_URL` = `https://SEU_PROJETO.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJ...` (a chave anon)
3. Faça um redeploy (ou só salve — o próximo deploy já usa as vars)

### Exportar respostas como CSV
No Supabase: **Table Editor → responses → Export → CSV**

Ou via SQL:
```sql
SELECT * FROM responses ORDER BY created_at DESC;
```
