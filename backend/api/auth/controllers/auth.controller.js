import {registerService,loginService} from '../services/auth.services.js'
import {StatusCodes} from 'http-status-codes';
export const registerController=async (req,res,next)=>{
    const {firstName,lastName,email,password}=req.body;
try{
    const newUser= await registerService({firstName,lastName,email,password});
    res.status(StatusCodes.CREATED).json({
        success:true,
        msg:"User registered successfully",
        user:newUser
    });
}catch(error){
    console.log(error);
}

}
export const loginController =async (req,res,next)=>{
const {email,password}=req.body;
try{
    const user=await loginService({email,password});
    res.status(StatusCodes.OK).json({
        success:true,
        msg:"User logged in successfully",
        user:{
            id:user.id,
            firstName:user.firstName,
            lastName:user.lastName,
            email:user.email
        },
        token:user.token
    });
}catch(error){
    console.log(error);
}
};

