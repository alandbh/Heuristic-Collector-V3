import { useState, useEffect, useMemo, useRef } from 'react';

/**
 * Hook personalizado para buscar URL de thumbnail de arquivos do Google Drive
 * @param {string} fileId - ID do arquivo
 * @param {boolean} enabled - Se deve buscar a URL (para controlar quando executar)
 * @returns {Object} - { url, loading, error }
 */
export function useThumbnailUrl(fileId, enabled = true) {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!fileId || !enabled) {
            setUrl(null);
            setError(null);
            return;
        }

        const fetchThumbnailUrl = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/get-thumbnail?fileId=${fileId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        api_key: "20rga25",
                    },
                    method: "GET",
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUrl(data.url);
            } catch (err) {
                console.error('Error fetching thumbnail URL:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchThumbnailUrl();
    }, [fileId, enabled]);

    return { url, loading, error };
}

/**
 * Hook para buscar múltiplas URLs de thumbnail
 * @param {Array} fileIds - Array de IDs dos arquivos
 * @param {boolean} enabled - Se deve buscar as URLs
 * @returns {Object} - { urls, loading, error }
 */
export function useMultipleThumbnailUrls(fileIds, enabled = true) {
    const [urls, setUrls] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchedRef = useRef(new Set()); // Para evitar chamadas duplicadas

    // Memoiza os fileIds para evitar re-renderizações desnecessárias
    const memoizedFileIds = useMemo(() => {
        if (!fileIds || !Array.isArray(fileIds)) return [];
        return fileIds.filter(id => id && typeof id === 'string');
    }, [fileIds]);

    // Memoiza a string de IDs para usar como dependência
    const fileIdsString = useMemo(() => {
        return memoizedFileIds.sort().join(',');
    }, [memoizedFileIds]);

    useEffect(() => {
        if (memoizedFileIds.length === 0 || !enabled) {
            setUrls({});
            setError(null);
            setLoading(false);
            fetchedRef.current.clear();
            return;
        }

        // Verifica se já buscamos estes IDs
        const currentIdsString = fileIdsString;
        if (fetchedRef.current.has(currentIdsString)) {
            return;
        }

        const fetchMultipleThumbnailUrls = async () => {
            setLoading(true);
            setError(null);
            fetchedRef.current.add(currentIdsString);

            try {
                const promises = memoizedFileIds.map(async (fileId) => {
                    const response = await fetch(`/api/get-thumbnail?fileId=${fileId}`, {
                        headers: {
                            "Content-Type": "application/json",
                            api_key: "20rga25",
                        },
                        method: "GET",
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    return { fileId, ...data };
                });

                const results = await Promise.all(promises);
                const urlsMap = {};
                
                results.forEach(result => {
                    urlsMap[result.fileId] = {
                        id: result.id,
                        name: result.name,
                        type: result.type,
                        url: result.url,
                        embedUrl: result.embedUrl
                    };
                });

                setUrls(urlsMap);
            } catch (err) {
                console.error('Error fetching multiple thumbnail URLs:', err);
                setError(err.message);
                fetchedRef.current.delete(currentIdsString); // Remove em caso de erro para permitir retry
            } finally {
                setLoading(false);
            }
        };

        fetchMultipleThumbnailUrls();
    }, [fileIdsString, enabled]); // Usa fileIdsString em vez de fileIds

    return { urls, loading, error };
}
