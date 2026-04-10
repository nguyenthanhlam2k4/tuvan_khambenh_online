import React, { useState } from 'react'
import Sidebar from '../components/admin/Sidebar'

const Dashboard = () => {
  const [active, setActive] = useState("Users");
  return (
    <div className=''>
        <Sidebar active={active} setActive={setActive}/>
    </div>
  )
}

export default Dashboard