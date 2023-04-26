import React from "react";

function Debug({ data }) {
    return (
        <pre className="max-w-sm overflow-x-auto text-xs">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}

export default Debug;
