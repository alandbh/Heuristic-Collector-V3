import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import Head from "next/head";
import client from "../lib/apollo";
import { 
    QUERY_ALL_PROJECTS, 
    QUERY_PROJECT_BY_ID, 
    QUERY_HEURISTICS_FROM_PROJECT, 
    QUERY_PLAYERS_FROM_PROJECT 
} from "../lib/queriesGql";
import { MUTATION_SCORE_OBJ, MUTATION_PUBLIC_SCORE_OBJ } from "../lib/mutations";
import { processChange } from "../lib/utils";
import ConfirmationModal from "../components/ConfirmationModal";

// Componente para a tabela de players
function PlayersTable({ 
    players, 
    selectedHeuristic, 
    selectedJourneys, 
    onApplyHeuristic, 
    onRevertHeuristic,
    playersStatus 
}) {
    if (!players || players.length === 0) {
        return <div className="text-gray-500">Nenhum player encontrado.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Player
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mensagem
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {players.map((player) => {
                        const status = playersStatus[player.slug] || { status: 'pending', message: '' };
                        const isNotApplicable = selectedHeuristic?.not_applicaple_players?.some(
                            p => p.slug === player.slug
                        );
                        
                        return (
                            <tr key={player.slug} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {player.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        status.status === 'success' ? 'bg-green-100 text-green-800' :
                                        status.status === 'error' ? 'bg-red-100 text-red-800' :
                                        status.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {status.status === 'success' ? 'Aplicado' :
                                         status.status === 'error' ? 'Erro' :
                                         status.status === 'applied' ? 'Aplicado' :
                                         isNotApplicable ? 'N/A' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {isNotApplicable ? (
                                        <span className="text-gray-400">Não aplicável</span>
                                    ) : status.status === 'applied' ? (
                                        <button
                                            onClick={() => onRevertHeuristic(player)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Reverter
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onApplyHeuristic(player)}
                                            disabled={status.status === 'loading'}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                                        >
                                            {status.status === 'loading' ? 'Aplicando...' : 'Aplicar'}
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {status.message}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// Componente principal
export default function AddHeuristic() {
    const router = useRouter();
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedHeuristicId, setSelectedHeuristicId] = useState("");
    const [playersStatus, setPlayersStatus] = useState({});
    const [playersBackup, setPlayersBackup] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    
    // Queries
    const { data: projectsData, loading: projectsLoading } = useQuery(QUERY_ALL_PROJECTS);
    const { data: projectData, loading: projectLoading } = useQuery(QUERY_PROJECT_BY_ID, {
        variables: { projectId: selectedProjectId },
        skip: !selectedProjectId
    });
    const { data: heuristicsData, loading: heuristicsLoading } = useQuery(QUERY_HEURISTICS_FROM_PROJECT, {
        variables: { projectId: selectedProjectId },
        skip: !selectedProjectId
    });
    const { data: playersData, loading: playersLoading } = useQuery(QUERY_PLAYERS_FROM_PROJECT, {
        variables: { projectId: selectedProjectId },
        skip: !selectedProjectId
    });

    // Função para ordenar heurísticas por grupo e número
    const sortHeuristics = (heuristics) => {
        if (!heuristics) return [];
        
        return [...heuristics].sort((a, b) => {
            // Primeiro ordena por número do grupo
            const groupA = parseFloat(a.group.groupNumber);
            const groupB = parseFloat(b.group.groupNumber);
            
            if (groupA !== groupB) {
                return groupA - groupB;
            }
            
            // Se o grupo for igual, ordena por número da heurística
            // Usar comparação de strings para números decimais como 4.10
            const heuristicA = a.heuristicNumber;
            const heuristicB = b.heuristicNumber;
            
            // Dividir em partes inteira e decimal para comparação correta
            const [intA, decA] = heuristicA.split('.').map(Number);
            const [intB, decB] = heuristicB.split('.').map(Number);
            
            if (intA !== intB) {
                return intA - intB;
            }
            
            // Se a parte inteira for igual, comparar a parte decimal
            return (decA || 0) - (decB || 0);
        });
    };

    // Estados derivados
    const selectedProject = projectData?.project;
    const sortedHeuristics = sortHeuristics(heuristicsData?.heuristics);
    const selectedHeuristic = sortedHeuristics?.find(h => h.id === selectedHeuristicId);
    const players = playersData?.players || [];

    // Determinar journeys selecionadas
    const selectedJourneys = selectedHeuristic ? (
        // Se a heurística não tem journeys específicas OU se o projeto tem overlap
        (!selectedHeuristic.journeys || selectedHeuristic.journeys.length === 0)
            ? selectedProject.journeys.map(j => j.slug)
            : selectedHeuristic.journeys.map(j => j.slug)
    ) : [];

    // Função para aplicar heurística a um player
    const applyHeuristicToPlayer = async (player) => {
        if (!selectedHeuristic || !selectedProject) return;

        setPlayersStatus(prev => ({
            ...prev,
            [player.slug]: { status: 'loading', message: 'Aplicando heurística...' }
        }));

        try {
            // Fazer backup do scoresObject original
            // Verificar se scoresObject é string ou objeto
            const originalScoresObject = typeof player.scoresObject === 'string' 
                ? JSON.parse(player.scoresObject || '{}')
                : player.scoresObject || {};
            
            setPlayersBackup(prev => ({
                ...prev,
                [player.slug]: originalScoresObject
            }));

            // Criar novo scoresObject com a heurística (deep copy)
            const newScoresObject = JSON.parse(JSON.stringify(originalScoresObject));
            
            console.log('🔍 DEBUG - ScoresObject original:', originalScoresObject);
            console.log('🔍 DEBUG - Journeys do projeto:', selectedProject.journeys);
            console.log('🔍 DEBUG - Journeys da heurística:', selectedHeuristic.journeys);
            console.log('🔍 DEBUG - Journeys selecionadas:', selectedJourneys);
            console.log('🔍 DEBUG - Heurística selecionada:', selectedHeuristic);
            
            // Verificar se heurística já existe em alguma journey antes de adicionar
            let hasExistingHeuristic = false;
            for (const journeySlug of selectedJourneys) {
                if (!newScoresObject[journeySlug]) {
                    newScoresObject[journeySlug] = [];
                }

                const existingHeuristic = newScoresObject[journeySlug].find(
                    item => item.heuristic?.heuristicNumber === selectedHeuristic.heuristicNumber
                );

                if (existingHeuristic) {
                    console.log('❌ Heurística já existe na journey:', journeySlug);
                    hasExistingHeuristic = true;
                    break;
                }
            }

            // Se já existe, mostrar erro e sair
            if (hasExistingHeuristic) {
                setPlayersStatus(prev => ({
                    ...prev,
                    [player.slug]: { 
                        status: 'error', 
                        message: 'Heurística já existe em uma ou mais journeys' 
                    }
                }));
                return;
            }

            // Adicionar heurística para cada journey selecionada
            selectedJourneys.forEach(journeySlug => {
                if (!newScoresObject[journeySlug]) {
                    newScoresObject[journeySlug] = [];
                }

                // Adicionar nova heurística
                const newHeuristicObject = {
                    id: `${player.slug}-${journeySlug}-h${selectedHeuristic.heuristicNumber}`,
                    note: "",
                    group: {
                        name: selectedHeuristic.group.name,
                        groupNumber: selectedHeuristic.group.groupNumber
                    },
                    heuristic: {
                        heuristicNumber: selectedHeuristic.heuristicNumber
                    },
                    scoreValue: 0,
                    evidenceUrl: ""
                };

                console.log('➕ Adicionando heurística na journey:', journeySlug, newHeuristicObject);
                newScoresObject[journeySlug].push(newHeuristicObject);
            });

            console.log('🔍 DEBUG - ScoresObject final antes da mutação:', newScoresObject);

            // Aplicar mutação
            console.log('🚀 DEBUG - Enviando mutação com:', {
                playerId: player.id,
                scoresObj: newScoresObject
            });
            
            const mutationResult = await processChange(
                client,
                {
                    playerId: player.id,
                    scoresObj: newScoresObject
                },
                MUTATION_SCORE_OBJ,
                false
            );
            
            console.log('✅ DEBUG - Resultado da mutação:', mutationResult);

            setPlayersStatus(prev => ({
                ...prev,
                [player.slug]: { status: 'applied', message: 'Heurística aplicada com sucesso' }
            }));

        } catch (error) {
            console.error('Erro ao aplicar heurística:', error);
            setPlayersStatus(prev => ({
                ...prev,
                [player.slug]: { 
                    status: 'error', 
                    message: `Erro: ${error.message}` 
                }
            }));
        }
    };

    // Função para confirmar ação
    const handleConfirmAction = () => {
        if (pendingAction) {
            if (pendingAction.type === 'apply') {
                applyHeuristicToPlayer(pendingAction.player);
            } else if (pendingAction.type === 'revert') {
                revertHeuristicFromPlayer(pendingAction.player);
            }
        }
        setShowConfirmModal(false);
        setPendingAction(null);
    };

    // Função para cancelar ação
    const handleCancelAction = () => {
        setShowConfirmModal(false);
        setPendingAction(null);
    };

    // Função para solicitar confirmação antes de aplicar
    const requestApplyConfirmation = (player) => {
        setPendingAction({ type: 'apply', player });
        setShowConfirmModal(true);
    };

    // Função para solicitar confirmação antes de reverter
    const requestRevertConfirmation = (player) => {
        setPendingAction({ type: 'revert', player });
        setShowConfirmModal(true);
    };

    // Função para reverter heurística de um player
    const revertHeuristicFromPlayer = async (player) => {
        if (!playersBackup[player.slug]) return;

        setPlayersStatus(prev => ({
            ...prev,
            [player.slug]: { status: 'loading', message: 'Revertendo...' }
        }));

        try {
            await processChange(
                client,
                {
                    playerId: player.id,
                    scoresObj: playersBackup[player.slug]
                },
                MUTATION_SCORE_OBJ,
                false
            );

            setPlayersStatus(prev => ({
                ...prev,
                [player.slug]: { status: 'pending', message: '' }
            }));

        } catch (error) {
            console.error('Erro ao reverter heurística:', error);
            setPlayersStatus(prev => ({
                ...prev,
                [player.slug]: { 
                    status: 'error', 
                    message: `Erro ao reverter: ${error.message}` 
                }
            }));
        }
    };

    // Resetar estados quando projeto muda
    useEffect(() => {
        setSelectedHeuristicId("");
        setPlayersStatus({});
        setPlayersBackup({});
    }, [selectedProjectId]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head>
                <title>Adicionar Nova Heurística</title>
            </Head>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Adicionar Nova Heurística
                    </h1>

                    {/* Seleção de Projeto */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecionar Projeto
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={projectsLoading}
                        >
                            <option value="">Selecione um projeto...</option>
                            {projectsData?.projects?.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name} ({project.slug}) | {project.year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Seleção de Heurística */}
                    {selectedProjectId && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selecionar Heurística
                            </label>
                            <select
                                value={selectedHeuristicId}
                                onChange={(e) => setSelectedHeuristicId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={heuristicsLoading}
                            >
                                <option value="">Selecione uma heurística...</option>
                                {sortedHeuristics?.map((heuristic) => (
                                    <option key={heuristic.id} value={heuristic.id}>
                                        {heuristic.heuristicNumber} - {heuristic.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Informações da Heurística Selecionada */}
                    {selectedHeuristic && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-lg font-medium text-blue-900 mb-2">
                                Detalhes da Heurística
                            </h3>
                            <div className="text-sm text-blue-800">
                                <p><strong>Número:</strong> {selectedHeuristic.heuristicNumber}</p>
                                <p><strong>Nome:</strong> {selectedHeuristic.name}</p>
                                <p><strong>Grupo:</strong> {selectedHeuristic.group.name}</p>
                                <p><strong>Journeys:</strong> {selectedJourneys.join(', ')}</p>
                                <p><strong>Players não aplicáveis:</strong> {
                                    selectedHeuristic.not_applicaple_players?.length > 0 
                                        ? selectedHeuristic.not_applicaple_players.map(p => p.name).join(', ')
                                        : 'Nenhum'
                                }</p>
                            </div>
                        </div>
                    )}

                    {/* Tabela de Players */}
                    {selectedProjectId && players.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Players do Projeto
                            </h3>
                            <PlayersTable
                                players={players}
                                selectedHeuristic={selectedHeuristic}
                                selectedJourneys={selectedJourneys}
                                onApplyHeuristic={requestApplyConfirmation}
                                onRevertHeuristic={requestRevertConfirmation}
                                playersStatus={playersStatus}
                            />
                        </div>
                    )}

                    {/* Loading States */}
                    {(projectsLoading || projectLoading || heuristicsLoading || playersLoading) && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Carregando...</p>
                        </div>
                    )}

                    {/* Modal de Confirmação */}
                    <ConfirmationModal
                        isOpen={showConfirmModal}
                        onClose={handleCancelAction}
                        onConfirm={handleConfirmAction}
                        title={pendingAction?.type === 'apply' ? 'Aplicar Heurística' : 'Reverter Heurística'}
                        message={
                            pendingAction?.type === 'apply' 
                                ? `Tem certeza que deseja aplicar a heurística "${selectedHeuristic?.heuristicNumber} - ${selectedHeuristic?.name}" ao player "${pendingAction?.player?.name}"?`
                                : `Tem certeza que deseja reverter a heurística do player "${pendingAction?.player?.name}" para o estado anterior?`
                        }
                        confirmText={pendingAction?.type === 'apply' ? 'Aplicar' : 'Reverter'}
                        type={pendingAction?.type === 'revert' ? 'danger' : 'warning'}
                    />
                </div>
            </div>
        </div>
    );
}
