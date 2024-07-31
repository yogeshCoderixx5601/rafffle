
import RaffleIdPage from '@/views/RaffleId'
import React from 'react'

const Raffle = ({ params }: { params: { raffleId: string } }) => {
    const raffleId = params.raffleId
  return (
    <div><RaffleIdPage raffleId={raffleId}/></div>
  )
}

export default Raffle