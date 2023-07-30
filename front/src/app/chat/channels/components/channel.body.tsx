import React, { use, useEffect } from "react";
import LefttsideModaL from "../modaLs/LeftsideModal";
import ChanneLSidebarItem from "./channel.sidebar.item";
<<<<<<< HEAD
import { RoomsType, membersType, messagesType } from "@/types/types";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import getChannels from "@/actions/channels/getChanneLs";
import { Socket } from "socket.io-client";
import RightsideModaL from "../modaLs/RightsideModal";
import getChannelWithId from "../actions/getChannelmembers";
import ChanneLsmembersItem from "./channel.membersItem";
import LeftSidebarHook from "../hooks/LeftSidebarHook";
import RightsidebarHook from "../hooks/RightSidebarHook";
import ChanneLsettingsHook from "../hooks/channel.settings";
import LoginHook from "@/hooks/auth/login";

export default function ChanneLbody({ children, socket }: { children: React.ReactNode; socket: Socket | null }) {
    const [IsMounted, setIsMounted] = React.useState(false)
    const [ChanneLs, setChannel] = React.useState<RoomsType[] | null>(null)
    const [ChanneLsActiveID, setChanneLsActive] = React.useState<string | null>(null)
    const [ChanneLsmembers, setchanneLsmembers] = React.useState<membersType[] | null>(null)
    const [viewed, setviewed] = React.useState<number>(0)
    const [update, setUpdate] = React.useState<boolean>(false)
    const params = useSearchParams()
    const leftSidebar = LeftSidebarHook()
    const channelsettingsHook = ChanneLsettingsHook()
    const rightsidebar = RightsidebarHook()
    const loginHook = LoginHook()

    socket?.on('updateChanneLResponseEvent', (data) => {
        setUpdate(true)
    })
    useEffect(() => {
        setTimeout(() => {
            const token: any = Cookies.get('token');
            (async () => {
                if (!token)
                    return;
                const resp = await getChannels(token)
                if (resp && resp.ok) {
                    const data = await resp.json()
                    setChannel(data.Rooms);
                }
                // console.log("resp :", resp)
            }
            )();
        }, 1000);

        
    }, [loginHook, update])

    useEffect(() => {

        if (params) {
            setChanneLsActive(params.get('r'));
            (async () => {
                const channeLLid = params.get('r')
                const token: any = Cookies.get('token');
                if (!channeLLid)
                    return;
                const channeLLMembers = await getChannelWithId(channeLLid, token)
                if (channeLLMembers && channeLLMembers.statusCode !== 200){
                    setchanneLsmembers(channeLLMembers)
                } 

            })();
        }
    }, [params, rightsidebar, channelsettingsHook])
=======
import { RoomsType } from "@/types/types";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import getChannels from "@/actions/channels/getChanneLs";


export default function ChanneLbody({ children }: { children: React.ReactNode; }) {
    const [IsMounted, setIsMounted] = React.useState(false)
    const [ChanneLs, setChannel] = React.useState<RoomsType[] | null>(null)
    const [ChanneLsActiveID, setChanneLsActive] = React.useState<string | null>(null)
    const params = useSearchParams()


    useEffect(() => {
        const token: any = Cookies.get('token');
       

        (async () => {
            if (!token)
                return;
            const resp = await getChannels(token)
            if (resp && resp.ok) {
                const data = await resp.json()
                console.log("data :", data)
                setChannel(data);
            }
            console.log("resp :", resp)
        }
        )();
    }, [])

    useEffect(() => { if (params) {
        setChanneLsActive(params.get('r'))
    }}, [params])
    const LeftsideContent = ChanneLs?.map((room) => (
        <ChanneLSidebarItem room={room} active={room.id === ChanneLsActiveID} />
    ))
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!IsMounted)
        return null
    return (
<<<<<<< HEAD
        <div className="channeLbody relative h-full flex ">
            <LefttsideModaL>
                {
                    ChanneLs && ChanneLs.map((room: RoomsType, key) => (
                        <ChanneLSidebarItem key={key} room={room} socket={socket} viewd={8} active={room.id === ChanneLsActiveID} />
                    ))
                }
            </LefttsideModaL>
           <div className={`${(leftSidebar.IsOpen || rightsidebar.IsOpen) && 'hidden md:flex'} w-full`}>
           {children}
           </div>
            <RightsideModaL>
                {
                    ChanneLsmembers && ChanneLsmembers.map((member: membersType, key: number) => (
                        <ChanneLsmembersItem key={key} member={member} />
                    ))
                }
            </RightsideModaL>
=======
        <div className="channeLbody h-[90vh] md:h-[94vh] border border-green-600 flex ">
            <LefttsideModaL>
                {LeftsideContent}
            </LefttsideModaL>
            {children}
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
        </div>
    )
}