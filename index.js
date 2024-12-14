
const Express = require('express')
const Dotenv = require('dotenv')
const Mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./Module/User')
const bcrypt = require('bcryptjs')






const app = Express()
app.use(cors())

// app.use(bodyperser);

const Port = process.env.Port || 5000
app.set('view engine', 'ejs')
app.use(Express.urlencoded({ extended: true }))


Dotenv.config()
app.use(bodyParser.json())
Mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Succses MongoDb")
    })
    .catch((error) => {
        console.log(`${error}`)
    })

const store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    connection: "MySession"
})
app.use(session({
    secret: 'this is a secret',
    resave: false,
    saveUninitialized: false,
    store: store

}))

const checkAuth = (req,res, next) => {
    if(req.session.isAuthicated ){
        next()
    }else{
        res.redirect('/Register')
    }
}




app.get('/Register', async (req, res) => {
    res.render('Register')
})

app.get('/Login', (req, res) => {
    res.render('Login')
})

app.get('/Dashboard', checkAuth, (req, res) => {
    res.render('Dashboard')
})



//Register
app.post('/Register', async (req, res) => {
    const { UserName, Email, Password } = req.body;

    let user = await User.findOne({ Email });

   

    const hashedPassword = await bcrypt.hash(Password, 10);

    try {
      
        const NewUser = new User({
            UserName,
            Email,
            Password: hashedPassword
        });

        await NewUser.save();

        req.session.person = NewUser.UserName;

        res.redirect("/Login");

    } catch (err) {
    
        console.error(err);
        res.status(500).send('Server error occurred, please try again.');
    }
});




//Log In
app.post('/user-login', async (req, res) => {
    const { Email, Password } = req.body
    const user = await User.findOne({ Email })

    if (!user) {
        return res.redirect('/Register')

    }
    const checkPassword = await bcrypt.compare(Password, user.Password)

    if (!checkPassword) {
        return res.redirect('/Register')
    }
    req.session.isAuthicated = true
    res.redirect("/Dashboard")

})


//LOGOUT
app.post('/logout' ,(req, res) => (
    req.session.destroy((err) => {
        if(err) throw err
        res.redirect('/register')
    })
))



app.listen(Port, () => {
    console.log(`seccsess ${Port}`)
})