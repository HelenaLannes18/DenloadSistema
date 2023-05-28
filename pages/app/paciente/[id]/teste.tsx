import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import BlurImage from "@/components/BlurImage";
import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";

import type { Foto, Site, Paciente } from "@prisma/client";

interface SiteFotoData {
    fotos: Array<Foto>;
    paciente: Paciente | null;
}

export default function SiteIndex() {
    const [creatingFoto, setCreatingFoto] = useState(false);

    const router = useRouter();
    const { id: pacienteId } = router.query;

    const { data } = useSWR<SiteFotoData>(
        pacienteId && `/api/foto?pacienteId=${pacienteId}&published=true`,
        fetcher,
        // {
        //     onSuccess: (data) => !data?.site && router.push("/"),
        // }
    );

    async function createFoto(pacienteId: string) {
        try {
            const res = await fetch(`/api/foto?pacienteId=${pacienteId}`, {
                method: HttpMethod.POST,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/foto/${data.fotoId}`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Layout>
            <div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
                <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
                    <h1 className="font-cal text-5xl">
                        fotos for {data ? data?.paciente?.name : "..."}
                    </h1>
                    <button
                        onClick={() => {
                            setCreatingFoto(true);
                            createFoto(pacienteId as string);
                        }}
                        className={`${creatingFoto
                            ? "cursor-not-allowed bg-gray-300 border-gray-300"
                            : "text-white bg-black hover:bg-white hover:text-black border-black"
                            } font-cal text-lg w-3/4 sm:w-40 tracking-wide border-2 px-5 py-3 transition-all ease-in-out duration-150`}
                    >
                        {creatingFoto ? (
                            <LoadingDots />
                        ) : (
                            <>
                                New Foto <span className="ml-2">＋</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="my-10 grid gap-y-10">
                    {data ? (
                        data.fotos.length > 0 ? (
                            data.fotos.map((foto) => (
                                <Link href={`/foto/${foto.id}`} key={foto.id}>
                                    <div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
                                        <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none">
                                            {foto.url ? (
                                                <BlurImage
                                                    alt={foto.url ?? "Unknown Thumbnail"}
                                                    width={500}
                                                    height={400}
                                                    className="h-full object-cover"
                                                    src={foto.url}
                                                />
                                            ) : (
                                                <div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl">
                                                    ?
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative p-10">

                                            {/* <h2 className="font-cal text-3xl">{foto.pergunta}</h2>
                                            <p className="text-base my-5 line-clamp-3">
                                                {foto.resposta}
                                            </p> */}

                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
                                    <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none bg-gray-300" />
                                    <div className="relative p-10 grid gap-5">
                                        <div className="w-28 h-10 rounded-md bg-gray-300" />
                                        <div className="w-48 h-6 rounded-md bg-gray-300" />
                                        <div className="w-48 h-6 rounded-md bg-gray-300" />
                                        <div className="w-48 h-6 rounded-md bg-gray-300" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-cal text-gray-600">
                                        No fotos yet. Click &quot;New foto&quot; to create one.
                                    </p>
                                </div>
                            </>
                        )
                    ) : (
                        [0, 1].map((i) => (
                            <div
                                key={i}
                                className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200"
                            >
                                <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none bg-gray-300 animate-pulse" />
                                <div className="relative p-10 grid gap-5">
                                    <div className="w-28 h-10 rounded-md bg-gray-300 animate-pulse" />
                                    <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                                    <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                                    <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
