const mongoose = require('mongoose')
const bcrypt = require ('bcrypt')


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,'first name cannot be empty']
    },
    lastName:{
        type:String,
        required:[true, 'last name cannot be empty']
    },
    username:{
        type:String,
        required:[true, 'Must enter a username'],
        unique:true
    },
    email:{
        type: String,
        required:[true, 'Email is required'],
        unique: true
    },
    password:{
        type:String,
        required:[true,'Password is required']
    },
    profilepic:{
        type:String,
        default:'data:image/png;base64,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'
    },
    bio:{
        type:String,
        default:'Tell us about yourself!'
    },
    hobbies:[{
        type:String,
        default:'List your hobbies!'
    }],
    favorites:[{
        type:String,
        default:'Got a favorite movie put it here!'
    }],
    reviews:[{
        type:String,
        default:'Leave a review here!'
    }]
},
{
    timestamps:true

})

userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email})
    if(user){
        const auth = await bcrypt.compare(password,user.password)
        if(auth){
            return user
        }
        throw Error("incorrect password")
    }
    throw Error('incorrect Email')
}

const User = mongoose.model('User', userSchema)

module.exports = User