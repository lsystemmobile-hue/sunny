
# Grupo Sunny Energia — Site + Simulador + Dashboard

Site institucional one-page com simulador solar inteligente que calcula economia em segundos, envia o lead direto para o WhatsApp e salva tudo num painel administrativo protegido.

---

## 1. Identidade visual

- Tema escuro premium, alto contraste
- Paleta: amarelo `#fb9b08` (primário), branco `#fcfcfc`, fundo `#0b0b0b`
- Tipografia grande, layout limpo
- Cards com efeito glass (blur leve + borda sutil)
- Animações fade + slide on-scroll
- Botões CTA chamativos com hover/glow

Tudo configurado via design system (tokens HSL no `index.css` + `tailwind.config.ts`) para manter consistência.

---

## 2. Estrutura da landing page (rota `/`)

Ordem das seções:

1. **Header fixo** — logo "Grupo Sunny Energia" + navegação âncora (Simulador, Benefícios, Depoimentos, Sobre, Contato)
2. **Hero** — título, subtítulo, CTA primário "Simular minha economia" (scroll suave até simulador) + CTA secundário "Falar no WhatsApp"
3. **Simulador Solar** — card glass centralizado com formulário
4. **Resultado** — aparece dinamicamente abaixo do simulador (loading → sucesso → erro)
5. **Benefícios** — 5 cards com ícones e hover de elevação
6. **Prova Social** — grid responsivo com 3 depoimentos + selo "Mais de 100 clientes atendidos na região"
7. **Sobre** — descrição da empresa + endereço
8. **Contato** — WhatsApp, Instagram, horário
9. **Footer** — copyright e links rápidos
10. **Botão WhatsApp flutuante** — sempre visível (mobile e desktop)

---

## 3. Simulador solar

**Campos do formulário:**

| Campo | Tipo | Validação |
|---|---|---|
| Valor da conta de luz | Input com máscara R$ | Obrigatório, > 0 |
| Tipo de imóvel | Select: Residencial / Comercial / Rural | Obrigatório |
| Cidade/Estado | Input texto | Obrigatório |
| Possui espaço no telhado? | Toggle Sim/Não | Obrigatório |
| Nome | Input texto | Obrigatório, mín 2 |
| WhatsApp | Input com máscara (xx) xxxxx-xxxx | Obrigatório, validar formato |

**Lógica de cálculo (executada no clique):**

```text
consumo_kwh    = valor_conta / 0.95
modulos        = ceil(consumo_kwh / 60)
potencia_kwp   = modulos * 0.55
economia_mes   = valor_conta * 0.70
economia_ano   = economia_mes * 12
investimento   = modulos * 2500
payback_meses  = investimento / economia_mes
```

**Estados do resultado:**

- **Loading**: spinner amarelo + "Calculando sua economia..."
- **Sucesso**: card glass com todos os números formatados (R$ e kWh) + disclaimer "Valores estimados. Orçamento final após visita técnica." + CTA grande "Enviar resultado para WhatsApp" com mensagem dinâmica pré-preenchida
- **Erro**: toast + mensagem "Preencha todos os campos corretamente"

Validação client-side com Zod + mensagens claras por campo.

---

## 4. Integração WhatsApp

Número da empresa: **(15) 99179-8612** → `5515991798612`

Dois pontos de envio:
- **Hero / Flutuante**: mensagem fixa "Olá! Gostaria de saber mais sobre energia solar."
- **Após resultado**: mensagem dinâmica com os valores da simulação (template do brief)

Tudo via `https://wa.me/...?text=...` com `encodeURIComponent`.

---

## 5. Backend (Lovable Cloud)

**Tabela `simulacoes`** com todos os campos do brief + `created_at`. Salvar automaticamente após cálculo bem-sucedido (antes mesmo do clique no WhatsApp, para capturar o lead).

RLS:
- `INSERT` público (qualquer visitante pode criar uma simulação)
- `SELECT` apenas para usuários com role `admin`

**Tabela `user_roles`** + enum `app_role` + função `has_role()` SECURITY DEFINER (padrão recomendado, isolada da tabela de perfis para evitar escalonamento de privilégios).

---

## 6. Área administrativa

**Rota `/admin/login`** — formulário email + senha
- Auto-confirm de e-mail ativado para acesso imediato
- O primeiro usuário que se cadastrar será promovido a admin manualmente via SQL (instruções entregues após o build)

**Rota `/admin/dashboard`** (protegida — redireciona para login se não autenticado ou se não tiver role `admin`):

1. **Cards de métricas** (topo):
   - Total de simulações
   - Leads do dia
   - Média de consumo (kWh)
   - Média de módulos

2. **Filtros**: nome, cidade, tipo de imóvel, intervalo de datas

3. **Tabela de leads** com colunas: Nome, WhatsApp, Cidade, Tipo, Conta R$, Módulos, Economia mensal, Data
   - Ação "Chamar no WhatsApp" (abre wa.me com mensagem personalizada)
   - Ação "Ver detalhes" (abre modal)

4. **Modal de detalhes** com todos os campos da simulação formatados

5. **Logout** no header

---

## 7. UX e responsividade

- Mobile-first, breakpoints testados em 360px, 768px, 1280px
- Scroll suave em todas as âncoras
- Feedback visual: toasts para sucesso/erro, estados de loading nos botões, hover/active em todos os elementos interativos
- Animações de entrada nas seções via Intersection Observer
- Acessibilidade: labels nos inputs, contraste AA, foco visível

---

## 8. Detalhes técnicos

- **Stack**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **Routing**: React Router (`/`, `/admin/login`, `/admin/dashboard`, `*` 404)
- **Forms**: react-hook-form + Zod
- **Backend**: Lovable Cloud (Supabase) — auth email/senha, tabelas `simulacoes` e `user_roles`, RLS completa
- **Componentes modulares**: `Hero`, `Simulator`, `SimulatorResult`, `Benefits`, `Testimonials`, `About`, `Contact`, `FloatingWhatsApp`, `AdminLayout`, `LeadsTable`, `LeadDetailModal`, `MetricsCards`
- **Helpers**: `lib/calc.ts` (fórmulas), `lib/whatsapp.ts` (montagem de URLs), `lib/format.ts` (R$/kWh)
- **Auth guard**: hook `useRequireAdmin` que verifica sessão + role `admin`

---

## Pós-build (entregue ao usuário)

- Como criar a primeira conta em `/admin/login`
- Snippet SQL para promover esse usuário a `admin` (uma única execução)
- Como trocar o número de WhatsApp ou os depoimentos no futuro
