const UserModel = require('../models/User')
const jwt = require('jsonwebtoken')
const maxAge = 3*24*60*60

const createToken = (id) =>{
    return jwt.sign({id},'secret key',{
        expiresIn: maxAge,
    })
}

const handleErrors = (err) =>{
    let errors = { email:"", password:""}

    if(err.message==="incorrect Email") 
    errors.email = "That email or password is not found"

    if(err.message==="incorrect password") 
    errors.password = "That email or password is not found"

    if(err.code ===11000){
        errors.email="Email is already in use"
        return errors
    }
    if(err.message.includes("Users validation failed")){
        Object.values(err.errors).forEach(({properties})=>{
            errors[properties.path] = properties.message
        })
    }
    return errors
}

module.exports.register = async (req,res,next) =>{ try{
    const {email,password,firstName,lastName,username} = req.body
    const user = await UserModel.create({email,password,firstName,lastName,username})
    const token = createToken(user._id)
    res.cookie('jwt', token,{
        withCredentials:true,
        httpOnly:false,
        maxAge: maxAge * 1000,
    })
    res.status(201).json({user:user._id, created:true})
}catch(err){
    console.log(err)
    const errors = handleErrors(err)
    res.json({errors, created:false})
}}

module.exports.login = async (req,res) =>{
    const {email,password} = req.body
    try{
    const user = await UserModel.login(email,password)
    const token = createToken(user._id)
    res.cookie('jwt', token,{
        withCredentials:true,
        httpOnly:false,
        maxAge: maxAge * 1000,
    })
    res.status(200).json({user:user._id, created:true})
}catch(err){
    console.log(err)
    const errors = handleErrors(err)
    res.json({errors, created:false})
}}

