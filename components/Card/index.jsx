import Image from "next/image";
import Link from "next/link";
import React from "react";

// import { Container } from './styles';
//  http://localhost:3000/project/dummy?player=americanas&journey=desktop

function Card({ data }) {
    // const sortedPlayers = data.players.sort((a, b)=> a.slug.localeCompare(b.slug));
    // const sortedJourneys = data.journeys.sort((a, b)=> a.slug.localeCompare(b.slug));
    return (
        <div className="md:max-w-[310px] max-w-[150px] transition-shadow rounded-xl overflow-hidden shadow-md hover:shadow-xl dark:bg-slate-800">
            <Link
                href={`/project/${data.slug}?player=${data.players[0].slug}&journey=${data.journeys[0].slug}`}
            >
                <a>
                    <Image
                        className="w-full"
                        height={200}
                        width={300}
                        objectFit="cover"
                        src={data.thumbnail?.url || "/img-empty-project.svg"}
                        alt=""
                    />
                    <div className="px-3 py-1 md:px-6 ">
                        <div className="font-bold dark:text-white/70 text-sm md:text-xl mb-2">
                            {data.name} <br />{" "}
                            {process.env.NEXT_PUBLIC_DEP?.toUpperCase()}
                        </div>
                        <div className="text-xs md:text-sm dark:text-white/50">
                            {data.year}
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    );
}

export default Card;
