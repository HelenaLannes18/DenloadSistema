import { HStack, Stack, Heading, Text } from "@chakra-ui/react"

import { ButtonSave } from "@/components/Buttons"
import { CardMain } from "@/components/Cards"
import { FigureImage } from "@/components/FigureImage"
import { Forms } from "@/components/Forms"
import { Main } from "@/components/Main"
import { TitleCards } from "@/components/Title"
import { CardPerfilPlus } from "@/components/Cards/plus"

import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import useSWR, { mutate } from "swr";


import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";

import type { Site } from "@prisma/client";
import useRequireAuth from "@/lib/useRequireAuth";
import Loader from "@/components/app/Loader"


interface SettingsData
    extends Pick<
        Site,
        | "id"
        | "name"
        | "description"
        | "cidade"
        | "estado"
        | "email"
        | "celular"
        | "font"
        | "subdomain"
        | "customDomain"
        | "image"
        | "imageBlurhash"
    > { }

export default function Perfil() {
    const router = useRouter();
    const { id } = router.query;
    const siteId = id;

    const { data: settings } = useSWR<Site | null>(
        siteId && `/api/site?siteId=${siteId}`,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    const [saving, setSaving] = useState(false);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingSite, setDeletingSite] = useState(false);

    const [data, setData] = useState<SettingsData>({
        id: "",
        name: null,
        description: null,
        estado: null,
        cidade: null,
        email: "",
        celular: null,
        font: "font-cal",
        subdomain: null,
        customDomain: null,
        image: null,
        imageBlurhash: null,
    });

    useEffect(() => {
        if (settings) setData(settings);
    }, [settings]);

    async function saveSiteSettings(data: SettingsData) {
        setSaving(true);

        try {
            const response = await fetch("/api/site", {
                method: HttpMethod.PUT,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentSubdomain: settings?.subdomain ?? undefined,
                    ...data,
                    id: siteId,
                }),
            });

            if (response.ok) {
                setSaving(false);
                mutate(`/api/site?siteId=${siteId}`);
                toast.success(`Changes Saved`);
            }
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setSaving(false);
        }
    }

    async function deleteSite(siteId: string) {
        setDeletingSite(true);

        try {
            const response = await fetch(`/api/site?siteId=${siteId}`, {
                method: HttpMethod.DELETE,
            });


        } catch (error) {
            console.error(error);
        } finally {
            setDeletingSite(false);
        }
    }
    const [debouncedSubdomain] = useDebounce(data?.subdomain, 1500);
    const [subdomainError, setSubdomainError] = useState<string | null>(null);

    useEffect(() => {
        async function checkSubdomain() {
            try {
                const response = await fetch(
                    `/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`
                );

                const available = await response.json();

                setSubdomainError(
                    available ? null : `${debouncedSubdomain}.vercel.pub`
                );
            } catch (error) {
                console.error(error);
            }
        }

        if (
            debouncedSubdomain !== settings?.subdomain &&
            debouncedSubdomain &&
            debouncedSubdomain?.length > 0
        )
            checkSubdomain();
    }, [debouncedSubdomain, settings?.subdomain]);

    async function handleCustomDomain() {
        const customDomain = data.customDomain;

        setAdding(true);

        try {
            const response = await fetch(
                `/api/domain?domain=${customDomain}&siteId=${siteId}`,
                {
                    method: HttpMethod.POST,
                }
            );

            if (!response.ok)
                throw {
                    code: response.status,
                    domain: customDomain,
                };
            setError(null);
            mutate(`/api/site?siteId=${siteId}`);
        } catch (error) {
            setError(error);
        } finally {
            setAdding(false);
        }
    }
    const session = useRequireAuth();
    if (!session) return <Loader />;

    return (
        <Main title={"Perfil"} w={"35%"} path={"/perfil.png"} altText={"Ícone do Denload"} tamh={51} tamw={56}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 10000,
                }}
            />
            <HStack
                spacing={0}
                align={"stretch"}
            >
                <CardPerfilPlus />
                <CardMain radius={"0 18px 18px 0"} w={"90%"} spacing={5}>
                    <TitleCards title={"Perfil do Consultório"} />
                    <HStack
                        align={{ md: "start", xxs: "start" }}
                        flexDir={{ lg: "row", xxs: "column" }}
                    >
                        <FigureImage w={undefined} path={"/dentista.png"} altText={"Imagem do Dentista"} tamH={90} tamW={90} />
                        <Stack
                            spacing={1}
                        >
                            {session.user && session.user.image && (
                                <>
                                    <Heading
                                        color={"#4F4F4F"}
                                        fontSize={"20px"}
                                        fontWeight={500}
                                    >
                                        {session.user.name}
                                    </Heading><Text
                                        as="p"
                                        color={"#77757F"}
                                    >
                                        {session.user.email}
                                    </Text>
                                </>
                            )}
                        </Stack>
                    </HStack>
                    <HStack spacing={{ lg: 6, xxs: 0 }} flexDir={{ lg: "row", xxs: "column" }}>

                        <Forms label={"Nome"} type={"text"} placeholder={"Digite o seu nome"}
                            name="name"
                            onInput={(e: any) =>
                                setData((data) => ({
                                    ...data,
                                    name: (e.target as HTMLTextAreaElement).value,
                                }))
                            }
                            value={data.name || ""} mb={{ lg: "0", xxs: "10%" }} />

                        <Forms label={"Estado"} type={"text"} placeholder={"Digite o seu Estado"}
                            name="estado"
                            onInput={(e: any) =>
                                setData((data) => ({
                                    ...data,
                                    estado: (e.target as HTMLTextAreaElement).value,
                                }))
                            }
                            value={data.estado || ""} />
                    </HStack>
                    <HStack spacing={{ lg: 6, xxs: 0 }} flexDir={{ lg: "row", xxs: "column" }}>
                        <Forms label={"Cargo"} type={"text"} placeholder={"Digite o seu cargo"}
                            name="description"
                            onInput={(e: any) =>
                                setData((data) => ({
                                    ...data,
                                    description: (e.target as HTMLTextAreaElement).value,
                                }))
                            }
                            value={data.description || ""} />

                        <Forms label={"Cidade"} type={"text"} placeholder={"Digite a sua cidade"}
                            name="cidade"
                            onInput={(e: any) =>
                                setData((data) => ({
                                    ...data,
                                    cidade: (e.target as HTMLTextAreaElement).value,
                                }))
                            }
                            value={data.cidade || ""}
                            mb={{ lg: "0", xxs: "10%" }} />
                    </HStack>
                    <HStack spacing={{ lg: 6, xxs: 0 }} flexDir={{ lg: "row", xxs: "column" }}>
                        <Forms label={"E-mail"} type={"text"} placeholder={"Digite o seu e-mail"}
                            name="email"
                            onInput={(e: any) =>
                                setData((data) => ({
                                    ...data,
                                    email: (e.target as HTMLTextAreaElement).value,
                                }))
                            }
                            value={data.email || ""} />

                        <Forms label={"Celular"} type={"number"} placeholder={"Digite o seu número"}
                            name="celular"
                            onInput={(e: any) =>
                                setData((data) => ({
                                    ...data,
                                    celular: (e.target as HTMLTextAreaElement).value,
                                }))
                            }
                            value={data.celular || ""} mb={{ lg: "0", xxs: "10%" }} />
                    </HStack>
                    <ButtonSave type="submit" align="end" onClick={saveSiteSettings} />
                </CardMain>
            </HStack>

        </Main>
    )
}
