"use client"
// imports :
import { FormEvent, use, useEffect, useRef, useState } from "react";

// components :
import ConversationsInput from "./channel.conversations.input";
import ConversationsMessages from "./channel.conversations.messages";

// hooks :
import { Socket } from "socket.io-client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Message from "./channel.message";
import LeftSidebarHook from "../hooks/LeftSidebarHook";
import ConversationsTitlebar from "./channel.conversations.titlebar";
import getChanneLMessages from "../actions/getChanneLMessages";
import Cookies from "js-cookie";
import getMemberWithId from "../actions/getMemberWithId";
import { RoomsType, membersType } from "@/types/types";
import ChanneLsettingsHook from "../hooks/channel.settings";
import getChannelWithId from "../actions/getChannelWithId";
import { toast } from "react-hot-toast";
import BanMember from "./channel.settings.banmember";
import MemberHasPermissionToAccess from "../actions/MemberHasPermissionToAccess";
import FindOneBySLug from "../actions/Channel/findOneBySlug";


export default function Conversations({ socket }: { socket: Socket | null }) {

    const query = useParams();
    const slug: string = typeof query.slug === 'string' ? query.slug : query.slug[0];
    const [IsMounted, setIsMounted] = useState(false)
    const [messages, setMessages] = useState<any[]>([])
    const [channeLinfo, setChanneLinfo] = useState<any>(null)
    const [message, setMessage] = useState("")
    const [InputValue, setInputValue] = useState("")
    const [scrollmessage, setscrollmessage] = useState(false)
    const [LogedMember, setLogedMember] = useState<membersType | null>(null)
    const params = useSearchParams()
    const channeLLid = params.get('r')
    const token = Cookies.get('token')
    const __userId = Cookies.get('_id')
    if (!token || !__userId) return
    const router = useRouter()

    // console.log("Conversations socket :", socket?.id)

    useEffect(() => {
        const token: any = slug && Cookies.get('token');
        slug && (async () => {
            const _roomInfo : RoomsType = await FindOneBySLug(slug, token)
            if (!_roomInfo){
                return;
            }
            toast.success(`Welcome to ${_roomInfo.name}`)
            setChanneLinfo(_roomInfo)
            const response = await getChanneLMessages(_roomInfo.id, token)
            if (!response) return
            setMessages(response.messages)

            // get channeLLid data :
        })();


    }, [slug])

    useEffect(() => {
        socket?.on('message', (message: any) => {
            setscrollmessage(!scrollmessage)
            setMessages([...messages, message])
        })
        setscrollmessage(!scrollmessage)
    }, [messages, InputValue])


    useEffect(() => {
        setIsMounted(true); // set isMounted to true
        (async () => {
            const token: any = Cookies.get('token');
            const channeLLid = params.get('r')
            if (!channeLLid)
                return;

            const channeLLMembers = __userId && await getMemberWithId(__userId, channeLLid, token)
            if (channeLLMembers && channeLLMembers.statusCode !== 200) {
                setLogedMember(channeLLMembers)
            }
        })();

    }, [])

    useEffect(() => {

        socket?.on(
            `${process.env.NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_MEMBER_UPDATE}`,
            (data: {
                message: string,
                status: any,
                data: RoomsType,
            }) => {
                (async () => {
                    if (!channeLLid)
                        return;
                    // toast.success(data.message)
                    const channeLLMembers = __userId && await getMemberWithId(__userId, channeLLid, token)
                    if (channeLLMembers) {
                        setLogedMember(channeLLMembers)
                    }
                })();
            }
        );

    }, [socket])

    const content = (
        <div className="flex flex-col gap-3">

            {/* <Message content={"We're GitHub, the company behind the npm Registry and npm CLI. We offer those to the community for free, but our day job is building and selling useful tools for developers like you."} id={'dcae3d31-948a-49de-bad4-de35875bda7b'} senderId={"dcae3d31-948a-49de-bad4-de35875bda7b"} roomsId={""} created_at={"2023-07-11T08:57:44.492Z"} updated_at={"2023-07-11T08:57:44.492Z"} /> */}
            {
                messages && messages.length ?
                    messages.map((message, index) => (
                        <Message
                            key={index}
                            message={message}
                            isForOwner={message.senderId === Cookies.get('_id')}
                            userid={message.sender}
                        />
                    ))
                    : <div>no messages</div>
            }
        </div>
    )

    const OnSubmit = (event: FormEvent<HTMLInputElement>) => {
        setInputValue("")

        // send message to server using socket :
        socket?.emit('sendMessage', {
            content: message,
            senderId: Cookies.get('_id'),
            roomsId: channeLLid
        }, (response: any) => {
        })
    }


    if (!IsMounted) return null

    return <>

        {channeLinfo
            ? <div className={`Conversations relative w-full h-full flex flex-col border-orange-300 sm:flex`}>
                <ConversationsTitlebar LogedMember={LogedMember} socket={socket} channeLId={channeLinfo.id} messageTo={channeLinfo.name} OnSubmit={function (event: FormEvent<HTMLInputElement>): void { }} />
                {!LogedMember?.isban ?
                    <>
                        <ConversationsMessages socket={socket} Content={content} />
                        <div className="w-full absolute bottom-4 left-0">
                            <input
                                className="ConversationsInput w-full h-[54px] text-white text-base  font-semibold px-2 outline bg-[#243230] border-transparent focus:border-transparent rounded"
                                onSubmit={(event: any) => {
                                    setMessage(event.target.value);
                                    OnSubmit(event)
                                    // onClickHandler(event)
                                }
                                }
                                onKeyDown={(event) =>
                                    event.key === "Enter" ? OnSubmit(event) : null
                                }
                                onChange={(event) => {
                                    setInputValue(event.target.value);
                                    setMessage(event.target.value);
                                }}
                                value={InputValue}
                                placeholder={`Message to @'${channeLinfo.name}'`}
                                type="search"
                                name=""
                                id="" />
                        </div></>
                    : <BanMember LogedMember={LogedMember} User={undefined} room={channeLinfo} />
                }
            </div>
            : <div className="flex flex-col justify-center items-center h-full w-full">
                <Image src="/no_conversations.svg" width={600} height={600} alt={""} />
            </div>
        }
    </>
}