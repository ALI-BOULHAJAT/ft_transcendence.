
import React from 'react';
import { BsArrowRightShort, BsSaveFill } from 'react-icons/bs';
import { CgEditFlipH } from 'react-icons/cg';
import { PiPassword } from "react-icons/pi";
import { TbEdit, TbPassword, TbUserCancel } from 'react-icons/tb';
import { VscGroupByRefType } from "react-icons/vsc";
import { Channel } from 'diagnostics_channel';
import ChanneLSettingsEditModaL from '../modaLs/channel.settings.edit.modal';
import Input from '@/components/Input';
import { RegisterOptions, FieldValues, UseFormRegisterReturn, useForm } from 'react-hook-form';
import Button from '../../components/Button';
import { IoBagRemove, IoChevronBackOutline, IoInformation, IoLogOut } from 'react-icons/io5';
import { GoEyeClosed } from 'react-icons/go';
import { HiLockClosed, HiLockOpen } from 'react-icons/hi';
import { TfiTimer } from 'react-icons/tfi';
import { FaChessQueen } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import getChannelMembersWithId from '../actions/getChannelmembers';
import { membersType } from '@/types/types';
import getMemberWithId from '../actions/getMemberWithId';
import ChannelSettingsUserMemberItem from './channel.settings.user.memberItem';
import { Socket } from 'socket.io-client';
import Image from 'next/image';
import ChanneLSettingsChanneLBanedMember from './channel.settings.channel.banedmember';
import ChanneLsettingsChanneLsetOwner from './channel.settings.channel.setOwner';
import ChanneLSettingsChanneLAccessPassword from './channel.settings.channel.accesspassword';
import ChanneLaccessDeniedModaL from '../modaLs/channel.access.denied.modaL';
import ChanneLSettingsChanneLChangeType from './channel.settings.channel.changetype';
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
}


export default function ChanneLChatSettings({ socket }: ChanneLChatSettingsProps) {
    const [step, setStep] = React.useState<SETTINGSTEPS>(SETTINGSTEPS.CHOICE)
    const [update, setUpdate] = React.useState<boolean>(false)
    const [members, setMembers] = React.useState<membersType[] | null>(null)
    const [LogedMember, setLogedMember] = React.useState<membersType | null>(null)

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
                console.log("channeLLMembers :", channeLLMembers)
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
            }
        })();
    }, [update])

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
    const OnLeaveChannel = () => {

    }
    const OnAccessPassword = () => {
        setStep(SETTINGSTEPS.ACCESSPASSWORD)
    }
    const OnRemoveAccessPassword = () => {}
    const OnLeave = () => {}



    let _body = (
        <div className="flex flex-col justify-between items-start min-h-[34rem] ">
            <div className="flex flex-col gap-2 w-full">
                <button
                    onClick={() => {
                        console.log("change password")
                        OnEditPassword()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                        <PiPassword size={28} />
                    </div>
                    <div>
                        <h2 className='text-white'>Change password</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>

                <button
                    onClick={() => {
                        console.log("change password")
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
                        console.log("Baned members")
                        OnBanedMembers()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                        <TbUserCancel size={32} />
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
                        console.log("Baned members")
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
                <button
                    onClick={() => {
                        console.log("access password")
                        OnAccessPassword()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-secondary text-white'>
                        <TbPassword size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>access password</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>
                <button
                    onClick={() => {
                        console.log("remove access password")

                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-danger text-white'>
                        <IoBagRemove size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>remove access password</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>

                <button
                    onClick={() => {
                        console.log("leave Channel")
                        OnBack()
                    }}
                    className="flex flex-row justify-between items-center shadow p-2 rounded">
                    <div className='flex justify-center items-center p-3 rounded bg-isban text-white'>
                        <IoLogOut size={32} />
                    </div>
                    <div>
                        <h2 className='text-white font-semibold capitalize'>leave Channel</h2>
                    </div>
                    <div className='text-white'>
                        <BsArrowRightShort size={24} />
                    </div>
                </button>
            </div>
            {/* <button
                onClick={() => {
                    console.log("leave Channel")
                    OnEditPassword()
                }}
                className="flex flex-row gap-6  items-center shadow p-1 rounded bg-isban px-4">
                <div className='flex justify-center items-center p-1 rounded text-white'>
                    <IoLogOut size={24} />
                </div>
                <div>
                    <h2 className='text-white'>leave Channel</h2>
                </div>
            </button> */}
        </div>

    )
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
    if (step === SETTINGSTEPS.ACCESSPASSWORD) {
        _body = <ChanneLSettingsChanneLAccessPassword
            setUpdate={setUpdate}
            socket={socket}
            OnBack={OnBack} LogedMember={LogedMember} members={members}
        />
    }
    if (step === SETTINGSTEPS.CHANGECHANNEL) {
        _body = <ChanneLSettingsChanneLChangeType setUpdate={setUpdate}
        socket={socket}
        OnBack={OnBack} LogedMember={LogedMember} members={members}
    />
    }
    if (step === SETTINGSTEPS.EDITPASSWORD) {
        _body = (
            <div className="flex flex-col justify-between min-h-[34rem]">
                <div>
                    <Button
                        icon={IoChevronBackOutline}
                        label={"Back"}
                        outline
                        onClick={OnBack}
                    />

                    <div className='flex flex-col gap-5 p-4'>
                        <Input id="ChanneLpassword" lable="password" type="password" register={register} errors={errors} onChange={() => { }} />
                        <Input id="newChanneLpassword" lable="new password" type="password" register={register} errors={errors} onChange={() => { }} />
                        <Input id="confirmChanneLpassword" lable="confirm password" type="password" register={register} errors={errors} onChange={() => { }} />
                    </div>
                </div>
                <div className='flex flex-row justify-between items-center
               '>

                    <Button
                        label={"Save Changes"}
                        outline
                        onClick={() => { () => { } }}
                    />
                </div>
            </div>
        )
    }
    // if (step === SETTINGSTEPS.CHANGECHANNEL) {
    //     _body = ()
    // }
    return <ChanneLSettingsEditModaL >
        {_body}
    </ChanneLSettingsEditModaL>
}