// api/private/me.js
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { ManagementClient } from "auth0";

const userHandler = async (req, res) => {
    const { body } = req;

    const session = await getSession(req, res);
    const id = session.user.sub;
    const accessToken = session.accessToken;

    try {
        const params = body;

        const currentUserManagementClient = new ManagementClient({
            token: accessToken,
            domain: process.env.AUTH0_ISSUER_BASE_URL.replace("https://", ""),
            scope: process.env.AUTH0_SCOPE,
        });

        const user = await currentUserManagementClient.updateUserMetadata(
            { id },
            params
        );

        res.status(200).json(params);
    } catch (err) {
        console.log(err);
        res.status(500).json({ statusCode: 500, message: err.message });
    }
};

export default withApiAuthRequired(userHandler);
