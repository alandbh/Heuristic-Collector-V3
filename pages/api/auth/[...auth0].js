import { handleAuth } from "@auth0/nextjs-auth0";

export default handleAuth();

// import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

// export default handleAuth({
//     async login(req, res) {
//         try {
//             await handleLogin(req, res, {
//                 authorizationParams: {
//                     audience: `${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
//                     scope: "openid read:current_user update:current_user_metadata",
//                 },
//             });
//         } catch (error) {
//             res.status(error.status || 400).end(error.message);
//         }
//     },
// });
