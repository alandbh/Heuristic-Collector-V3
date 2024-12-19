import React, { useEffect } from "react";
import { useRouter } from "next/router";

import Sidenav from "../../components/Dash2/Sidenav";
import useAllProjectScores from "../../lib/dash2/useAllProjectScores";

// import { Container } from './styles';

function dash2() {
    const router = useRouter();
    const { project } = router.query;

    const allProjectScores = useAllProjectScores(project);
    console.log("allProjectScores", allProjectScores);

    useEffect(() => {
        // getAllScores();
    }, []);

    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50 h-screen">
            <div className="flex">
                <Sidenav />

                <main className="pt-5 px-8 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                    <div className="w-[864px] mx-auto flex flex-col">
                        <h1>Dashboard 2</h1>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default dash2;
