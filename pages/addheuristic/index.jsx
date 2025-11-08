import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import client from "../../lib/apollo";
import {
    QUERY_ALL_PROJECTS,
    QUERY_PROJECT_HEURISTIC_DATA,
} from "../../lib/queriesGql";
import {
    MUTATION_CREATE_HEURISTIC,
    MUTATION_PUBLISH_HEURISTIC,
} from "../../lib/mutations";

let heuristicRowCounter = 0;

const createEmptyHeuristic = () => ({
    id: `heuristic-row-${heuristicRowCounter++}`,
    name: "",
    heuristicNumber: "",
    description: "",
    groupId: "",
    journeyIds: [],
    notApplicablePlayerIds: [],
    status: "idle",
    message: "",
});

const STATUS_COLORS = {
    idle: "bg-gray-100 text-gray-700",
    loading: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
};

const statusLabel = {
    idle: "Pendente",
    loading: "Processando",
    success: "Publicado",
    error: "Erro",
};

function PasteModal({
    isOpen,
    onClose,
    rawText,
    onRawTextChange,
    onProcess,
    onApply,
    preview,
    errors,
    initialFocusRef,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-xl font-semibold">
                        Inserir heurísticas em lote
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Fechar
                    </button>
                </div>
                <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <textarea
                            ref={initialFocusRef}
                            className="min-h-[260px] w-full rounded border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="name,heuristicNumber,description,groupId,journeyIds,not_applicaple_players"
                            value={rawText}
                            onChange={(event) =>
                                onRawTextChange(event.target.value)
                            }
                        />
                        <p className="text-xs text-gray-500">
                            Colunas aceitas (mesma ordem): <b>name</b>,{" "}
                            <b>heuristicNumber</b>, <b>description</b>,{" "}
                            <b>groupId</b>, <b>journeyIds</b>,{" "}
                            <b>not_applicaple_players</b>. Journeys e players
                            podem conter múltiplos IDs separados por espaço.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={onProcess}
                                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Processar
                            </button>
                            <button
                                type="button"
                                onClick={onApply}
                                className="rounded border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                            >
                                Aplicar à lista
                            </button>
                        </div>
                        {errors.length > 0 && (
                            <div className="space-y-1 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {errors.map((error, idx) => (
                                    <p key={`${error}-${idx}`}>{error}</p>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="rounded border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-2 text-sm font-semibold text-gray-600">
                            Pré-visualização ({preview.length})
                        </h3>
                        {preview.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                Nenhum dado processado ainda.
                            </p>
                        ) : (
                            <div className="max-h-[320px] space-y-3 overflow-y-auto">
                                {preview.map((entry) => (
                                    <div
                                        key={entry.tempId}
                                        className="rounded border border-gray-200 bg-white p-3 text-sm"
                                    >
                                        <p className="font-medium">
                                            {entry.name} ({entry.heuristicNumber}
                                            )
                                        </p>
                                        <p className="text-gray-600">
                                            Grupo: {entry.groupId || "—"}
                                        </p>
                                        <p className="text-gray-600">
                                            Journeys:{" "}
                                            {entry.journeyIds.length > 0
                                                ? entry.journeyIds.join(", ")
                                                : "—"}
                                        </p>
                                        <p className="text-gray-600">
                                            Players N/A:{" "}
                                            {entry.notApplicablePlayerIds
                                                .length > 0
                                                ? entry.notApplicablePlayerIds.join(
                                                      ", "
                                                  )
                                                : "—"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AddHeuristicBatchPage() {
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [heuristics, setHeuristics] = useState(() => [
        createEmptyHeuristic(),
    ]);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [pasteRawText, setPasteRawText] = useState("");
    const [pastePreview, setPastePreview] = useState([]);
    const [pasteErrors, setPasteErrors] = useState([]);
    const initialFocusRef = useRef(null);

    const {
        data: projectsData,
        loading: projectsLoading,
        error: projectsError,
    } = useQuery(QUERY_ALL_PROJECTS);

    const {
        data: projectData,
        loading: projectLoading,
        error: projectError,
    } = useQuery(QUERY_PROJECT_HEURISTIC_DATA, {
        variables: { projectId: selectedProjectId },
        skip: !selectedProjectId,
    });

    useEffect(() => {
        if (isPasteModalOpen) {
            initialFocusRef.current?.focus?.();
        }
    }, [isPasteModalOpen]);

    useEffect(() => {
        // reset rows when project changes
        setHeuristics([createEmptyHeuristic()]);
        setFormError("");
    }, [selectedProjectId]);

    const projectInfo = projectData?.project;
    const projectGroups =
        projectData?.groups
            ?.slice()
            ?.sort(
                (a, b) =>
                    parseFloat(a.groupNumber) - parseFloat(b.groupNumber)
            ) ?? [];
    const projectJourneys =
        projectInfo?.journeys
            ?.slice()
            ?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];
    const projectPlayers =
        projectData?.players
            ?.slice()
            ?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];

    const handleProjectChange = (event) => {
        setSelectedProjectId(event.target.value);
    };

    const handleHeuristicChange = (index, field, value) => {
        setHeuristics((prev) =>
            prev.map((row, idx) =>
                idx === index
                    ? { ...row, [field]: value, status: "idle", message: "" }
                    : row
            )
        );
    };

    const handleJourneyChange = (index, event) => {
        const options = Array.from(event.target.selectedOptions).map(
            (option) => option.value
        );
        handleHeuristicChange(index, "journeyIds", options);
    };

    const handlePlayersChange = (index, event) => {
        const options = Array.from(event.target.selectedOptions).map(
            (option) => option.value
        );
        handleHeuristicChange(index, "notApplicablePlayerIds", options);
    };

    const addHeuristicRow = () => {
        setHeuristics((prev) => [createEmptyHeuristic(), ...prev]);
    };

    const removeHeuristicRow = (rowId) => {
        if (heuristics.length === 1) return;
        setHeuristics((prev) => prev.filter((row) => row.id !== rowId));
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

    const parsePastedInput = (rawText) => {
        const rawLines = rawText.split(/\r?\n/);
        const entries = [];
        const issues = [];
        let headerHandled = false;

        rawLines.forEach((line, lineIndex) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const delimiter = line.includes("\t")
                ? "\t"
                : line.includes(";")
                ? ";"
                : line.includes(",")
                ? ","
                : "\t";

            const columns = trimmed
                .split(delimiter)
                .map((column) => column.trim());

            if (!headerHandled) {
                const normalizedHeader = columns.join(" ").toLowerCase();
                if (
                    normalizedHeader.includes("name") &&
                    normalizedHeader.includes("heuristicnumber")
                ) {
                    headerHandled = true;
                    return;
                }
            }

            headerHandled = true;

            const [
                nameColumn = "",
                heuristicNumberColumn = "",
                descriptionColumn = "",
                groupIdColumn = "",
                journeyIdsColumn = "",
                notApplicableColumn = "",
            ] = columns;

            const name = nameColumn.trim();
            const heuristicNumber = heuristicNumberColumn.trim();
            const description = descriptionColumn.trim();
            const groupId = groupIdColumn.trim();
            const journeyIds = journeyIdsColumn
                .split(/\s+/)
                .map((value) => value.trim())
                .filter(Boolean);
            const notApplicablePlayerIds = notApplicableColumn
                .split(/\s+/)
                .map((value) => value.trim())
                .filter(Boolean);

            if (!name) {
                issues.push(
                    `Linha ${lineIndex + 1}: informe o campo "name".`
                );
                return;
            }

            if (!heuristicNumber) {
                issues.push(
                    `Linha ${lineIndex + 1}: informe o campo "heuristicNumber".`
                );
                return;
            }

            if (!groupId) {
                issues.push(
                    `Linha ${lineIndex + 1}: informe o campo "groupId".`
                );
                return;
            }

            entries.push({
                tempId: `preview-${lineIndex}`,
                name,
                heuristicNumber,
                description,
                groupId,
                journeyIds,
                notApplicablePlayerIds,
            });
        });

        return { entries, issues };
    };

    const handleProcessPastedData = () => {
        const trimmed = pasteRawText.trim();
        if (!trimmed) {
            setPasteErrors(["Cole as linhas da planilha antes de continuar."]);
            setPastePreview([]);
            return;
        }

        const { entries, issues } = parsePastedInput(trimmed);
        setPastePreview(entries);
        setPasteErrors(issues);

        if (entries.length === 0 && issues.length === 0) {
            setPasteErrors([
                "Nenhuma linha válida encontrada. Revise os dados colados.",
            ]);
        }
    };

    const handleApplyPastedHeuristics = () => {
        if (pastePreview.length === 0) {
            setPasteErrors([
                "Processar os dados antes de adicioná-los à lista.",
            ]);
            return;
        }

        const newRows = pastePreview.map((entry) => ({
            ...createEmptyHeuristic(),
            name: entry.name,
            heuristicNumber: entry.heuristicNumber,
            description: entry.description,
            groupId: entry.groupId,
            journeyIds: entry.journeyIds,
            notApplicablePlayerIds: entry.notApplicablePlayerIds,
        }));

        setHeuristics((prev) => [...newRows, ...prev]);
        closePasteModal();
    };

    const validateRows = () => {
        if (!selectedProjectId) {
            setFormError("Selecione um projeto antes de continuar.");
            return false;
        }

        const invalidRows = [];

        heuristics.forEach((row, index) => {
            const missingFields = [];
            if (!row.name.trim()) missingFields.push("name");
            if (!row.heuristicNumber.trim())
                missingFields.push("heuristicNumber");
            if (!row.groupId.trim()) missingFields.push("groupId");

            if (missingFields.length > 0) {
                invalidRows.push(
                    `Linha ${index + 1}: faltam ${missingFields.join(", ")}.`
                );
            }
        });

        if (invalidRows.length > 0) {
            setFormError(invalidRows.join(" "));
            return false;
        }

        setFormError("");
        return true;
    };

    const buildJourneyConnect = (journeyIds) => {
        const connections = journeyIds.map((journeyId) => ({ id: journeyId }));
        return connections.length > 0 ? connections : undefined;
    };

    const buildPlayerConnect = (playerIds) => {
        const connections = playerIds.map((playerId) => ({ id: playerId }));
        return connections.length > 0 ? connections : undefined;
    };

    const updateHeuristicRow = (rowId, updates) => {
        setHeuristics((prev) =>
            prev.map((row) =>
                row.id === rowId ? { ...row, ...updates } : row
            )
        );
    };

    const submitHeuristics = async () => {
        if (!validateRows()) return;

        setIsSubmitting(true);
        const heuristicsSnapshot = [...heuristics];

        for (let index = 0; index < heuristicsSnapshot.length; index += 1) {
            const row = heuristicsSnapshot[index];
            updateHeuristicRow(row.id, {
                status: "loading",
                message: "Processando...",
            });

            try {
                const { data } = await client.mutate({
                    mutation: MUTATION_CREATE_HEURISTIC,
                    variables: {
                        name: row.name.trim(),
                        heuristicNumber: row.heuristicNumber.trim(),
                        description: row.description.trim(),
                        projectId: selectedProjectId,
                        groupId: row.groupId,
                        journeyIds: buildJourneyConnect(row.journeyIds),
                        notApplicablePlayerIds: buildPlayerConnect(
                            row.notApplicablePlayerIds
                        ),
                    },
                });

                const createdId = data?.createHeuristic?.id;
                if (!createdId) {
                    throw new Error(
                        "Heurística criada sem ID retornado pela API."
                    );
                }

                await client.mutate({
                    mutation: MUTATION_PUBLISH_HEURISTIC,
                    variables: { heuristicId: createdId },
                });

                updateHeuristicRow(row.id, {
                    status: "success",
                    message: "Heurística criada e publicada.",
                });
            } catch (error) {
                updateHeuristicRow(row.id, {
                    status: "error",
                    message:
                        error?.message || "Falha ao criar ou publicar.",
                });
            }
        }

        setIsSubmitting(false);
    };

    return (
        <>
            <Head>
                <title>Adicionar heurísticas em lote</title>
            </Head>
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Nova heurística em lote
                        </h1>
                        <p className="text-sm text-gray-600">
                            Informe os dados baseados no projeto selecionado ou
                            use a opção de colagem em lote a partir de uma
                            planilha.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={openPasteModal}
                            className="rounded border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                            Colar da planilha
                        </button>
                        <button
                            type="button"
                            onClick={addHeuristicRow}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Adicionar linha
                        </button>
                    </div>
                </div>

                <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700">
                        Projeto
                    </label>
                    <select
                        value={selectedProjectId}
                        onChange={handleProjectChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none md:w-96"
                    >
                        <option value="">Selecione um projeto</option>
                        {(projectsData?.projects ?? []).map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name} ({project.year})
                            </option>
                        ))}
                    </select>
                    {projectsError && (
                        <p className="text-sm text-red-600">
                            {projectsError.message}
                        </p>
                    )}
                    {projectError && (
                        <p className="text-sm text-red-600">
                            {projectError.message}
                        </p>
                    )}
                </div>

                {formError && (
                    <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {formError}
                    </div>
                )}

                {!selectedProjectId ? (
                    <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
                        Selecione um projeto para começar a cadastrar heurísticas.
                    </div>
                ) : projectLoading ? (
                    <div className="rounded border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
                        Carregando dados do projeto...
                    </div>
                ) : (
                    <form
                        className="space-y-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submitHeuristics();
                        }}
                    >
                        {heuristics.map((row, index) => (
                            <div
                                key={row.id}
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                            >
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-gray-700">
                                        Heurística #{heuristics.length - index}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[row.status]}`}
                                        >
                                            {statusLabel[row.status]}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeHeuristicRow(row.id)}
                                            className="text-sm text-red-600 hover:underline"
                                            disabled={heuristics.length === 1}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Nome *
                                        </label>
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(event) =>
                                                handleHeuristicChange(
                                                    index,
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Número *
                                        </label>
                                        <input
                                            type="text"
                                            value={row.heuristicNumber}
                                            onChange={(event) =>
                                                handleHeuristicChange(
                                                    index,
                                                    "heuristicNumber",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={row.description}
                                        onChange={(event) =>
                                            handleHeuristicChange(
                                                index,
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        rows={3}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Grupo *
                                        </label>
                                        <select
                                            value={row.groupId}
                                            onChange={(event) =>
                                                handleHeuristicChange(
                                                    index,
                                                    "groupId",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">
                                                Selecione o grupo
                                            </option>
                                            {projectGroups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.groupNumber}. {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Journeys (opcional)
                                        </label>
                                        <select
                                            multiple
                                            value={row.journeyIds}
                                            onChange={(event) =>
                                                handleJourneyChange(index, event)
                                            }
                                            className="h-32 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        >
                                            {projectJourneys.map((journey) => (
                                                <option key={journey.id} value={journey.id}>
                                                    {journey.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500">
                                            Se vazio, o CMS utilizará as
                                            configurações do projeto.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-700">
                                        Players não aplicáveis (opcional)
                                    </label>
                                    <select
                                        multiple
                                        value={row.notApplicablePlayerIds}
                                        onChange={(event) =>
                                            handlePlayersChange(index, event)
                                        }
                                        className="h-32 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        {projectPlayers.map((player) => (
                                            <option key={player.id} value={player.id}>
                                                {player.name}
                                                {player.departmentObj?.departmentSlug
                                                    ? ` - ${player.departmentObj.departmentSlug}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500">
                                        IDs também podem ser importados pela planilha.
                                    </p>
                                </div>

                                {row.message && (
                                    <p
                                        className={`mt-3 text-sm ${
                                            row.status === "success"
                                                ? "text-green-700"
                                                : row.status === "error"
                                                ? "text-red-700"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {row.message}
                                    </p>
                                )}
                            </div>
                        ))}

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {isSubmitting
                                    ? "Enviando heurísticas..."
                                    : "Criar e publicar heurísticas"}
                            </button>
                            <span className="text-sm text-gray-500">
                                {heuristics.length} heurística(s) na fila.
                            </span>
                        </div>
                    </form>
                )}
            </div>
            <PasteModal
                isOpen={isPasteModalOpen}
                onClose={closePasteModal}
                rawText={pasteRawText}
                onRawTextChange={setPasteRawText}
                onProcess={handleProcessPastedData}
                onApply={handleApplyPastedHeuristics}
                preview={pastePreview}
                errors={pasteErrors}
                initialFocusRef={initialFocusRef}
            />
        </>
    );
}
