
//dependecies
require('dotenv').config()
const express = require('express')
const {PORT =9000, MONGODB_URI} = process.env
const app = express()
const cors = require('cors')
const authRoutes = require('./Routes/AuthRoutes')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')


//Imported Middleware
const morgan = require('morgan')



//Mongoose Connection
mongoose.connect(MONGODB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('DB Connection Successful! You now have access to our backend server!')
}).catch(err=>{
    console.log(err.message)
})

//Middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
// app.use(shouldSendSameSiteNone);
app.use(
    cors({
      credentials: true,
      origin: [process.env.ORIGIN,'http://localhost:3000']
    })
  );
app.use('/', authRoutes)

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

app.set("trust proxy", 1);
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'Super Secret',
        resave: true,
        saveUninitialized: false,
        cookie: {
            sameSite: process.env.NODE_ENV === 'none',
            secure: process.env.NODE_ENV === "production", 
            
            
            
        }
    })
    );
const db = require('./models')


app.get('/', function (req, res) {
    res.cookie("foo", "bar", { sameSite: "none", secure: true });
    res.send('https://api.nasa.gov/planetary/apod?uv3clIRauk82izX7ubUIKtRboF7tiup9AXZSt3Ah=uv3clIRauk82izX7ubUIKtRboF7tiup9AXZSt3Ah');
  });
  

app.get('/register', (req,res)=>{
    res.send('This is the register')
})
app.post('/register', async (req,res,next)=>{
    try{
        const foundUser = await User.exists({email:req.body.email})
        if(foundUser){
            return res.send('You already have account...')
        }
        const salt = await bcrypt.genSalt(process.SALT_ROUNDS)
        console.log(salt)
        const hash = await bcrypt.hash(req.bpdy.password, salt)
        console.log(hash)
        req.body.password = hash
        const newUser = await User.create(req.body)
        return res.send('Return to login')
    }catch(error){
        console.log(error)
        req.error= error
        return next()
    }
})


app.get('/login', (req,res)=>{
    res.send('This is the login page')
})

app.post('/login', async function (req,res) {
    try{
        const foundUser = await db.User.findOne({email: req.body.email})
        if(!foundUser) return res.send('The password or the username is invalid')
        const match = await bcrypt.compare(req.body.password, foundUser.password)
        if(!match) return res.send('The password or the username is invalid')
        req.session.currentUser={
            id: foundUser._id,
            username: foundUser.username
        }
    }catch(err){
        console.log(err)
        req.err = err
        res.send(err)
    }
})


app.get('/users', async (req,res)=>{
    try{
        res.json(await db.User.find({}))
    }catch(error){
        res.status(400).json(error)
    }
})

app.post('/users', async(req,res)=>{
    try{
        res.json(await db.User.create(req.body))
    }catch(error){
        res.status(400).json(error)
    }
})

app.get('/userpage/:id', async(req,res)=>{
    try{
        res.json(await db.User.findById(req.params.id))
    }catch(error){
        res.status(400).json(error)
    }
})

app.put('/userpage/:id', async(req,res)=>{
    try{
        res.json(await db.User.findByIdAndUpdate(req.params.id,req.body))

    }catch(error){
        res.status(400).json(error)
    }
})

app.put('/userpage/:id', async(req,res)=>{
    try{
        res.json(await db.User.favorites.create(req.body))
        
    }catch(error){
        res.status(400).json(error)
    }
})

app.delete('/userpage/:id', async(req,res)=>{
    try{
        res.json(await db.User.findByIdAndRemove(req.params.id))
    }catch(error){
        res.status(400).json(error)
    }
})
app.get('/discussion', async(req,res)=>{
    try{
        res.json(await db.Discussion.find({}))
    }catch(error){
        res.status(400).json(error)
    }
})

app.post('/discussion', async(req,res, next)=>{
    try{
       res.json(await db.Discussion.create(req.body))

    }catch(error){
        console.log(error)
        req.error = error
        return next()
    }
})



//Listening
app.listen(PORT,()=>console.log(`Listening on port:${PORT}`))