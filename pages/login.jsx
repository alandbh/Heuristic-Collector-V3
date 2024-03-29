import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import Link from "next/link";

function Login() {
    const googleProvider = new GoogleAuthProvider();
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const { project, tab, player, journey, heuristic, showPlayer, page } =
        router.query;

    console.log("parametro login", { project, tab, player, journey });

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);

            // console.log(result.user);
            if (
                (project || player || journey || tab) !== "undefined" &&
                (project || player || journey || tab) !== undefined &&
                (page === undefined || page === "undefined")
            ) {
                router.push(
                    `/project/${project}?player=${player}&journey=${journey}&tab=${tab}`
                );
            } else if (
                (project || showPlayer || journey || page) !== "undefined" &&
                (project || showPlayer || journey || page) !== undefined
            ) {
                router.push(
                    `/dashboard?project=${project}&journey=${journey}&heuristic=${
                        heuristic || null
                    }&showPlayer=${showPlayer || null}`
                );
            } else {
                router.push(`/projects/`);
            }
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) return;
    <h1>Loading...</h1>;

    if (user) {
        console.log("user", user);
        if (
            (project || player || journey || tab) !== "undefined" &&
            (project || player || journey || tab) !== undefined &&
            (page === undefined || page === "undefined")
        ) {
            router.push(
                `/project/${project}?player=${player}&journey=${journey}&tab=${tab}`
            );
        } else if (
            (project || showPlayer || journey || page) !== "undefined" &&
            (project || showPlayer || journey || page) !== undefined
        ) {
            router.push(
                `/${page}?project=${project}&journey=${journey}&heuristic=${
                    heuristic || null
                }&showPlayer=${showPlayer || null}`
            );
        } else {
            router.push(`/projects/`);
        }
    }

    return (
        <>
            {!user && (
                <div className="flex w-full h-full justify-center absolute">
                    <div className="flex flex-col pt-40 items-center">
                        <Link href={"/"}>
                            <a>
                                <Logo />
                            </a>
                        </Link>
                        <h1 className="text-xl my-10 pt-20 hidden">
                            Please, use your R/GA credentials
                        </h1>
                        <div className="flex justify-center mt-20">
                            <button
                                className="hover:bg-blue-100 hover:text-blue-700 transition-all py-4 px-8 border border-blue-200 flex gap-4 text-slate-500 font-bold rounded "
                                onClick={googleLogin}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M-3.264 51.509c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                                        transform="translate(27.009 -39.239)"
                                    ></path>
                                    <path
                                        fill="#34A853"
                                        d="M-14.754 63.239c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"
                                        transform="translate(27.009 -39.239)"
                                    ></path>
                                    <path
                                        fill="#FBBC05"
                                        d="M-21.484 53.529c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
                                        transform="translate(27.009 -39.239)"
                                    ></path>
                                    <path
                                        fill="#EA4335"
                                        d="M-14.754 43.989c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                                        transform="translate(27.009 -39.239)"
                                    ></path>
                                </svg>{" "}
                                Login With Google
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {user && <h1>Entering...</h1>}
        </>
    );
}

export default Login;
