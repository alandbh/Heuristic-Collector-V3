import React from "react";

// import { Container } from './styles';

function dash2() {
    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50 h-screen">
            <div className="flex">
                <div className="sidenav flex w-16 bg-blue-500 h-screen flex-col items-center pt-5 px-1 gap-6">
                    <div className="logo w-7 h-7 bg-red-500"></div>

                    <nav>
                        <button className="text-white flex flex-col items-center justify-center gap-1 w-14 h-12 hover:bg-blue-600 cursor-pointer rounded">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="17"
                                fill="none"
                                viewBox="0 0 16 17"
                            >
                                <path
                                    fill="#fff"
                                    d="M13.92 12.521a2.676 2.676 0 00-5.312.26c-2.742-.085-3.715-.726-3.556-2.03.059-.487.353-.747.894-.874A3.29 3.29 0 016.97 9.82c.03.003.062.005.092.009.202.048.408.089.613.121.609.1 1.228.15 1.818.118 1.657-.09 2.785-.82 2.843-2.37.055-1.502-.977-2.566-2.641-3.278-.534-.229-1.1-.406-1.667-.54a9.722 9.722 0 00-.628-.128 2.676 2.676 0 00-5.32-.045 2.676 2.676 0 005.177 1.229c.168.03.334.064.5.103a8.848 8.848 0 011.471.475c1.263.54 1.952 1.252 1.92 2.141-.028.797-.6 1.165-1.718 1.225a7.319 7.319 0 01-1.559-.103 7.906 7.906 0 01-.403-.077c-.07-.014-.118-.027-.14-.032l-.055-.01a4.46 4.46 0 00-1.593.059c-.985.23-1.677.842-1.805 1.888-.28 2.254 1.403 3.299 4.928 3.374a2.677 2.677 0 005.116-1.458zM4.733 5.518a1.488 1.488 0 110-2.975 1.488 1.488 0 010 2.975zm6.544 8.925a1.489 1.489 0 110-2.978 1.489 1.489 0 010 2.978z"
                                ></path>
                            </svg>
                            <span className="text-[0.6rem]">Evaluation</span>
                        </button>
                    </nav>
                </div>

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
