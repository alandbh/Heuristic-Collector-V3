import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import client from "../../lib/apollo";
import { QUERY_ALL_PROJECTS, QUERY_PROJECT_BY_ID } from "../../lib/queriesGql";
import {
    MUTATION_CREATE_PLAYER,
    MUTATION_CREATE_PLAYER_WITH_LOGO,
    MUTATION_PUBLIC_SCORE_OBJ,
} from "../../lib/mutations";

let playerRowCounter = 0;

const createEmptyPlayer = () => ({
    id: `player-${playerRowCounter++}`,
    name: "",
    slug: "",
    logoId: "",
    slugManuallyEdited: false,
    status: null,
    message: "",
});

const slugify = (value = "") =>
    value
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/--+/g, "-");

export default function AddPlayerPage() {
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedJourneyIds, setSelectedJourneyIds] = useState([]);
    const [departmentId, setDepartmentId] = useState("");
    const [players, setPlayers] = useState(() => [createEmptyPlayer()]);
    const [lastAddedPlayerId, setLastAddedPlayerId] = useState(
        () => players[0]?.id ?? null
    );
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const playerNameRefs = useRef({});
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [pasteRawText, setPasteRawText] = useState("");
    const [pastePreview, setPastePreview] = useState([]);
    const [pasteErrors, setPasteErrors] = useState([]);

    const {
        data: projectsData,
        loading: projectsLoading,
        error: projectsError,
    } = useQuery(QUERY_ALL_PROJECTS);

    const {
        data: projectData,
        loading: projectLoading,
        error: projectError,
    } = useQuery(QUERY_PROJECT_BY_ID, {
        variables: { projectId: selectedProjectId },
        skip: !selectedProjectId,
    });

    const selectedProject = projectData?.project;
    const projectJourneys =
        selectedProject?.journeys
            ?.slice()
            ?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];

    useEffect(() => {
        // Reset journeys and players statuses when the project changes
        const newPlayer = createEmptyPlayer();
        setSelectedJourneyIds([]);
        setPlayers([newPlayer]);
        setDepartmentId("");
        setLastAddedPlayerId(newPlayer.id);
        playerNameRefs.current = {};
    }, [selectedProjectId]);

    useEffect(() => {
        if (!lastAddedPlayerId) {
            return;
        }

        const nameInput = playerNameRefs.current[lastAddedPlayerId];
        if (nameInput && typeof nameInput.focus === "function") {
            nameInput.focus();
            nameInput.select?.();
        }
    }, [lastAddedPlayerId]);

    const resetPlayerStatuses = () => {
        setPlayers((prev) =>
            prev.map((player) => ({
                ...player,
                status: null,
                message: "",
            }))
        );
    };

    const handleProjectChange = (event) => {
        setFormError("");
        resetPlayerStatuses();
        setSelectedProjectId(event.target.value);
    };

    const handleJourneyToggle = (journeyId) => {
        setFormError("");
        resetPlayerStatuses();
        setSelectedJourneyIds((prev) =>
            prev.includes(journeyId)
                ? prev.filter((id) => id !== journeyId)
                : [...prev, journeyId]
        );
    };

    const handleDepartmentChange = (event) => {
        setFormError("");
        resetPlayerStatuses();
        setDepartmentId(event.target.value);
    };

    const resetPasteState = () => {
        setPasteRawText("");
        setPastePreview([]);
        setPasteErrors([]);
    };

    const openPasteModal = () => {
        resetPasteState();
        setIsPasteModalOpen(true);
    };

    const closePasteModal = () => {
        setIsPasteModalOpen(false);
        resetPasteState();
    };

    const handlePlayerNameChange = (index, value) => {
        setFormError("");
        setPlayers((prev) =>
            prev.map((player, idx) => {
                if (idx !== index) return player;

                const updatedPlayer = {
                    ...player,
                    name: value,
                    status: null,
                    message: "",
                };

                if (!player.slugManuallyEdited) {
                    updatedPlayer.slug = slugify(value);
                }

                return updatedPlayer;
            })
        );
    };

    const handlePlayerSlugChange = (index, value) => {
        setFormError("");
        setPlayers((prev) =>
            prev.map((player, idx) =>
                idx === index
                    ? {
                          ...player,
                          slug: slugify(value),
                          slugManuallyEdited: value.trim().length > 0,
                          status: null,
                          message: "",
                      }
                    : player
            )
        );
    };

    const handlePlayerLogoChange = (index, value) => {
        setFormError("");
        setPlayers((prev) =>
            prev.map((player, idx) =>
                idx === index
                    ? {
                          ...player,
                          logoId: value,
                          status: null,
                          message: "",
                      }
                    : player
            )
        );
    };

    const handleAddPlayerRow = () => {
        const newPlayer = createEmptyPlayer();
        setPlayers((prev) => [newPlayer, ...prev]);
        setLastAddedPlayerId(newPlayer.id);
    };

    const handleRemovePlayerRow = (index) => {
        if (players.length === 1) return;
        const removedPlayer = players[index];
        const updatedPlayers = players.filter((_, idx) => idx !== index);
        setPlayers(updatedPlayers);
        if (removedPlayer?.id) {
            delete playerNameRefs.current[removedPlayer.id];
        }
        if (removedPlayer?.id === lastAddedPlayerId) {
            setLastAddedPlayerId(updatedPlayers[0]?.id ?? null);
        }
    };

    const parsePastedInput = (rawText) => {
        const rawLines = rawText.split(/\r?\n/);
        const entries = [];
        const issues = [];
        let headerHandled = false;

        rawLines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                return;
            }

            const delimiter = trimmedLine.includes("\t")
                ? "\t"
                : trimmedLine.includes(";")
                ? ";"
                : trimmedLine.includes(",")
                ? ","
                : "\t";

            const columns = trimmedLine
                .split(delimiter)
                .map((column) => column.trim());

            if (!headerHandled) {
                const headerCandidate = columns.join(" ").toLowerCase();
                if (
                    headerCandidate.includes("player") &&
                    headerCandidate.includes("slug")
                ) {
                    headerHandled = true;
                    return;
                }
            }

            headerHandled = true;

            const [
                nameColumn = "",
                slugColumn = "",
                departmentColumn = "",
                logoColumn = "",
            ] = columns;

            const name = nameColumn.trim();
            const slug = slugColumn.trim();
            const departmentFromRow = departmentColumn.trim();
            const logoFromRow = logoColumn.trim();

            if (!name && !slug) {
                issues.push(
                    `Linha ${index + 1}: informe ao menos o nome ou o slug.`
                );
                return;
            }

            const finalName = name || slug;
            const finalSlug = slug || slugify(name || slug);

            if (!finalSlug) {
                issues.push(
                    `Linha ${index + 1}: não foi possível gerar o slug automaticamente.`
                );
                return;
            }

            entries.push({
                name: finalName,
                slug: finalSlug,
                providedSlug: Boolean(slug),
                departmentId: departmentFromRow,
                logoId: logoFromRow,
                sourceLine: index + 1,
            });
        });

        return { entries, issues };
    };

    const handleProcessPastedData = () => {
        const trimmedText = pasteRawText.trim();
        if (!trimmedText) {
            setPastePreview([]);
            setPasteErrors(["Cole os dados da planilha antes de continuar."]);
            return;
        }

        const { entries, issues } = parsePastedInput(trimmedText);

        if (entries.length === 0 && issues.length === 0) {
            setPasteErrors([
                "Nenhuma linha válida foi encontrada. Verifique se os dados foram copiados corretamente.",
            ]);
            setPastePreview([]);
            return;
        }

        setPastePreview(entries);
        setPasteErrors(issues);
    };

    const handleApplyPastedPlayers = () => {
        if (pastePreview.length === 0) {
            setPasteErrors([
                "Procure processar os dados colados antes de adicioná-los à lista.",
            ]);
            return;
        }

        const newPlayers = pastePreview.map((entry) => {
            const basePlayer = createEmptyPlayer();
            return {
                ...basePlayer,
                name: entry.name,
                slug: entry.slug,
                slugManuallyEdited: entry.providedSlug || basePlayer.slugManuallyEdited,
                logoId: entry.logoId || "",
            };
        });

        const uniqueDepartmentIds = Array.from(
            new Set(
                pastePreview
                    .map((entry) => entry.departmentId)
                    .filter((value) => value)
            )
        );

        if (!departmentId.trim() && uniqueDepartmentIds.length === 1) {
            setDepartmentId(uniqueDepartmentIds[0]);
        }

        setPlayers((prev) => {
            const existingValidPlayers = prev.filter((player) => {
                const hasAnyValue =
                    player.name.trim() ||
                    player.slug.trim() ||
                    player.logoId.trim();
                return hasAnyValue;
            });

            return [...newPlayers, ...existingValidPlayers];
        });

        setLastAddedPlayerId(newPlayers[0]?.id ?? null);
        closePasteModal();
    };

    const validateForm = () => {
        if (!selectedProjectId) {
            setFormError("Selecione um projeto antes de prosseguir.");
            return false;
        }

        if (selectedJourneyIds.length === 0) {
            setFormError("Selecione ao menos uma jornada.");
            return false;
        }

        if (!departmentId.trim()) {
            setFormError("Informe o ID do departmentObj.");
            return false;
        }

        return true;
    };

    const buildJourneyConnections = () =>
        selectedJourneyIds.map((journeyId) => ({ id: journeyId }));

    const submitPlayers = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        const journeyConnections = buildJourneyConnections();
        const trimmedDepartmentId = departmentId.trim();

        const updatedStatuses = [];

        for (let index = 0; index < players.length; index += 1) {
            const currentPlayer = players[index];
            const name = currentPlayer.name.trim();
            const slug = currentPlayer.slug.trim();
            const logoId = currentPlayer.logoId.trim();

            if (!name || !slug) {
                updatedStatuses[index] = {
                    status: "error",
                    message: "Preencha nome e slug.",
                };
                continue;
            }

            try {
                const baseVariables = {
                    name,
                    slug,
                    projectId: selectedProjectId,
                    journeys: journeyConnections,
                    departmentId: trimmedDepartmentId,
                };

                const mutationConfig = logoId
                    ? {
                          mutation: MUTATION_CREATE_PLAYER_WITH_LOGO,
                          variables: { ...baseVariables, logoId },
                      }
                    : {
                          mutation: MUTATION_CREATE_PLAYER,
                          variables: baseVariables,
                      };

                const createResult = await client.mutate(mutationConfig);

                const createdPlayerId =
                    createResult?.data?.createPlayer?.id ?? null;

                if (!createdPlayerId) {
                    throw new Error(
                        "ID do player não retornado pela criação."
                    );
                }

                await client.mutate({
                    mutation: MUTATION_PUBLIC_SCORE_OBJ,
                    variables: {
                        playerId: createdPlayerId,
                    },
                });

                updatedStatuses[index] = {
                    status: "success",
                    message: "Player criado e publicado.",
                };
            } catch (error) {
                const graphQlMessage =
                    error?.message?.replace("GraphQL error: ", "") ||
                    "Erro desconhecido ao criar o player.";
                updatedStatuses[index] = {
                    status: "error",
                    message: graphQlMessage,
                };
            }
        }

        setPlayers((prev) =>
            prev.map((player, idx) => ({
                ...player,
                status: updatedStatuses[idx]?.status ?? player.status,
                message: updatedStatuses[idx]?.message ?? player.message,
            }))
        );

        setIsSubmitting(false);
    };

    const renderJourneyCheckbox = (journey) => {
        const isChecked = selectedJourneyIds.includes(journey.id);
        return (
            <label
                key={journey.id}
                className={`border rounded-lg p-3 cursor-pointer transition ${
                    isChecked
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleJourneyToggle(journey.id)}
                    className="mr-2"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                        {journey.name}
                    </span>
                    <span className="text-xs text-gray-500">
                        slug: {journey.slug}
                    </span>
                    <span className="text-xs text-gray-400 break-all">
                        id: {journey.id}
                    </span>
                </div>
            </label>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head>
                <title>Criar Players em Lote</title>
            </Head>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Criar novos players
                    </h1>

                    {(projectsError || projectError) && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                            Erro ao carregar dados do GraphCMS. Verifique se as
                            credenciais estão corretas.
                        </div>
                    )}

                    {formError && (
                        <div className="mb-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                            {formError}
                        </div>
                    )}

                    <section className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Dados gerais
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">
                                    Projeto
                                </label>
                                <select
                                    value={selectedProjectId}
                                    onChange={handleProjectChange}
                                    disabled={projectsLoading}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Selecione um projeto...
                                    </option>
                                    {projectsData?.projects?.map((project) => (
                                        <option
                                            key={project.id}
                                            value={project.id}
                                        >
                                            {project.name} ({project.slug}) ·{" "}
                                            {project.year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">
                                    ID do departmentObj
                                </label>
                                <input
                                    type="text"
                                    value={departmentId}
                                    onChange={handleDepartmentChange}
                                    placeholder="Ex: clabcd123departmentid"
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-500 mt-1">
                                    Este ID será utilizado para todos os
                                    players criados.
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <span className="block text-sm font-medium text-gray-700 mb-2">
                                Journeys aplicáveis
                            </span>

                            {projectLoading && (
                                <div className="text-sm text-gray-500">
                                    Carregando journeys do projeto...
                                </div>
                            )}

                            {!projectLoading && projectJourneys.length === 0 && (
                                <div className="text-sm text-gray-500">
                                    Selecione um projeto para listar as
                                    journeys disponíveis.
                                </div>
                            )}

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {projectJourneys.map((journey) =>
                                    renderJourneyCheckbox(journey)
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Dados individuais
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={openPasteModal}
                                    className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Colar da planilha
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddPlayerRow}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    + Adicionar player
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {players.map((player, index) => (
                                <div
                                    key={player.id}
                                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-md font-semibold text-gray-900">
                                            Player #{index + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemovePlayerRow(index)
                                            }
                                            disabled={players.length === 1}
                                            className="text-sm text-red-600 disabled:text-gray-400"
                                        >
                                            Remover
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700 mb-2">
                                                Nome
                                            </label>
                                            <input
                                                ref={(element) => {
                                                    if (element) {
                                                        playerNameRefs.current[
                                                            player.id
                                                        ] = element;
                                                    } else {
                                                        delete playerNameRefs
                                                            .current[player.id];
                                                    }
                                                }}
                                                type="text"
                                                value={player.name}
                                                onChange={(event) =>
                                                    handlePlayerNameChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nome do player"
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700 mb-2">
                                                Slug
                                            </label>
                                            <input
                                                type="text"
                                                value={player.slug}
                                                onChange={(event) =>
                                                    handlePlayerSlugChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="slug-do-player"
                                            />
                                            <span className="text-xs text-gray-500 mt-1">
                                                Editar este campo interrompe a
                                                atualização automática do slug.
                                            </span>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-gray-700 mb-2">
                                                Logo ID (opcional)
                                            </label>
                                            <input
                                                type="text"
                                                value={player.logoId}
                                                onChange={(event) =>
                                                    handlePlayerLogoChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="ID do asset no GraphCMS"
                                            />
                                        </div>
                                    </div>

                                    {player.status && (
                                        <div
                                            className={`mt-4 rounded-md p-3 text-sm ${
                                                player.status === "success"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {player.message}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={submitPlayers}
                            disabled={isSubmitting}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            {isSubmitting
                                ? "Criando players..."
                                : "Criar players"}
                        </button>
                    </div>
                </div>
            </div>
            {isPasteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Colar players da planilha
                            </h3>
                            <button
                                type="button"
                                onClick={closePasteModal}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Fechar modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            <p className="text-sm text-gray-600">
                                Copie as colunas <strong>Player Name</strong>,{" "}
                                <strong>Player Slug</strong>,{" "}
                                <strong>Department ID</strong> e, opcionalmente,{" "}
                                <strong>Logo ID</strong> da planilha e cole
                                abaixo. A primeira linha pode conter o cabeçalho.
                            </p>

                            <textarea
                                className="w-full h-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Cole aqui os dados copiados da planilha..."
                                value={pasteRawText}
                                onChange={(event) => setPasteRawText(event.target.value)}
                            />

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleProcessPastedData}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Processar dados
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyPastedPlayers}
                                    disabled={pastePreview.length === 0}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Adicionar {pastePreview.length} players
                                </button>
                                <button
                                    type="button"
                                    onClick={closePasteModal}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                            </div>

                            {pasteErrors.length > 0 && (
                                <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
                                    <p className="font-semibold">
                                        Avisos encontrados:
                                    </p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        {pasteErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {pastePreview.length > 0 && (
                                <div className="border border-gray-200 rounded-md">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Pré-visualização ({pastePreview.length}{" "}
                                            players)
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Confira os dados antes de inserir.
                                        </span>
                                    </div>
                                    <div className="max-h-64 overflow-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                        #
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                        Nome
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                        Slug
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                        Department ID
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                        Logo ID
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                                                        Linha origem
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {pastePreview.map((entry, index) => (
                                                    <tr key={`${entry.slug}-${index}`}>
                                                        <td className="px-4 py-2 text-gray-500">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-900">
                                                            {entry.name}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-700">
                                                            {entry.slug}
                                                            {!entry.providedSlug && (
                                                                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                                    gerado
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-700 break-all">
                                                            {entry.departmentId || "—"}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-700 break-all">
                                                            {entry.logoId || "—"}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-500">
                                                            {entry.sourceLine}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
