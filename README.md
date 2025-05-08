# Neuro Forge – Project proposal

Developed by: Alaman and Atabek
## 1 · High‑Concept

- _Genre_: Strategy / Tycoon with real‑time PvP duels.
    
- _Fantasy_: Found an AI startup, train multiple models, publish them, and battle other founders on AI benchmarks.
    
- _USP_: Combines Clash‑style passive income/base building with Chess‑like rating duels—plus genuine AI learning mini‑games.
    

## 2 · Gameplay Loops

### 2.1 Builder / Management (Long‑term)

- Deploy models to a public **Marketplace** → earn _Cloud Credits_ passively.
    
- Upgrade **Data Center**, **Datasets**, **Talent**. Timers mirror _Clash of Clans_ (no shields in prototype).
    

### 2.2 Battle Loop (Mid‑term)

- **Benchmark Duels**: head‑to‑head tasks (classification speed, compression ratio, etc.).
    
- Elo‑style ladder, season resets, clan tournaments.
    

### 2.3 Mini‑Games (Short‑term Skill Tests)

| Mini‑game         | Purpose            | Reward          |
| ----------------- | ------------------ | --------------- |
| Data‑Label Dash   | Teach labeling     | XP + Credits    |
| Hyper‑Tune Slider | Hyper‑param search | Research Pts    |
| Bias Detective    | Fairness           | Rare Dataset    |
| Logic Trace       | Debugging          | Speed‑up tokens |

## 3 · Passive‑Income Mechanics

1. **Go Live** → model gets popularity score.
    
2. Simulated request stream drives credits/min.
    
3. Credits stored in API Wallet.
    

## 4 · Tech Stack (v0.1)

- **Backend**: Java 21, Spring Boot 3.2 (WebFlux), STOMP WebSocket.
    
- **Gateway**: Spring Cloud Gateway 4.x.
    
- **DB**: PostgreSQL 16 (JSONB) via Spring Data R2DBC.
    
- **Cache/Queues**: Redis 7.2 (pub/sub, leaderboards).
    
- **Front‑end**: React 18 + Vite; Phaser 3.70 for mini‑games.
    
- **Observability**: Micrometer → Prometheus + Grafana.
    
- **Deploy**: Docker → Kubernetes (HPA on WebSocket queue).
    

## 5 · Data Model Sketch

- player, model, resource_wallet, match tables.
    

## 6 · Road‑Map

| Phase         | Timeline | Milestones                                |
| ------------- | -------- | ----------------------------------------- |
| Prototype     | 6 weeks  | Single‑node server, 1 duel mode, basic UI |
| Alpha         | +3 mo    | Ladder, clans, 3 resources                |
| Closed Beta   | +6 mo    | Monetization, social, 10 k CCU load‑test  |
| Global Launch | +3 mo    | Regional shards, mobile wrappers          |

## 7 · Open Tasks

- Finalize economy balance sheet.
    
- Decide Phaser vs. Pixi for mini‑games.
    
- Spike Spring Boot + R2DBC + Redis skeleton.
    
- Name the game! 🔥
    

## 4 · Data‑Layer Load Assumptions (draft)

### 4.1 Traffic & Concurrency (target soft‑launch)

- **DAU**: ~500 000 (20 % peak concurrency → **CCU ≈ 20 k**).
    
- **Matches / active user / hour**: 4.
    
- **Passive credit ticks**: every 60 s for deployed models.
    

### 4.2 Write‑Amplification Math

| Event                                                                                                                                                       | Writes to `wallet`     | Writes to `elo`   | Expected rps (peak)                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------- | -------------------------------------------- |
| Match‑end (both players)                                                                                                                                    | `+1`                   | `+1`              | `(CCU × 2 matches/min) / 60 ≈ 667`           |
| Passive tick                                                                                                                                                | `+1`                   | –                 | `(Deployed models × req/s conversion) ≈ 200` |
| Manual spend (upgrades, speed‑ups)                                                                                                                          | `+1`                   | –                 | ~150                                         |
| **Total peak**                                                                                                                                              | **≈ 1 000 wallet rps** | **≈ 700 elo rps** |                                              |
| _All writes are single‑row `UPDATE wallet SET credits = credits + ? WHERE player_id …` or `UPDATE wallet SET credits = credits - ?` with optimistic check._ |                        |                   |                                              |

### 4.3 Database & Cache Sizing

- **PostgreSQL 16**: 1 000 rps × 3x write amplification ≈ 3 000 TPS ⇒ <10 MB/s WAL ⇒ fits on a single C‑class node (8 vCPU, 32 GB) with 100 connections.
    
- **R2DBC pool**: 2 × peak rps latency budget (200 ms) ⇒ 200 connections cluster‑wide.
    
- **Redis**:
    
    - Sorted‑set leaderboard updates: 700 rps (ELO) – under 1 % CPU on single‑shard.
        
    - Use `ZINCRBY` pipelines to batch.
        

### 4.4 Currency Model Recommendation

| Option                                           | Pros                                     | Cons                                     | Verdict                |
| ------------------------------------------------ | ---------------------------------------- | ---------------------------------------- | ---------------------- |
| **Single soft‑currency “Cloud Credits”**         | Simple UX, easier economy math           | Harder to gate “early vs. late” upgrades | ✅ Start here for MVP   |
| Dual‑currency (Credits + rare “Research Points”) | Allows long‑term grind & premium bundles | More balance work                        | Phase 2 (Beta)         |
| Triple (Credits + GPU tokens + Data shards)      | Thematic depth, clan specialization      | Risk of confusion; bloat                 | Only if KPIs show need |

> **Recommendation:** Launch with one currency for all purchases + time‑based progression. Add a rare booster currency once retention data shows mature players racing through tiers.

## 8 · Wireframes (text mockups — v0.1)

> Первые черновики экранов. Размеры и иконки условные; в Figma будет точная сетка.

### 8.1 Lobby Dashboard

```
+-----------------------------------------------------------+
| Wallet: 12 345 Credits                     Play [▶]       |
+-----------------------------------------------------------+
|  [ DATA CENTER ]   [ DATASETS ]   [ TALENT ]              |
|    Lvl 3 (05:41)       New!          Lvl 2               |
+-----------------------------------------------------------+
| Mini‑Games:  [Label Dash] (Ready)   [Hyper‑Tune] (00:17) |
+-----------------------------------------------------------+
```

### 8.2 Duel Canvas

```
┌───────────────────────── Duel ─────────────────────────┐
│  You ⚡ 83 % ████████████            ███████ 68 %  Opp │
│                                                       │
│     Tasks solved: 12 / 20             10 / 20          │
└─────────────────────────────────────────────────────────┘
```

### 8.3 Upgrade Modal

```
┌─ Upgrade GPU Rack ─────────────────────────────────────┐
│  Current Level: 3           Next Bonus: +5 % TPS       │
│  Cost: 9 700 Credits                                   │
│                                                        │
│  [Cancel]                             [Upgrade ✓]      │
└─────────────────────────────────────────────────────────┘
```
