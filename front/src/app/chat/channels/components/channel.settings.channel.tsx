
"use client"
import React from 'react';
import { BsArrowRightShort, BsSaveFill } from 'react-icons/bs';
import { CgEditFlipH } from 'react-icons/cg';
import { TbEdit, TbPassword } from 'react-icons/tb';
import { VscGroupByRefType } from "react-icons/vsc";
import { Channel } from 'diagnostics_channel';
import ChanneLSettingsEditModaL from '../modaLs/channel.settings.edit.modal';
import Input from '@/components/Input';
import { RegisterOptions, FieldValues, UseFormRegisterReturn, useForm, set } from 'react-hook-form';
import Button from '../../components/Button';
import { IoBagRemove, IoChevronBackOutline, IoInformation, IoLogOut } from 'react-icons/io5';
import { GoEyeClosed } from 'react-icons/go';
import { HiLockClosed, HiLockOpen } from 'react-icons/hi';
import { TfiTimer } from 'react-icons/tfi';
import { FaChessQueen, FaUserTimes } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import getChannelMembersWithId from '../actions/getChannelmembers';
import { RoomTypeEnum, RoomsType, UpdateChanneLSendData, UpdateChanneLSendEnum, UserTypeEnum, membersType } from '@/types/types';
import getMemberWithId from '../actions/getMemberWithId';
import { Socket } from 'socket.io-client';
import Image from 'next/image';
import ChanneLSettingsChanneLBanedMember from './channel.settings.channel.banedmember';
import ChanneLsettingsChanneLsetOwner from './channel.settings.channel.setOwner';
import ChanneLSettingsChanneLAccessPassword from './channel.settings.channel.accesspassword';
import ChanneLaccessDeniedModaL from '../modaLs/channel.access.denied.modaL';
import ChanneLSettingsChanneLChangeType from './channel.settings.channel.changetype';
import getChannelWithId from '../actions/getChannelWithId';
import ChanneLSettingsOptionItem from './channel.settings.optionItem';
import { AiOutlineDelete } from 'react-icons/ai';
import ChanneLSettingsChanneLDeleteChannel from './channel.settings.channel.deletechannel';
import PermissionDenied from './channel.settings.permissiondenied';
import ChanneLSettingsChanneLChangePassword from './channel.settings.channel.changepassword';
import ChanneLConfirmActionHook from '../hooks/channel.confirm.action';
import { PiPasswordBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
interface ChanneLChatSettingsProps {
    socket: Socket | null
}

// create enum for channel type
export enum SETTINGSTEPS {
    CHOICE = 0,
    EDITPASSWORD = 1,
    CHANGECHANNEL = 2,
    BANEDMEMBERS = 3,
    SETOWNER = 4,
    LEAVECHANNEL = 5,
    ACCESSPASSWORD = 6,
    REMOVEACCESSPASSWORD = 7,
    DELETECHANNEL = 8,
    EDITACCESSPASSWORD = 9
}


export default function ChanneLChatSettings({ socket }: ChanneLChatSettingsProps) {
    const [step, setStep] = React.useState<SETTINGSTEPS>(SETTINGSTEPS.CHOICE)
    const [update, setUpdate] = React.useState<boolean>(false)
    const [members, setMembers] = React.useState<membersType[] | null>(null)
    const [LogedMember, setLogedMember] = React.useState<membersType | null>(null)
    const [ChanneLinfo, setChanneLinfo] = React.useState<RoomsType | null>(null)
    const channeLConfirmActionHook = ChanneLConfirmActionHook()
    const params = useSearchParams()
    const channeLLid = params.get('r')
    const __userId = Cookies.get('_id')

    React.useEffect(() => {

        (async () => {
            const channeLLid = params.get('r')
            const token: any = Cookies.get('token');
            if (!channeLLid)
                return;
            const channeLLMembers = await getChannelMembersWithId(channeLLid, token)
            if (channeLLMembers && channeLLMembers.statusCode !== 200) {

                // const __filterMembers = channeLLMembers.filter((member: membersType) => member.userId !== __userId)
                // filter if member is ban or member userId === loged userId
                setMembers(channeLLMembers.filter((member: membersType) => member.userId !== __userId))
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
                console.log("+++++++++channeLLMembers :", channeLLMembers);
            }
        })();


    }, [update])

    const DeleteAccessPassword = async () => {
        if (!ChanneLinfo) return;

        const data: UpdateChanneLSendData = {
            Updatetype: UpdateChanneLSendEnum.REMOVEACCESSEPASSWORD,
            room: ChanneLinfo,
        }
        // chack if  password is not empty and if password is not equal to confirm password
        const __message = 'are you sure you whon to access password`s for this channel';
        __message && channeLConfirmActionHook.onOpen(
            <button
                onClick={() => {
                    socket?.emit(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_CHAT_UPDATE}`, data)
                }}
                className="text-balck hover:text-danger  border border-secondary bg-secondary text-sm font-bold lowercase  px-7 py-3 rounded-[12px]  w-full">
                remove Access password
            </button>
            , __message
        )
        // send data to server
        // socket?.emit(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_CHAT_UPDATE}`, data)
        //   reset data for password
        // reset()
    }

    React.useEffect(() => {
        // get channel info :
        const token: any = Cookies.get('token');
        if (!channeLLid) return;
        if (!token) return;
        (async () => {
            const ChanneLinfo = await getChannelWithId(channeLLid, token)
            if (ChanneLinfo && ChanneLinfo.statusCode !== 200) {
                setChanneLinfo(ChanneLinfo)
            }
        })();
    }, [step])

    React.useEffect(() => {

        // listen to channels actions response events :

        // change channel password :
        socket?.on(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_CHANGE_PROTACTED_PASSWORD}`, (data) => {

        })
        // change type :
        socket?.on(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_CHANGE_TYPE}`, (data) => {
            
        })
        // set access password :
        socket?.on(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_SET_ACCESS_PASSWORD}`, (data) => {
            
        })
        // remove access password :
        socket?.on(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_REMOVE_ACCESS_PASSWORD}`, (data) => {
            if (!data) return
            console.log("NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_UPDATE :", data)
            channeLConfirmActionHook.onClose()
            setChanneLinfo(data);
            OnBack()
            toast("NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_UPDATE")
        })

         socket?.on(`${process.env.NEXT_PUBLIC_SOCKET_EVENT_RESPONSE_CHAT_UPDATE}`, (data) => {
            
        })
    }, [socket])


    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            ChanneLpassword: "",
            newChanneLpassword: "",
            confirmChanneLpassword: "",
            channeLtype: ""
        },
    });
    const _channeLpassword = watch('ChanneLpassword')
    const _newChanneLpassword = watch('newChanneLpassword')
    const _confirmChanneLpassword = watch('confirmChanneLpassword')
    const _channeLtype = watch('channeLtype')
    const setcustomvalue = (key: any, value: any) => {
        setValue(key, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    }
    const OnEditPassword = () => {
        setStep(SETTINGSTEPS.EDITPASSWORD)
    }
    const OnChangeChannel = () => {
        setStep(SETTINGSTEPS.CHANGECHANNEL)
    }
    const OnBanedMembers = () => {
        setStep(SETTINGSTEPS.BANEDMEMBERS)
    }
    const OnSetOwner = () => {
        setStep(SETTINGSTEPS.SETOWNER)
    }
    const OnBack = () => {
        setStep(SETTINGSTEPS.CHOICE)
    }
    const OnEditAccessPassword = () => {
        setStep(SETTINGSTEPS.EDITACCESSPASSWORD)
    }
    const OnAccessPassword = () => {
        setStep(SETTINGSTEPS.ACCESSPASSWORD)
    }
    const OnRemoveAccessPassword = () => { }
    const OnLeave = () => { }
    const OnDeleteChannel = () => { setStep(SETTINGSTEPS.DELETECHANNEL) }



    let _body = (
        <div className="flex h-full flex-col justify-between items-start min-h-[34rem] ">
            <div className="flex flex-col gap-2 w-full">
                {ChanneLinfo && ChanneLinfo.type == RoomTypeEnum.PROTECTED &&
                    <ChanneLSettingsOptionItem
                        onClick={function (): void { OnEditPassword(); }}
                        icon={GoEyeClosed}
                        label={"Change password"} />
                }
                <button
                    onClick={() => {

                        OnChangeChannel()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                        <CgEditFlipH size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>Change Type</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>

                <button
                    onClick={() => {

                        OnBanedMembers()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                        <FaUserTimes size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>Baned members</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>

                <button
                    onClick={() => {

                        OnSetOwner()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                        <FaChessQueen size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>set owner</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>
                {/* set access password */}
                {!ChanneLinfo?.hasAccess && <button
                    onClick={() => {

                        OnAccessPassword()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                        <TbPassword size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>set access password</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>}
                {ChanneLinfo?.hasAccess && <button
                    onClick={OnEditAccessPassword}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary  text-white'>
                        <PiPasswordBold size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>Edit access password</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>}
                {ChanneLinfo?.hasAccess && <button
                    onClick={DeleteAccessPassword}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary  text-white'>
                        <IoBagRemove size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>remove access password</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>}
            </div>
        </div>
    )

    if (LogedMember?.type !== UserTypeEnum.OWNER && LogedMember?.type !== UserTypeEnum.ADMIN) {
        _body = (<PermissionDenied />)
    }

    if (step === SETTINGSTEPS.BANEDMEMBERS) {
        _body = members ? <ChanneLSettingsChanneLBanedMember
            setUpdate={setUpdate}
            socket={socket}
            OnBack={OnBack} LogedMember={LogedMember} members={members.filter((member: membersType) => member.isban === true)}
        /> : (<div></div>)
    }
    if (step === SETTINGSTEPS.SETOWNER) {
        _body = members ? <ChanneLsettingsChanneLsetOwner
            setUpdate={setUpdate}
            socket={socket}
            OnBack={OnBack} LogedMember={LogedMember} members={members}
        /> : (<div></div >)
    }
    if (step === SETTINGSTEPS.ACCESSPASSWORD && !ChanneLinfo?.hasAccess) {
        _body = <ChanneLSettingsChanneLAccessPassword
            setUpdate={setUpdate}
            socket={socket}
            OnBack={OnBack}
            LogedMember={LogedMember}
            members={members}
        />
    }
    if (step === SETTINGSTEPS.EDITACCESSPASSWORD && ChanneLinfo?.hasAccess) {
        _body = <ChanneLSettingsChanneLAccessPassword
            setUpdate={setUpdate}
            socket={socket}
            title="Edit Access Password"
            OnBack={OnBack}
            LogedMember={LogedMember}
            members={members}
        />
    }
    if (step === SETTINGSTEPS.CHANGECHANNEL) {
        _body = <ChanneLSettingsChanneLChangeType
            setUpdate={setUpdate}
            socket={socket}
            OnBack={OnBack}
            LogedMember={LogedMember}
            members={members}
        />
    }
    if (step === SETTINGSTEPS.EDITPASSWORD) {
        _body = <ChanneLSettingsChanneLChangePassword
            setUpdate={setUpdate}
            socket={socket}
            OnBack={OnBack}
            LogedMember={LogedMember}
            members={members}
        />
        // (
        //     <div className="flex flex-col justify-between min-h-[34rem]">
        //         <div>
        //             <Button
        //                 icon={IoChevronBackOutline}
        //                 label={"Back"}
        //                 outline
        //                 onClick={OnBack}
        //             />

        //             <div className='flex flex-col gap-5 p-4'>
        //                 <Input id="ChanneLpassword" lable="password" type="password" register={register} errors={errors} onChange={() => { }} />
        //                 <Input id="newChanneLpassword" lable="new password" type="password" register={register} errors={errors} onChange={() => { }} />
        //                 <Input id="confirmChanneLpassword" lable="confirm password" type="password" register={register} errors={errors} onChange={() => { }} />
        //             </div>
        //         </div>
        //         <div className='flex flex-row justify-between items-center
        //        '>

        //             <Button
        //                 label={"Save Changes"}
        //                 outline
        //                 onClick={() => { () => { } }}
        //             />
        //         </div>
        //     </div>
        // )
    }
    if (step === SETTINGSTEPS.DELETECHANNEL) {
        _body = <ChanneLSettingsChanneLDeleteChannel room={ChanneLinfo} OnBack={OnBack} socket={socket} />
    }
    // if (step === SETTINGSTEPS.CHANGECHANNEL) {
    //     _body = ()
    // }
    return <ChanneLSettingsEditModaL >
        {_body}
    </ChanneLSettingsEditModaL>
}