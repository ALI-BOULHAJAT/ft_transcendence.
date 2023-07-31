import React from "react"


export default function ChanneLUserSettingsModaL({children} : {children: React.ReactNode}) {
    const [IsMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => {setIsMounted(true)}, [])
    if (!IsMounted) return null
    return <div className="Members flex mt-2 sm:mt-0 sm:p-1 flex-col items-start gap-3">
        {children}
    </div>
}