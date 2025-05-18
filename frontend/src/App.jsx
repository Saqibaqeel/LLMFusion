import React from 'react'

import SignUp from './components/SignUp'
import ChooseBot from './components/ChooseBot'
import FeaturePanel from './components/FeaturePanel'
import ChatInterface from './components/ChatInterface'
import ChatBox from './components/ChatBox'
import Home from './components/Home'
import Login from './components/Login'
import { Routes,Route ,useNavigate} from 'react-router-dom'
import { useEffect } from "react";
import { Toaster} from 'react-hot-toast'
import useAuth from './store/UseAuth';
import ListofBoat from './components/ListofBoat'
import FarmBoat from './components/FarmBoat'
import MedicalBot from './components/Medicalbot'
import LegalBot from './components/LegalBot'
import EducationBot from './components/EductionBot'
import MainChooseBot from './components/MainChooseBot'

function App() {
  const navigate = useNavigate();
  
  const {checkAuth,isCheckingAuth,authUser}=useAuth()

  useEffect(() => {
    checkAuth();
   
  
   
  }, [])
  
  {
    if(isCheckingAuth && !authUser){
      <p>loading..</p>
    }
  }
 
  return (
    <>
    
    <Toaster />
    <Routes>
    <Route path="/" element={<Home />} />
    {/* <Route path="/choosebot" element={<ChatBox/>} /> */}
 

    <Route path="/listOchat" element={<ListofBoat />} />
    <Route path="/farming-chat" element={<FarmBoat />} />
    <Route path="/medical-chat" element={<MedicalBot />} />
    <Route path="/legal-chat" element={<LegalBot />} />
    <Route path="/education-chat" element={<EducationBot />} />
      <Route path="/signup" element={<SignUp />} />
     
    <Route path="/login" element={<Login />} />
      <Route path="/chat"element={authUser?<MainChooseBot/>:<Home/>} />
    
    </Routes>
  
   </>
  )
}

export default App