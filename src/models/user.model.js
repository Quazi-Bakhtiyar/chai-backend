import mongoose , {Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique: true,
        lowercase: true,
        trim : true,
        index:true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique : true,
        lowercase: true,
        trim: true
    },
    avatar : {
        type: String, // Cloudinary URL
        requiered: true,
    },
    coverImage:{
        type: String, // Cloudinary URL
    },
    watchHistroy: [
        {
            type : Schema.Types.ObjectId,
            ref : video
        }
    ],
    password : {
        type: String, 
        required : [true, "password is requried"]
    },
    refreshToken: {
        type: String
    }

},
{
    timestamps: true
})

userSchema.pre("save", function async(next){
    if(!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAcessToken = function(){
    return jwt.sign(
        {
            _id: this.id,
            email : this.email,
            username: this.username,
            fullName: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:ACESS_TOKEN_EXPIRTY
        }

    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User", userSchema)