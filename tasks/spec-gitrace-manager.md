# GitRace Manager — Specification

> Transforme contribuições GitHub em performance de F1. Acompanhe o calendário real, classifique durante a semana, corra no fim de semana.

---

## 1. Problem Statement

### O que estamos resolvendo?

Desenvolvedores contribuem no GitHub diariamente mas não têm uma forma divertida e competitiva de visualizar sua atividade. Gamificações existentes (GitHub Skyline, contribution graphs) são passivas e solitárias.

### Por que agora?

- O calendário F1 2025/2026 está em andamento — lançar alinhado com a temporada real cria urgência natural
- Developer experience e gamificação estão em alta (Advent of Code, Hacktoberfest)
- Já temos base técnica funcional (auth, sync GitHub, engine de scoring, Supabase schema)

### Conceito Central

O usuário é um **piloto** cujo carro evolui com base nas suas contribuições GitHub. A cada GP do calendário real da F1, há um **qualifying** durante a semana e uma **corrida** no fim de semana. Grids de 20 pilotos competem entre si, com promoção e rebaixamento entre divisões. O site **muda de tema** a cada GP — cores, bandeira, nome do circuito — tornando a experiência imersiva e conectada ao mundo real da F1.

---

## 2. User Stories

### US-1: Onboarding & GitHub Auth
**Como** desenvolvedor, **quero** fazer login com minha conta GitHub **para que** minhas contribuições sejam automaticamente conectadas ao jogo.

**Acceptance Criteria:**
- [ ] Login via GitHub OAuth (Supabase Auth)
- [ ] Perfil criado automaticamente com avatar, username e dados do GitHub
- [ ] Primeira sync de atividade acontece imediatamente após login
- [ ] Usuário é alocado em um grid de 20 pilotos (ou fila se grids cheios)

---

### US-2: Car Development (5 componentes)
**Como** piloto, **quero** ver meu carro evoluir com base nas minhas contribuições **para que** eu entenda como minha atividade impacta minha performance.

**Componentes do carro e mapeamento GitHub:**

| Componente | O que melhora | Contribuições GitHub |
|---|---|---|
| **Motor (Power Unit)** | Velocidade pura | Commits pushados |
| **Aerodinâmica** | Eficiência em curvas | PRs abertos e mergeados |
| **Confiabilidade** | Menos DNFs/incidentes | Consistência (dias ativos na semana) |
| **Pneus (Tire Mgmt)** | Degradação menor | Code reviews feitos |
| **Estratégia** | Melhor timing de pit | Issues abertas e fechadas |

**Acceptance Criteria:**
- [ ] Dashboard mostra 5 componentes com barras de progresso (0-100)
- [ ] Stats são recalculados a cada sync (a cada 6h via cron)
- [ ] Cada componente tem impacto claro na simulação de corrida
- [ ] Visualização de evolução ao longo da season (gráfico de linha)
- [ ] Tooltip/explicação de como melhorar cada componente

---

### US-3: Calendário Real F1 & Temas por GP
**Como** usuário, **quero** que o site siga o calendário real da F1 **para que** a experiência seja imersiva e conectada ao mundo real.

**Acceptance Criteria:**
- [ ] Calendário F1 2025/2026 cadastrado no sistema (circuito, país, datas)
- [ ] Home page mostra "próximo GP" com countdown
- [ ] Tema do site muda por GP (cores primárias, bandeira do país, nome do circuito)
- [ ] Entre GPs, site mostra standings e próximo evento
- [ ] Página de calendário com todos os GPs da season (passados com resultados, futuros com datas)

**Temas exemplo:**
- Interlagos: verde/amarelo, bandeira BR
- Monaco: vermelho/branco, bandeira MC
- Silverstone: azul/vermelho, bandeira UK
- Suzuka: branco/vermelho, bandeira JP

---

### US-4: Qualifying (segunda a sexta)
**Como** piloto, **quero** que minhas contribuições da semana definam minha posição no grid **para que** a corrida do fim de semana comece com posições justas.

**Mecânica:**
- Qualifying abre na **segunda-feira 00:00 UTC** da semana do GP
- Fecha na **sexta-feira 23:59 UTC**
- Contribuições GitHub da semana são synced e convertidas em "tempo de volta"
- Tempo de volta = f(componentes do carro) — quanto melhor o carro, menor o tempo
- Grid de largada definido do menor para maior tempo

**Acceptance Criteria:**
- [ ] Qualifying ativo apenas em semanas de GP real
- [ ] Página de qualifying mostra posições em tempo quase-real (atualiza a cada sync)
- [ ] Animação de "sessão ao vivo" — Q1, Q2, Q3 simulados (eliminação progressiva)
- [ ] Grid final publicado sexta à noite
- [ ] Notificação/banner "Qualifying is LIVE" durante a semana

---

### US-5: Race Day (sábado-domingo)
**Como** piloto, **quero** ver a simulação da corrida no fim de semana **para que** eu descubra meu resultado final e ganhe pontos.

