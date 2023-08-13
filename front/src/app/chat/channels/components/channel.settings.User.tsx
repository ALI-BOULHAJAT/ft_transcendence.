import React, { useEffect } from "react";
import ChannelSettingsUserMemberItem from "./channel.settings.user.memberItem";
import { UserTypeEnum, membersType, updatememberEnum } from "@/types/types";
import ChanneLsettingsHook from "../hooks/channel.settings";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import getChannelMembersWithId from "../actions/getChannelmembers";
import { Socket } from "socket.io-client";
import getUserWithId from "../actions/getUserWithId";
import getMemberWithId from "../actions/getMemberWithId";
import Image from "next/image";
import ChanneLUserSettingsModaL from "../modaLs/channel.user.settings.modal";
import Button from "../../components/Button";
import { TbUserPlus } from "react-icons/tb";
import ChanneLSettingsMemberJoinModaL from "../modaLs/channel.settings.member.join.modal";
import { IoChevronBackOutline } from "react-icons/io5";
import { BsArrowRightShort } from "react-icons/bs";
import { MdOutlineScoreboard } from "react-icons/md";
import { TfiTimer } from "react-icons/tfi";
import ChanneLConfirmActionBtn from "./channel.confirm.action.Btn";
import ChanneLConfirmActionHook from "../hooks/channel.confirm.action";
import getmessage from "../actions/member.action.message";
import axios from "axios";
import { toast } from "react-hot-toast";
import StartGame from "../actions/startgame";

interface ChanneLUserSettingsProps {
    socket: Socket | null
}

enum USERSETTINGSTEPS {
    INDEX = 0,
    PLAYGAME = 1,
    MEMBERJOIN = 2,
}

