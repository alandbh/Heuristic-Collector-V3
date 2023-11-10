import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import client from "../lib/apollo";
import clientFast from "../lib/apollo-fast";
import { gql, useQuery } from "@apollo/client";
import { useUser } from "@auth0/nextjs-auth0";
import { debounce } from "../lib/utils";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";

const QUERY_USER = gql`
    query getRgaUser($projectSlug: String, $email: String) {
        rgaUsers(where: { project: { slug: $projectSlug }, email: $email }) {
            id
            email
            userType
            project {
                slug
            }
        }
    }
`;

const CREATE_RGAUSER = gql`
    mutation createNewRgaUser($projectSlug: String, $email: String!) {
        createRgaUser(
            data: {
                project: { connect: { slug: $projectSlug } }
                email: $email
                userType: regular
            }
        ) {
            id
            email
            userType
        }
    }
`;

const PUBLISH_RGAUSER = gql`
    mutation publishRgaUser($id: ID) {
        publishRgaUser(where: { id: $id }) {
            id
            email
            userType
        }
    }
`;

const CredentialsContext = createContext();

async function getRgaUser(email, projectSlug, func) {
    // return;
    const { data: rgaUsersRetrieved } = await clientFast.query({
        query: QUERY_USER,
        variables: {
            projectSlug,
            email,
        },
        fetchPolicy: "network-only",
    });
    // setAllScores(newData.scores);
    // console.log("RGA USER RETRIEVED", rgaUsersRetrieved.rgaUsers[0]);
    func(rgaUsersRetrieved.rgaUsers[0]);
    return rgaUsersRetrieved.rgaUsers[0];
}

const createNewRgaUser = debounce(async (projectSlug, email, setRgaUser) => {
    // return;
    const { data: newRgaUser } = await client.mutate({
        mutation: CREATE_RGAUSER,
        variables: {
            projectSlug,
            email,
        },
    });
    console.log("newRgaUser", newRgaUser);
    // console.log("NEW RGA USER", newRgaUser.rgaUser);

    const { data: newRgaUserPublished } = await client.mutate({
        mutation: PUBLISH_RGAUSER,
        variables: {
            id: newRgaUser.createRgaUser.id,
        },
    });
    setRgaUser(newRgaUserPublished.publishRgaUser);
}, 2000);

export function CredentialsWrapper({ children }) {
    const [rgaUser, setRgaUser] = useState(null);
    const router = useRouter();
    const [user, loadingUser] = useAuthState(auth);
    // const { user, error: errorUser, isLoading } = useUser();

    useEffect(() => {
        if (user) {
            getRgaUser(user.email, router.query.slug, setRgaUser);
        }
    }, [user, router.query.slug]);

    // const {
    //     data: userType,
    //     loading,
    //     error,
    // } = useQuery(QUERY_USER, {
    //     variables: {
    //         projectSlug: router.query.slug,
    //         email: user?.email,
    //     },
    // });

    useEffect(() => {
        if (user) {
            if (rgaUser === undefined) {
                console.log("noneRgaUser", rgaUser);
                // return null;
                createNewRgaUser(router.query.slug, user.email, setRgaUser);
            }
        }
    }, [rgaUser, router.query.slug, user]);

    console.log("userType", rgaUser?.userType);
    // console.log("NewRgaUserPublisehed", rgaUser);

    return (
        <CredentialsContext.Provider
            value={{ user, userType: rgaUser?.userType }}
        >
            {children}
        </CredentialsContext.Provider>
    );
}

export function useCredentialsContext() {
    return useContext(CredentialsContext);
}