**Mecânica:**
- Corrida é **calculada** (não real-time) com base em: posição no grid + stats do carro + eventos aleatórios
- Resultado disponível **domingo** alinhado com horário do GP real (ou logo após)
- Simulação gera uma **timeline de eventos** (texto narrativo, não 3D)

**Eventos da corrida (RNG influenciado por stats):**
- Ultrapassagens (mais prováveis com motor alto)
- Defesas (mais prováveis com aero alta)
- Pit stops (timing melhor com stat de estratégia alta)
- Incidentes/DNF (mais prováveis com confiabilidade baixa)
- Safety car (aleatório, reshuffla gaps)
- Chuva (aleatório, beneficia quem tem tire mgmt alto)
- Fastest lap (vai pro piloto com maior velocidade pura)

**Acceptance Criteria:**
- [ ] Simulação determinística dado o mesmo seed (reprodutível)
- [ ] Timeline mostra 50-70 voltas com eventos narrativos
- [ ] Resultado final com posições, pontos, e gaps
- [ ] Pontuação F1 real: 25-18-15-12-10-8-6-4-2-1 + fastest lap bonus
- [ ] Página de resultado do GP com podium visual (cards, não 3D)
- [ ] Timeline legível e emocionante ("Volta 43: Lucian ultrapassa Carlos com DRS na reta!")

---

### US-6: Grids de 20 & Divisões
**Como** piloto, **quero** competir contra 19 outros pilotos do meu nível **para que** as corridas sejam equilibradas e competitivas.

**Mecânica:**
- Novos usuários entram na divisão mais baixa
- Grids de exatamente 20 pilotos
- Ao final de cada corrida: top 3 sobem de divisão, bottom 3 descem
- Divisões nomeadas: F3 → F2 → F1 (ou mais, conforme userbase cresce)

**Acceptance Criteria:**
- [ ] Matchmaking automático agrupa pilotos por divisão
- [ ] Grid sempre tem 20 pilotos (bots/placeholders se necessário no início)
- [ ] Promoção/rebaixamento acontece após cada GP
- [ ] Usuário vê sua divisão atual e histórico de movimentação
- [ ] Standings separados por divisão + standings globais (total de pontos na season)

---

### US-7: Rivalidades
**Como** piloto, **quero** ter rivalidades automáticas com pilotos próximos no championship **para que** cada corrida tenha narrativa pessoal.

**Acceptance Criteria:**
- [ ] Sistema identifica 1-2 rivais (pilotos mais próximos no championship dentro do grid)
- [ ] Dashboard mostra comparativo lado-a-lado com rival
- [ ] Timeline da corrida destaca eventos envolvendo seus rivais
- [ ] Notificação quando rival te ultrapassa no championship

---

### US-8: Driver Card & Perfil Público
**Como** piloto, **quero** ter um card/perfil público com meus stats **para que** eu possa compartilhar e mostrar minha performance.

**Acceptance Criteria:**
- [ ] Card visual com: avatar, username, divisão, stats do carro, posição no championship
- [ ] Design inspirado em cards de F1/FIFA (rarity baseada na divisão?)
- [ ] Perfil público acessível via `/driver/[username]`
- [ ] Histórico de corridas com resultados
- [ ] Estatísticas da season (vitórias, pódios, pontos, melhor resultado)

---

### US-9: Leaderboard & Championship
**Como** usuário, **quero** ver o leaderboard da minha divisão e o global **para que** eu acompanhe minha posição na temporada.

**Acceptance Criteria:**
- [ ] Tabela de standings por divisão (20 pilotos)
- [ ] Tabela global de championship (todos os pilotos)
- [ ] Filtros: por divisão, por país, por organização GitHub
- [ ] Mini-gráfico de evolução de posição ao longo dos GPs
- [ ] Destaque para promoção/rebaixamento (verde/vermelho)

---

### US-10: Share & Social
**Como** piloto, **quero** compartilhar meus resultados **para que** eu atraia outros devs para o jogo.

**Acceptance Criteria:**
- [ ] OG image dinâmica por resultado de GP (Vercel OG)
- [ ] Botão de share para Twitter/X com texto pré-formatado
- [ ] Share card mostra: posição final, grid vs finish, pontos ganhos, circuito
- [ ] URL compartilhável `/race/[gpSlug]/result/[username]`

---

### US-11: Achievements & Badges
**Como** piloto, **quero** desbloquear conquistas **para que** eu tenha objetivos além de ganhar corridas.

**Exemplos de achievements:**
- "Pole Position" — P1 no qualifying
- "Comeback King" — ganhar 5+ posições na corrida
- "Consistency is Key" — contribuir todos os dias de uma semana de GP
- "Rain Master" — vencer corrida com chuva
- "Rookie of the Year" — melhor novato da season
- "Senna" — 3 poles consecutivas
- "The Professor" — 50+ code reviews em uma season

