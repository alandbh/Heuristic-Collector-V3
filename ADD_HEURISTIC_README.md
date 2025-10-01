# Funcionalidade: Adicionar Nova Heurística

## Visão Geral

Esta funcionalidade permite adicionar uma nova heurística a um projeto já em andamento, sem comprometer os dados existentes dos players. A implementação foi feita de forma segura, permitindo controle granular por player.

## Como Acessar

Acesse a página através da URL: `/add-heuristic`

## Funcionalidades Implementadas

### ✅ **Seleção de Projeto e Heurística**
- Dropdown com todos os projetos disponíveis
- Dropdown com heurísticas do projeto selecionado
- Exibição de detalhes da heurística selecionada

### ✅ **Tabela de Players com Controle Individual**
- Lista todos os players do projeto selecionado
- Status visual para cada player (Pendente, Aplicado, Erro, N/A)
- Botões de ação individuais (Aplicar/Reverter)
- Players marcados como "não aplicáveis" são automaticamente excluídos

### ✅ **Sistema de Backup e Rollback**
- Backup automático dos `scoresObject` originais em memória
- Possibilidade de reverter alterações por player
- Restauração do estado original em caso de erro

### ✅ **Validações de Segurança**
- Verificação de heurísticas duplicadas
- Modal de confirmação antes de aplicar/reverter
- Tratamento de erros com mensagens descritivas

### ✅ **Interface Responsiva**
- Design moderno com Tailwind CSS
- Tabela responsiva para diferentes tamanhos de tela
- Estados de loading e feedback visual

## Estrutura de Dados

### Objeto de Score Gerado
```javascript
{
  id: `${PLAYER_SLUG}-${JOURNEY_SLUG}-h${HEURISTIC_NUMBER}`,
  note: "",
  group: {
    name: "Nome do Grupo",
    groupNumber: 1
  },
  heuristic: {
    heuristicNumber: "1.1"
  },
  scoreValue: 0,
  evidenceUrl: ""
}
```

### Lógica de Journeys
- **Projeto com Overlap**: Se `isOverlapJourneys = true` e heurística não tem journeys específicas, aplica em todas as journeys
- **Projeto sem Overlap**: Aplica apenas nas journeys especificadas na heurística

## Queries GraphQL Utilizadas

### Buscar Projetos
```graphql
query GetAllProjects {
  projects {
    slug
    name
    year
    id
  }
}
```

### Buscar Dados do Projeto
```graphql
query GetProject($projectId: ID) {
  project(where: {id: $projectId}) {
    slug
    name
    isOverlapJourneys
    journeys {
      name
      slug
    }
  }
}
```

### Buscar Heurísticas
```graphql
query getHeuristicsFromTheProject($projectId: ID) {
  heuristics(where: {project: {id: $projectId}}) {
    id
    name
    heuristicNumber
    group {
      name
      groupNumber
    }
    journeys {
      name
      slug
    }
    not_applicaple_players {
      name
      slug
      id
    }
  }
}
```

### Buscar Players
```graphql
query getPlayersFromTheProject($projectId: ID) {
  players(where: {project: {id: $projectId}}) {
    name
    slug
    scoresObject
  }
}
```

## Fluxo de Uso

1. **Selecionar Projeto**: Escolha o projeto onde a heurística será adicionada
2. **Selecionar Heurística**: Escolha a heurística que foi cadastrada no CMS
3. **Revisar Detalhes**: Verifique as informações da heurística e journeys afetadas
4. **Aplicar por Player**: Use os botões individuais para aplicar a heurística aos players desejados
5. **Monitorar Status**: Acompanhe o status de cada player na tabela
6. **Reverter se Necessário**: Use o botão "Reverter" para desfazer alterações

## Segurança

- **Backup Automático**: Todos os `scoresObject` originais são salvos antes de qualquer alteração
- **Validação de Duplicatas**: Sistema verifica se a heurística já existe antes de adicionar
- **Confirmação de Ações**: Modal de confirmação antes de aplicar ou reverter
- **Controle Individual**: Cada player pode ser processado independentemente

## Tratamento de Erros

- **Erro de Rede**: Exibido na coluna "Mensagem" da tabela
- **Heurística Duplicada**: Detectada e reportada antes da aplicação
- **Player Não Aplicável**: Automaticamente marcado como "N/A"
- **Falha na Mutação**: Status de erro com possibilidade de retry

## Arquivos Criados/Modificados

### Novos Arquivos
- `pages/add-heuristic.jsx` - Página principal da funcionalidade
- `components/ConfirmationModal/index.jsx` - Modal de confirmação
- `ADD_HEURISTIC_README.md` - Esta documentação

### Arquivos Modificados
- `lib/queriesGql.js` - Adicionadas as novas queries GraphQL

## Próximos Passos Sugeridos

1. **Testes**: Implementar testes unitários para as funções principais
2. **Logs**: Adicionar sistema de logs mais detalhado
3. **Batch Operations**: Implementar aplicação em lote para múltiplos players
4. **Auditoria**: Adicionar log de alterações para auditoria
5. **Validação Avançada**: Verificar integridade dos dados antes de aplicar

## Considerações Técnicas

- **Performance**: Operações são feitas sequencialmente para evitar sobrecarga do CMS
- **Memória**: Backups são mantidos em memória durante a sessão
- **Concorrência**: Interface previne múltiplas operações simultâneas no mesmo player
- **Responsividade**: Interface adaptada para diferentes dispositivos
