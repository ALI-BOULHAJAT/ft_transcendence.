"use client"
import React, { MouseEvent, useEffect, useState } from "react"

interface ChanneLSettingsEditModaLProps {
    children: React.ReactNode,
}
const ChanneLSettingsEditModaL = ( {children} : ChanneLSettingsEditModaLProps) => {
    const [Ismounted, setIsmounted] = useState<boolean>(false)
   return <div className='flex flex-col gap-4'>{children}</div>

}
export default ChanneLSettingsEditModaL