**Acceptance Criteria:**
- [ ] Sistema de achievements com trigger automático
- [ ] Badges visíveis no perfil e no driver card
- [ ] Notificação quando achievement é desbloqueado
- [ ] Página com todos os achievements (desbloqueados e locked)

---

## 3. Non-Goals (Scope Defense)

**NÃO estamos construindo:**

- ❌ Visualização 3D / Three.js — removemos completamente
- ❌ Decisões ativas do jogador (é passivo, contribuições definem tudo)
- ❌ Monetização / paywall (v1 é 100% gratuito)
- ❌ Chat / social features internos (Discord/Twitter são o canal social)
- ❌ App mobile nativo (web mobile-first é suficiente)
- ❌ Integração com outras plataformas além do GitHub (GitLab, Bitbucket — futuro)
- ❌ Multiplayer real-time / apostas
- ❌ Editor de livery/skin do carro (v1 só cor)

---

## 4. Arquitetura Técnica (High-level)

### Stack
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS 4
- **Backend:** Next.js API Routes + Supabase (Postgres + Auth + RLS)
- **Cron:** Vercel Cron Jobs (sync atividade + cálculo de corrida)
- **OG Images:** Vercel OG (share cards dinâmicas)
- **GitHub API:** GraphQL (contribuições)

### Schema Supabase (evolução do atual)

**Tabelas novas/modificadas:**
- `profiles` — adicionar: division, rival_id, car_stats (jsonb)
- `seasons` — adicionar: calendar (jsonb com GPs reais)
- `grand_prix` — **nova**: slug, name, country, flag, theme_colors, circuit, dates (quali_start, quali_end, race_date)
- `grids` — **nova**: gp_id, division, pilotos (array de profile_ids)
- `qualifying_results` — **nova**: gp_id, profile_id, grid_id, lap_time, position, q1/q2/q3 times
- `race_results` — **nova**: gp_id, profile_id, grid_id, grid_position, final_position, points, fastest_lap, dnf, events_log (jsonb)
- `race_events` — **nova**: gp_id, lap, event_type, description, involved_profiles
- `divisions` — **nova**: name (F3/F2/F1), level, min_position, max_position
- `achievements` — **nova**: slug, name, description, icon, criteria
- `profile_achievements` — **nova**: profile_id, achievement_id, unlocked_at, gp_id

### Cron Schedule
| Job | Schedule | O que faz |
|---|---|---|
| sync-activity | `0 */6 * * *` | Sync GitHub de todos os perfis |
| qualifying-update | `0 */6 * * 1-5` | Recalcula grid de qualifying (seg-sex) |
| race-simulate | Domingo do GP, horário real | Roda simulação e publica resultado |
| division-update | Após race-simulate | Promoção/rebaixamento entre divisões |

---

## 5. UI/UX — Páginas Principais

### Home (`/`)
- Hero com próximo GP (countdown, bandeira, circuito)
- Tema visual muda por GP
- Top 3 do championship global
- CTA: "Sign in with GitHub to race"

### Dashboard (`/dashboard`)
- Seu driver card
- 5 componentes do carro com barras de progresso
- Próximo evento (qualifying ou corrida)
- Posição atual no championship da divisão
- Rival comparativo

### Qualifying (`/gp/[slug]/qualifying`)
- Grid ao vivo (atualiza a cada sync)
- Simulação visual de Q1/Q2/Q3 com eliminações
- Seu tempo vs rivais
- Countdown para encerramento

### Race Result (`/gp/[slug]/race`)
- Podium visual (cards com confetti CSS, não 3D)
- Timeline de eventos da corrida (scrollable, por volta)
- Tabela de resultado final (posição, gap, pontos)
- Botão de share

### Leaderboard (`/leaderboard`)
- Tabs por divisão (F3, F2, F1)
- Championship standings com mini-gráfico
- Destaque promoção/rebaixamento
- Filtro global

### Calendário (`/calendar`)
- Todos os GPs da season
- Passados com resultado resumido
- Futuros com datas e countdown
- Visual inspirado no calendário oficial da F1

### Driver Profile (`/driver/[username]`)
- Driver card completo
- Histórico de GPs (grid → finish por corrida)
- Stats da season
- Achievements/badges
- Componentes do carro

---

## 6. Decisões Tomadas

1. **Grids incompletos** → Bots preenchem vagas até 20. Usuários solo podem correr contra bots (modo "time trial"). Bots têm stats variados para simular competição real.
2. **Contribuições** → Conta TUDO (públicas + privadas). Usuário precisa autorizar scope completo no GitHub OAuth.
3. **Sprint races** → Incluir sprints do calendário real. Em weekends com sprint: qualifying sex, sprint sáb, corrida dom. Pontos de sprint: 8-7-6-5-4-3-2-1.

## 7. Open Questions (restantes)

1. **Off-season** — O que acontece entre temporadas? Reset completo? Soft reset?
2. **Timezone** — Qualifying e corrida em UTC? Ou ajustar ao timezone do GP real?
3. **Penalidades** — Pilotos que não contribuem nada na semana: DNF automático? Ou largam por último com stats zerados?
