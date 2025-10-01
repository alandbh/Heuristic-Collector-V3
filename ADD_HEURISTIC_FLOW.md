# Fluxo da Funcionalidade - Adicionar Nova Heurística

## Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                        PÁGINA ADD-HEURISTIC                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. CARREGAR PÁGINA                                             │
│    ├─ Buscar todos os projetos (QUERY_ALL_PROJECTS)           │
│    └─ Exibir dropdown de projetos                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. USUÁRIO SELECIONA PROJETO                                   │
│    ├─ Buscar dados do projeto (QUERY_PROJECT_BY_ID)           │
│    ├─ Buscar heurísticas (QUERY_HEURISTICS_FROM_PROJECT)      │
│    ├─ Buscar players (QUERY_PLAYERS_FROM_PROJECT)             │
│    └─ Exibir dropdown de heurísticas                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. USUÁRIO SELECIONA HEURÍSTICA                                │
│    ├─ Determinar journeys aplicáveis                           │
│    │   ├─ Se isOverlapJourneys = true E journeys vazias        │
│    │   │   └─ Usar todas as journeys do projeto                │
│    │   └─ Senão                                                │
│    │       └─ Usar journeys da heurística                      │
│    ├─ Filtrar players não aplicáveis                           │
│    └─ Exibir tabela de players                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. USUÁRIO CLICA "APLICAR" EM UM PLAYER                        │
│    ├─ Exibir modal de confirmação                              │
│    └─ Aguardar confirmação do usuário                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. USUÁRIO CONFIRMA AÇÃO                                       │
│    ├─ Fazer backup do scoresObject original                    │
│    ├─ Criar novo scoresObject com heurística                  │
│    │   ├─ Para cada journey selecionada:                      │
│    │   │   ├─ Verificar se heurística já existe               │
│    │   │   │   ├─ Se existe: Retornar erro                    │
│    │   │   │   └─ Se não existe: Continuar                    │
│    │   │   └─ Adicionar objeto de score                       │
│    │   └─ Aplicar mutação (MUTATION_SCORE_OBJ)                │
│    └─ Atualizar status do player                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESULTADO                                                    │
│    ├─ Sucesso: Status "Aplicado" + botão "Reverter"           │
│    └─ Erro: Status "Erro" + mensagem + botão "Retry"          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. USUÁRIO PODE REVERTER (OPCIONAL)                            │
│    ├─ Clicar em "Reverter"                                     │
│    ├─ Confirmar ação                                           │
│    ├─ Restaurar scoresObject original do backup                │
│    └─ Aplicar mutação para restaurar                           │
└─────────────────────────────────────────────────────────────────┘
```

## Estados dos Players

```
┌─────────────┬──────────────┬─────────────┬─────────────────────┐
│   Player    │    Status    │   Ação      │     Descrição       │
├─────────────┼──────────────┼─────────────┼─────────────────────┤
│ Player 1    │   Pending    │  [Aplicar]  │ Aguardando ação     │
│ Player 2    │   Applied    │ [Reverter]  │ Heurística aplicada │
│ Player 3    │    Error     │   [Retry]   │ Erro na aplicação   │
│ Player 4    │     N/A      │    -        │ Não aplicável       │
│ Player 5    │   Loading    │    -        │ Processando...      │
└─────────────┴──────────────┴─────────────┴─────────────────────┘
```

## Estrutura de Dados

### Backup em Memória
```javascript
playersBackup = {
  "player-1": { /* scoresObject original */ },
  "player-2": { /* scoresObject original */ },
  // ...
}
```

### Status dos Players
```javascript
playersStatus = {
  "player-1": { status: "applied", message: "Sucesso" },
  "player-2": { status: "error", message: "Erro de rede" },
  // ...
}
```

### Objeto de Score Gerado
```javascript
{
  id: "player-1-journey-1-h1.1",
  note: "",
  group: {
    name: "Usabilidade",
    groupNumber: 1
  },
  heuristic: {
    heuristicNumber: "1.1"
  },
  scoreValue: 0,
  evidenceUrl: ""
}
```

## Validações Implementadas

1. **Heurística Duplicada**: Verifica se já existe antes de adicionar
2. **Player Não Aplicável**: Exclui players da lista de not_applicaple_players
3. **Confirmação de Ação**: Modal antes de aplicar/reverter
4. **Backup Automático**: Salva estado original antes de alterar
5. **Tratamento de Erros**: Captura e exibe erros de forma amigável

## Segurança

- ✅ **Backup Automático**: Estado original sempre preservado
- ✅ **Validação de Duplicatas**: Evita dados inconsistentes
- ✅ **Confirmação de Ações**: Previne alterações acidentais
- ✅ **Controle Individual**: Cada player processado separadamente
- ✅ **Rollback Disponível**: Possibilidade de reverter alterações
