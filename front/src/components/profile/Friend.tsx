"use client"
import React from 'react'
import FriendCard from './FriendCard';

const Friend = () => {
  return (
    <div className='bg-[#243230] m-2 mt-5 rounded-[5px] text-white min-h-[200px] flex flex-col items-center px-2'>
      <FriendCard />
      <FriendCard />
      <FriendCard />
    </div>
  )
}

export default Friend