import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import FindingBlock from "../FindingBlock";
import { BtnLargePrimary, BtnSmallPrimary } from "../Button";
import client from "../../lib/apollo";

const MUTATION_FINDINGS = gql`
    mutation setFindingss($findingId: ID, $text: String, $theType: String) {
        updateFinding(
            where: { id: $findingId }
            data: { findingObject: { text: $text, theType: $theType } }
        ) {
            id
            findingObject
        }
    }
`;

const MUTATION_CREATE_FINDINGS = gql`
    mutation createNewFinding(
        $playerId: ID
        $journeyId: ID
        $projectSlug: String
    ) {
        createFinding(
            data: {
                project: { connect: { slug: $projectSlug } }
                player: { connect: { id: $playerId } }
                journey: { connect: { id: $journeyId } }
                findingObject: { text: "", theType: "neutral" }
            }
        ) {
            id
            findingObject
        }
    }
`;

const MUTATION_PUBLISH_FINDING = gql`
    mutation publishFinding($findingId: ID) {
        publishFinding(where: { id: $findingId }) {
            id
            findingObject
        }
    }
`;

const MUTATION_DELETE_FINDING = gql`
    mutation DeleteFinding($findingId: ID) {
        deleteFinding(where: { id: $findingId }) {
            id
        }
    }
`;

function Findings({
    data,
    router,
    getFindings,
    currentPlayer,
    currentJourney,
    currentProject,
    disable = false,
}) {
    const [findings, setFindings] = useState(data?.findings || []);

    // console.log("currentProjectaaaa", currentProject);

    const [findingsLoading, setFindingsLoading] = useState(false);

    useEffect(() => {
        if (data) {
            setFindings(data.findings);
        }
    }, [data]);
    // console.log("findingsAAAA", findings);

    function handleAddOneMoreFinding() {
        // console.log("playerr", currentPlayer.id);
        setFindingsLoading(true);
        doMutate(
            client,
            {
                playerId: currentPlayer.id,
                journeyId: currentJourney.id,
                projectSlug: router.query.slug,
            },
            MUTATION_CREATE_FINDINGS,
            "create",
            addFinding,
            setFindingsLoading
        );
    }
    function addFinding(finding) {
        setFindings([...findings, finding]);
    }

    // useEffect(() => {
    //     getFindings();
    // }, [findings, getFindings]);

    if (!data) {
        return null;
    }

    let addButtonText;
    let addButtonStatus = "active";

    if (findingsLoading) {
        addButtonStatus = "loading";
        addButtonText = "Wait...";
    } else if (!findings || findings?.length === 0) {
        addButtonText = "Add a new finding";
    } else {
        addButtonText = "Add one more finding";
    }
    return (
        <section id="findings_section" className="mx-3">
            <header className="flex flex-col justify-between mb-6 items-center px-4 gap-3">
                <h1 className="text-xl font-bold flex flex-col items-center gap-2">
                    <span className="h-[5px] block bg-primary w-10 mb-1"></span>
                    <span>General Findings</span>
                </h1>
                <div className="text-lg flex items-center gap-5">
                    <p>
                        This is a space for you to put some useful findings
                        regarding this player, that are not described in none of
                        the heuristics above.
                        <br />
                        <br />
                        It could be a <b>Good</b> thing (ex: this player allows
                        credit card scanning) or a
                        <br />
                        <b>Bad</b> one (the face recognition does not work
                        properly).
                        <br />
                        <br />
                        Choose <b>Blocker</b> If you are blocked by something
                        that prevents you to move forward in the UX analysis.
                    </p>
                </div>
            </header>
            <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 px-0 rounded-lg shadow-lg flex flex-col gap-10">
                {findings?.length === 0 && (
                    <div className="text-center">
                        <span className="text-3xl">🤷‍♀️</span> <br />
                        No findings registered yet
                    </div>
                )}
                {findings?.map((finding, index) => {
                    return (
                        <li key={finding.id}>
                            <FindingBlock
                                finding={finding}
                                callBack={getFindings}
                                index={index}
                                doMutate={doMutate}
                                client={client}
                                mutationEdit={MUTATION_FINDINGS}
                                mutationDelete={MUTATION_DELETE_FINDING}
                                disable={disable}
                            />
                        </li>
                    );
                })}
                <li className="px-8 pb-8 flex justify-center">
                    {/* <button onClick={handleAddOneMoreFinding}>
                        {addButtonText}
                    </button> */}

                    <BtnLargePrimary
                        status={addButtonStatus}
                        textActive={addButtonText}
                        onClick={handleAddOneMoreFinding}
                        disabled={disable}
                    />
                </li>
            </ul>
        </section>
    );
}

export default React.memo(Findings);

function doMutate(
    client,
    variables,
    mutationString,
    verb = "edit",
    setFindings,
    setLoading
) {
    // console.log(client, variables, mutationString, isCreate, setFindings);
    console.log("verb", verb);
    console.log({ setFindings });
    client
        .mutate({
            mutation: mutationString,
            variables,
        })
        .then(({ data }) => {
            let newId;
            if (verb === "edit") {
                newId = data.updateFinding.id;
                console.log("editando", data);
            } else if (verb === "create") {
                console.log("criando", data);
                newId = data.createFinding.id;
            } else {
                console.log("deletando", data);
                newId = data.deleteFinding.id;
                setFindings();
            }

            doPublic(client, newId, verb, setFindings, setLoading);
        });
}

function doPublic(client, newId, verb, setFindings, setLoading) {
    console.log("varr", newId);

    client
        .mutate({
            mutation: MUTATION_PUBLISH_FINDING,
            variables: { findingId: newId },
        })
        .then(({ data }) => {
            console.log("verb", verb);
            if (verb === "create") {
                console.log("publicou", data.publishFinding);
                setFindings(data.publishFinding);
                setLoading(false);
            } else if (verb === "edit") {
                console.log("publicou EDIT", data.publishFinding);
                setLoading("saved");
            } else {
                console.log("publicou delete", data.publishFinding);
                setFindings();
                setLoading(false);
            }
        });

    // return _data;
}