export default function ChanneLUserSettings({ socket }: ChanneLUserSettingsProps) {

    const [IsMounted, setIsMounted] = React.useState(false)
    const [members, setMembers] = React.useState<membersType[] | null>(null)
    const [LogedMember, setLogedMember] = React.useState<membersType | null>(null)
    const [step, setStep] = React.useState<USERSETTINGSTEPS>(USERSETTINGSTEPS.INDEX)
    const [PlayGameWith, setPlayGameWith] = React.useState<membersType | null>(null)
    const channeLConfirmActionHook = ChanneLConfirmActionHook()
    const [update, setUpdate] = React.useState<boolean>(false)
    const channeLsettingsHook = ChanneLsettingsHook()
    const params = useSearchParams()
    const channeLLid = params.get('r')
    const __userId = Cookies.get('_id')
    const router = useRouter()

    React.useEffect(() => { setIsMounted(true) }, [])


    React.useEffect(() => {

        (async () => {
            const channeLLid = params.get('r')
            const token: any = Cookies.get('token');
            if (!channeLLid)
                return;
            const channeLLMembers = await getChannelMembersWithId(channeLLid, token)
            if (channeLLMembers) {
                // const __filterMembers = channeLLMembers.filter((member: membersType) => member.userId !== __userId)
                // filter if member is ban or member userId === loged userId
                const filterdmembers = channeLLMembers.filter((member: membersType) => member.isban !== true)
                setMembers(filterdmembers.filter((member: membersType) => member.userId !== __userId))
            }

        })();
        setUpdate(false);

        (async () => {
            const token: any = Cookies.get('token');
            // get loged member :
            const channeLLid = params.get('r')
            if (!channeLLid)
                return;
            const channeLLMembers = __userId && await getMemberWithId(__userId, channeLLid, token)
            if (channeLLMembers && channeLLMembers.statusCode !== 200) {
                setLogedMember(channeLLMembers)
            }
        })();
    }, [update])




    const handlOnclick = (data: any) => {

        socket?.emit('updatemember', data)

    }

    useEffect(() => {
        socket?.on(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_MEMBER_UPDATE}`, (data) => {
            setUpdate(!update)
            // const channeLLMembers = __userId && await getMemberWithId(__userId, channeLLid, token)
            // if (channeLLMembers && channeLLMembers.statusCode !== 200) {
            //     setLogedMember(channeLLMembers)
            // }
            channeLConfirmActionHook.onClose()
        })
    }, [socket])

    if (!IsMounted)
        return <div className="Members flex p-4">
            <div className="flex flex-row items-center p-1 gap-1">
                <h3 className="text-base font-light text-[#FFFFFF]">Loading...</h3>
            </div>
        </div>

    let bodyContent = (
        <>
            {LogedMember?.type !== UserTypeEnum.USER && <div className="flex flex-row justify-center items-center gap-2">
                <Button
                    icon={TbUserPlus}
                    label={"Add member"}
                    outline
                    size={21}
                    labelsize={8}
                    onClick={() => {
                        setStep(USERSETTINGSTEPS.MEMBERJOIN)
                    }}
                />
            </div>}




            <div className="overflow-y-scroll max-h-[34rem] flex flex-col w-full">
                {members && members.map((member: membersType, index) => (
                    <ChannelSettingsUserMemberItem
                        key={index}
                        member={member}
                        socket={socket}
                        UserJoin={false}
                        UserOwne={false}
                        OnClick={(data: { updateType: updatememberEnum, member: membersType }) => {
                            console.log("ana hanananananan")
                            if (!data) return;
                            if (data.updateType === "PLAYGAME") {
                                setStep(USERSETTINGSTEPS.PLAYGAME)
                                setPlayGameWith(data.member)
                                return;
                            }
                            if (data.updateType === updatememberEnum.ADDMEMBER) {
                                console.log("------data.updateType === ADDMEMBER")
                                return
                            }
                            // handlOnclick(data)
                            const __message = getmessage(data.updateType);
                            console.log("const __message = getmessage(data.updateType) :", __message)
                            console.log("const __message = getmessage(data.updateType) :", data.updateType)
                            __message && channeLConfirmActionHook.onOpen(
                                <button
                                    onClick={() => {
                                        socket?.emit(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_CHAT_MEMBER_UPDATE}`, data)
                                    }}
                                    className="text-balck hover:text-danger  border border-secondary bg-secondary text-sm font-bold lowercase  px-7 py-3 rounded-[12px]  w-full">
                                    {data.updateType === updatememberEnum.SETADMIN
                                        ? data.member.type !== UserTypeEnum.ADMIN ? 'set Admin' : 'remove as admin'
                                        : data.updateType === updatememberEnum.BANMEMBER
                                            ? 'Ban'
                                            : data.updateType === updatememberEnum.KIKMEMBER
                                                ? 'Kick'
                                                : data.updateType === updatememberEnum.MUTEMEMBER
                                                    && data.member.ismute ? 'Unmute' : 'Mute'}
                                </button>

                                // <ChanneLConfirmActionBtn 
                                // onClick={() => {
                                //     socket?.emit(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_CHAT_MEMBER_LEAVE}`, {
                                //         roomId: room.id
                                //     },)
                                // }} 
                                // />
                                , __message
                            )
                        }} />

                ))
                }
            </div>

        </>
    )
    if (step === USERSETTINGSTEPS.PLAYGAME) {
        bodyContent = (
            <>
                <div className="flex flex-row justify-center items-center gap-2">
                    <Button
                        icon={IoChevronBackOutline}
                        label={"back"}
                        outline
                        size={21}
                        labelsize={8}
                        onClick={() => {
                            setStep(USERSETTINGSTEPS.INDEX)
                        }}
                    />
                </div>
                <div className="overflow-y-scroll max-h-[34rem] flex flex-col w-full">
                    <div className="flex flex-col h-full w-full justify-start gap-4 items-center min-h-[34rem] ">
                        <div className="flex flex-col justify-center items-center gap-3">
                            <Image src="/game-mode.svg" width={200} height={200} alt={""} />
                            {/* <h2 className=" capitalize font-extrabold text-white">permission denied</h2> */}
                        </div>
                        <h2>
                            P1 :{PlayGameWith?.userId} <br />
                            p2 : {LogedMember?.userId}
                        </h2>
                        <div className="flex flex-col gap-3  w-full">
                            <button
                                onClick={() => {
                                    (async () => {
                                        const body = {       ///////////////////////////////////////////////////////// body
                                            player_Id: LogedMember?.userId,
                                            player2Id: PlayGameWith?.userId,
                                            mode: "time"
                                        }
                                        // await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/game/BotGame`, body).then((result) => {
                                        //     console.log("await axios.post(`${process.env.NEXT_PUBLIC :", result)
                                        //     router.push('/game/score/robot')
                                        // }).catch(() => {
                                        //     toast.error("error")
                                        // })

                                        const token: any = Cookies.get('token');
                                        if (!token) return;
                                        const g = await StartGame({       ///////////////////////////////////////////////////////// body
                                            player_Id: LogedMember?.userId,
                                            mode: "time"
                                        }, token);
                                        if (!g) return;
                                        router.push('/game/score/robot')
                                    })
                                }}
                                className="flex flex-row justify-between items-center shadow p-2 rounded hover:border-[#FFCC00] hover:border">
                                <div className='flex justify-center items-center p-3 rounded bg-[#FFCC00] text-white'>
                                    <TfiTimer size={28} />
                                </div>
                                <div>
                                    <h2 className='text-white'>Time Mode</h2>
                                </div>
                                <div className='text-white'>
                                    <BsArrowRightShort size={24} />
                                </div>
                            </button>
                            <button
                                onClick={() => {
                                    // const body = {       ///////////////////////////////////////////////////////// body
                                    //     player_Id: LogedMember?.userId,
                                    //     player2Id: PlayGameWith?.userId,
                                    //     mode: "score"
                                    // }
                                    // axios.post(`${process.env.NEXT_PUBLIC_API_URL}/game/BotGame`, body).then((result) => {
                                    //     router.push('/game/score/robot')
                                    // })
                                    (async () => {
                                        console.log("${process.env.NEXT_PUBLIC_API_URL}/game/BotGame :", `${process.env.NEXT_PUBLIC_API_URL}/game/BotGame`)
                                        const token: any = Cookies.get('token');
                                        if (!token) return;
                                        const g = await StartGame({       ///////////////////////////////////////////////////////// body
                                            player_Id: LogedMember?.userId,
                                            mode: "time"
                                        }, token);
                                        console.log("++++++++++++++++++++++++++++++> game:",g)
                                        if (!g) return;
                                        toast.success("play ....")
                                        router.push('/game/score/robot')
                                    })
                                }}
                                className="flex flex-row justify-between items-center shadow p-2 rounded hover:border-secondary hover:border">
                                <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                                    <MdOutlineScoreboard size={28} />
                                </div>
                                <div>
                                    <h2 className='text-white'>Score Mode</h2>
                                </div>
                                <div className='text-white'>
                                    <BsArrowRightShort size={24} />
                                </div>
                            </button>

                        </div>
                    </div>
                </div>

            </>
        )
    }
    if (step === USERSETTINGSTEPS.MEMBERJOIN) {
        bodyContent = <ChanneLSettingsMemberJoinModaL socket={socket} OnClick={() => {
            setStep(USERSETTINGSTEPS.INDEX)
        }} />
    }

    return <ChanneLUserSettingsModaL>
        {bodyContent}
    </ChanneLUserSettingsModaL>
}