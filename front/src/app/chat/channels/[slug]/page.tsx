"use client"

import React from 'react'
import Dashboard from '@/app/Dashboard';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import MemberHasPermissionToAccess from '../actions/MemberHasPermissionToAccess';
import { RoomsType, membersType } from '@/types/types';
import ChanneLIndex from '../components/channel.index';
import FindOneBySLug from '../actions/Channel/findOneBySlug';
import InitSocket from '../actions/InitSocket';
import Loading from '../components/loading';
import Conversations from '../components/channel.conversations';
import RightsideModaL from '../modaLs/RightsideModal';
import ChanneLsmembersItem from '../components/channel.membersItem';
import getChannelMembersWithId from '../actions/getChannelmembers';
const metadata = {
    title: 'Transcendence',
    description: 'ft_transcendence',
};

export default function page() {
    const router = useRouter();
    // get query params
    const query = useParams();
    const slug: string = typeof query.slug === 'string' ? query.slug : query.slug[0];
    const [ChanneLInfo, setChanneLInfo] = React.useState<RoomsType | null>(null);
    const [ChanneLsmembers, setChanneLsmembers] = React.useState<membersType[] | null>(null);
    const [socket, setSocket] = React.useState<Socket | null>(null);
    const [IsMounted, setIsMounted] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const token = Cookies.get('token');
    const userId = Cookies.get('_id');
    if (!token || !userId) return

    React.useEffect(() => {
        (async () => {
            const channeL: RoomsType = await FindOneBySLug(slug, token);
            if (!channeL) {
                router.push('/chat/channels/');
                toast.error('channel not found');
                return;
            }
            setChanneLInfo(channeL);
            setSocket(InitSocket(token, channeL))
            // get all members for this channel :
            const members = await getChannelMembersWithId(channeL.id, token)
            if (!members) return
            setChanneLsmembers(members)
        })();
        setIsMounted(true);

        // set a title for this page using next head 
        setTimeout(() => {
            setIsLoading(false);
        }, 2000); // Replace with actual data fetching logic

    }, [])


    React.useEffect(() => {
        // if (!IsMounted) return
        // check if user has permission to access this channel
        if (!ChanneLInfo) return;
        socket?.emit('accessToroom', ChanneLInfo);
        (async () => {
            // setIsLoading(true);
            console.log('channelId', slug);
            // get channels info :

            // check if user has permission to access this channel
            await MemberHasPermissionToAccess(token, ChanneLInfo.id, userId).then((res) => {
                if (!res) {
                    router.push('/chat/channels/');
                    toast.error('You dont have permission to access this channel');
                    return;
                }
            })
            // setIsLoading(false);
        })();

    }, [slug])



    if (!IsMounted) return
    document.title = `chat : ${ChanneLInfo?.name}` || metadata.title;
    return <>
    <Conversations socket={socket} />
    <RightsideModaL>
                {
                    ChanneLsmembers && ChanneLsmembers.map((member: membersType, key: number) => (
                        <ChanneLsmembersItem key={key} member={member} />
                    ))
                }
            </RightsideModaL>
    </>
}
