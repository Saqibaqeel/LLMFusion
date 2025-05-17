import {create} from 'zustand'
import axiosInstance from '../utility/axios'

import toast from 'react-hot-toast'
const  useAuth=create((set)=>({
    authUser:null,
    isLogout:false,
    isLogin:false,
    isSignUp:false,
    isUpdateProfile:false,
    isCheckingAuth:true,
   
    checkAuth:async()=>{
       try {
        const res=await axiosInstance.get('/auth/check')
        console.log(res)
        set({authUser:res.data})
        
       } catch (error) {
        console.log('error',error)
        set({authUser:null})
        
       }
       finally{
        set({isCheckingAuth:false})
       }

    },

    Signup:async(data)=>{
        try {
            set({isSignUp:true})
            const response=await axiosInstance.post('/auth/signUp',data)
            console.log(response)
            set({authUser:response.data})
            toast.success("account created")
            
        } catch (error) {
            set({isSignUp:false})

            
        }
        finally{
            set({isSignUp:false})

        }
    },
    logout:async()=>{
        try {
            set({isLogout:true});
            const res= await axiosInstance.get('/auth/logout')
            toast.success("logout success")
            
        } catch (error) {
            toast.error('somthing went wrong')
            
        }
        finally{
            set({isLogout:false});
        }
       
    },
    login:async(data)=>{
        try {
            set({isLogin:true});
            const res= await axiosInstance.post('/auth/login',data);
            set({authUser:res.data});
            toast.success('login succes')
            
        } catch (error) {

            toast.error("somthin went wrong")
            
        }
        finally{
            set({isLogin:false});

        }
    }

}))
export default useAuth