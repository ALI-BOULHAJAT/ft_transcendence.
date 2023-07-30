"use client"
import ContactHook from "@/hooks/contactHook"
import { TiArrowMinimise } from "react-icons/ti"
<<<<<<< HEAD
import { RegisterOptions, FieldValues, UseFormRegisterReturn, useForm, SubmitHandler, useFieldArray, set } from "react-hook-form"
import { MouseEvent, useEffect, useState } from "react"
import { userType } from "@/types/types"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"


=======
import { RegisterOptions, FieldValues, UseFormRegisterReturn, useForm, SubmitHandler, useFieldArray } from "react-hook-form"
import { useEffect, useState } from "react"
import { userType } from "@/types/types"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
import ChanneLModal from "./channel.modal"
import Select from "../../components/Select"
import ChanneLcreatemodaLHook from "../hooks/channel.create.hook"
import ChanneLmodaLheader from "../components/channel.modal.header"
import Input from "@/components/Input"
<<<<<<< HEAD
import getUserWithId from "../actions/getUserWithId"
import Button from "../../components/Button"
import { RiGitRepositoryPrivateFill } from "react-icons/ri"
import { MdOutlinePublic } from "react-icons/md"
import { GrSecure, GrInsecure } from "react-icons/gr"
import { GoEyeClosed } from "react-icons/go"
import { HiLockClosed, HiLockOpen } from "react-icons/hi"
enum RoomType {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
}
const ChanneLCreateModaL = () => {
    const { IsOpen, onClose, onOpen, socket, selectedFriends } = ChanneLcreatemodaLHook()
=======

const ChanneLCreateModaL = () => {
    const channeLcreatemodaLHook = ChanneLcreatemodaLHook()
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
    const route = useRouter()
    const token: any = Cookies.get('token')
    const [aLLfriends, setfriends] = useState<any[] | null>(null)
    const [userId, setuserId] = useState<userType | null>(null)
    const [InputValue, setInputValue] = useState("")

    let users: any[] = []
    useEffect(() => {
        const token: any = Cookies.get('token');
<<<<<<< HEAD
        const User_ID: string | undefined = Cookies.get('_id');
        // console.log("token :", token)
        if (!token)
            return;
        (async function getFriends() {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}`, },
            }).then((resp) => resp.json()).then(data => {
                const _list =data && data.filter((user: any) => user.id !== User_ID)
                setfriends(_list)
=======
        console.log("token :", token)
        if (!token)
            return;
        (async function getFriends() {
            await fetch('http://127.0.0.1/api/users', {
                headers: { Authorization: `Bearer ${token}`, },
            }).then((resp) => resp.json()).then(data => {
                console.log("++++++++++*****data :", data)
                setfriends(data)
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
            })
        })();
    }, [])


    type formValues = {
        channel_name: string,
<<<<<<< HEAD
        friends: userType[],
        ChanneLpassword: string,
        channeLtype: string
=======
        friends: userType[]
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
    }

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
            channel_name: '',
<<<<<<< HEAD
            friends: selectedFriends,
            ChanneLpassword: "",
            channeLtype: ""
        },
    });

    const friends = watch('friends')
    const _channel_name = watch('channel_name')
    const _channeLpassword = watch('ChanneLpassword')
    const _channeLtype = watch('channeLtype')
=======
            friends: [],
        },
    });


    if (channeLcreatemodaLHook.selectedFriends && channeLcreatemodaLHook.selectedFriends.length && !watch('friends').length) {
        console.log("channeLcreatemodaLHook.selectedFriends :", channeLcreatemodaLHook.selectedFriends)
        setValue('friends', channeLcreatemodaLHook.selectedFriends)
    }
    const friends = watch('friends')
    const _channel_name = watch('channel_name')
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c


    // Argument of type 'string' is not assignable to parameter of type '"channel_name" | "friends" | `friends.${number}` | `friends.${number}.id` | `friends.${number}.login` | `friends.${number}.email` | `friends.${number}.password` | `friends.${number}.first_name` | `friends.${number}.last_name` | `friends.${number}.kind` | `friends.${number}.image` | `friends.${number}.is_active`
    const setcustomvalue = (key: any, value: any) => {
        setValue(key, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
    }



    const onSubmit: SubmitHandler<FieldValues> = async (UserId: any) => {
<<<<<<< HEAD
        // create private room : createroom
        setcustomvalue(_channel_name, "")
        reset();
        setInputValue("");

        const token: any = Cookies.get('token');
        const User_ID: string | undefined = Cookies.get('_id');

        const LoginUser = User_ID && await getUserWithId(User_ID, token)
        LoginUser.role = "OWNER"
        let _friends: any[] = []

        // get friends data :
        for (let i = 0; i < UserId.friends.length; i++) {
            const __friends = await getUserWithId(UserId.friends[i].value, token);
            __friends.role = "USER"
            _friends.push(__friends)
        }
        _friends.push(LoginUser)

        socket?.emit('createroom', {
            name: UserId.channel_name,
            friends: _friends,
            type: UserId.channeLtype,
            channeLpassword: UserId.ChanneLpassword
        },
            (response: any) => {
                console.log('join response : ', response)
            });
        socket?.on('createroomResponseEvent', (room: any) => {
            console.log('room created : ', room)
            route.push(`/chat/channels?r=${room.id}`)
            onClose()
        })
=======
        // create private room :
        console.log("+onSubmit+ +> UserId :", UserId)
        reset();
        setInputValue("");

>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
    }

    const bodyContent = (
        <div className="  w-full p-4 md:p-6 flex flex-col justify-between min-h-[34rem]">
<<<<<<< HEAD

            <div className="body flex flex-col gap-4">

                <div className="body flex flex-col gap-2 py-4">
                    <h1 className=" text-[#ffffffb9] text-xl font-bold capitalize">channel name </h1>
                    <Input
                        onChange={(e: any) => { setcustomvalue(_channel_name, e.target.value) }}
                        id={"channel_name"} lable={"channel name"}
                        register={register}

                        errors={errors} />
                </div>
                <div className="flex flex-col gap-3">
                    <h1 className=" text-[#ffffffb9] text-xl font-bold capitalize">channel type </h1>

                    <div className=" w-full flex flex-row justify-between items-center ">
                        <Button
                            icon={GoEyeClosed}
                            label={"private"}
                            outline
                            IsActive={_channeLtype === "PRIVATE"}
                            onClick={() => { setcustomvalue("channeLtype", "PRIVATE") }}
                        />
                        <Button
                            icon={HiLockClosed}
                            label={"public"}
                            outline
                            IsActive={_channeLtype === "PUBLIC"}
                            onClick={() => { setcustomvalue("channeLtype", "PUBLIC") }}
                        />
                        <Button
                            icon={HiLockOpen}
                            label={"protected"}
                            outline
                            IsActive={_channeLtype === "PROTECTED"}
                            onClick={() => { setcustomvalue("channeLtype", "PROTECTED") }}
                        />
                    </div>
                </div>
                {/* if protacted */}
                {
                    _channeLtype === "PROTECTED" && <div>
                        <h1 className=" text-[#ffffffb9] text-xl font-bold capitalize">channel password </h1>
                        <Input
                            onChange={(e: any) => { setcustomvalue(_channeLpassword, e.target.value) }}
                            id={"ChanneLpassword"} lable={"ChanneLpassword"}
                            register={register}
                            type="password"
                            errors={errors} />
                    </div>
                }
=======
          
            <div className="body flex flex-col gap-4">
                <div className="body flex flex-col gap-2 py-4">
                    <h1 className=" text-[#ffffffb9] text-xl font-bold capitalize">channel name </h1>
                    <Input
                        onChange={(e :any) => { setcustomvalue(_channel_name, e.target.value) }}
                        id={"channel_name"} lable={"channel name"}
                        register={register}
                        errors={errors} />
                </div>
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
                {aLLfriends !== null && <Select
                    disabled={false}
                    lable={"Select Friends"}
                    options={aLLfriends.map((friend) => ({
                        value: friend.id,
                        label: friend.login,
<<<<<<< HEAD
                        role: "USER"
=======
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
                    }))}
                    value={friends}
                    onChange={(value: any) => {
                        setValue('friends', value,
                            { shouldValidate: true })
                    }}
                />}
            </div>
            <div className="">
                <button onClick={handleSubmit(onSubmit)} className="text-white hover:text-black border border-secondary hover:bg-secondary text-sm font-bold capitalize px-7 py-3 rounded-[12px]  w-max">
                    Create
                </button>
            </div>
        </div>
    )
<<<<<<< HEAD
    return <ChanneLModal IsOpen={IsOpen} title={"create channel"} children={bodyContent} onClose={onClose} />

=======
    console.log("-----              --friends :", friends)
    return <ChanneLModal IsOpen={channeLcreatemodaLHook.IsOpen} title={"create channel"} children={bodyContent} onClose={channeLcreatemodaLHook.onClose} />
        // IsOpen={channeLcreatemodaLHook.IsOpen}
        // body={bodyContent} />
>>>>>>> 83667b2c2c6fcadfdbeb783afabb311e9d36e57c
}
export default ChanneLCreateModaL