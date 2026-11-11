import {safeExecute} from '../../../db/config.db.js';
import {BadRequestError,UnauthenticatedError} from '../../../utils/error/index.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const normalizeEmail=(email)=>{
    return email.trim().toLowerCase();
}
const checkUserExists=async(email)=>{
    const normalizedEmail=normalizeEmail(email);
    const user=await safeExecute('SELECT * FROM users WHERE email=?',[normalizedEmail]);
  return user.length>0;
}
export const registerService=async({firstName,lastName,email,password})=>{
    const normalizedEmail=normalizeEmail(email);
  const userExists=await checkUserExists(email);
  if(userExists){
      throw new BadRequestError('User already exists with this email');
  }
  const salt=await bcrypt.genSalt(10);
  const hashedPassword=await bcrypt.hash(password,salt);
try{
 const result=   await safeExecute('INSERT INTO users(first_name,last_name,email,password_hash) VALUES(?,?,?,?)',[firstName,lastName,normalizedEmail,hashedPassword]);
 return {
    id:result.insertId,
    firstName,
    lastName,
    email:normalizedEmail
}
}catch(error){
    if(error.code==='ER_DUP_ENTRY'){
        throw new BadRequestError('Error registering user');
    }
    throw new BadRequestError('Error registering user');
}



}
export const loginService=async({email,password})=>{
    const normalizedEmail=normalizeEmail(email);
    let user=await safeExecute('SELECT * FROM users WHERE email=?',[normalizedEmail]);
    if(user.length===0){
        throw new UnauthenticatedError('User not found');
    }
     user=user[0];
    const hashedPassword=user.password_hash;
    const isMatch=await bcrypt.compare(password,hashedPassword);
    if(!isMatch){
        throw new UnauthenticatedError('InValid password or email');
    }
    const payload={
        id:user.user_id,
        firstName:user.first_name,
        lastName:user. last_name,
        email:user.email
    }
    const JWT_SECRET=process.env.JWT_SECRET;
    const token=jwt.sign(payload,JWT_SECRET,{expiresIn:'24h'});
   
    return {  
    id:payload.id,
    firstName:payload.firstName,
    lastName:payload.lastName,
    email:payload.email,
    token

    }
    }
  

