if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ejsMate = require('ejs-mate');
const User = require('./models/users');
const MongoDBStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const {google} = require('googleapis');
const getfilelist = require('google-drive-getfilelist');
const {isLoggedIn} = require('./middleware');


const sendMail = require('./public/javascript/mail');
const userRoutes = require('./routes/users');
const { callbackPromise } = require('nodemailer/lib/shared');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/seniorproject';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

const sessionConfig = {
    // store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/contactus', (req, res) => {
    res.render('contactus');
})

app.get('/smart-bin-locations', (req, res) => {
    res.render('locations');
})


app.get('/r/AUB', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];
    res.render('products', {loc});
})

app.get('/r/LAU', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];
    res.render('products', {loc});
})

app.get('/r/NDU', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];
    res.render('products', {loc});
})

app.get('/recyclable/AUB', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];

    const topFolderId = "1FiOrUmeV4afkLy-LcgProJLNmLU38cBy";
    getfilelist.GetFileList(
    {
        auth: oauth2Client,
        fields: "files(id)",
        id: topFolderId,
    },
    (err, ress) => {
        if (err) {
        console.log(err);
        return;
        }
        const fileList = ress.fileList.flatMap(({ files }) => files);
        res.render('recycle', {fileList, loc});
    });
})

app.get('/non-recyclable/AUB', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];

    const topFolderId = "1BN9d048PNtXE8hisFbACWgpcf6KuoS2N";
    getfilelist.GetFileList(
    {
        auth: oauth2Client,
        fields: "files(id)",
        id: topFolderId,
    },
    (err, ress) => {
        if (err) {
        console.log(err);
        return;
        }
        const fileListN = ress.fileList.flatMap(({ files }) => files);
        res.render('non-recycle', {fileListN, loc});
    });
})

app.get('/recyclable/LAU', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];

    const topFolderId = "16S7FpXWNmZcbuyiSvDVu0y7WyxPgPy4M";
    getfilelist.GetFileList(
    {
        auth: oauth2Client,
        fields: "files(id)",
        id: topFolderId,
    },
    (err, ress) => {
        if (err) {
        console.log(err);
        return;
        }
        const fileList = ress.fileList.flatMap(({ files }) => files);
        res.render('recycle', {fileList, loc});
    });
})

app.get('/non-recyclable/LAU', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];

    const topFolderId = "1V49BFqzhUbIU88-NH4Nyg1MEKVv5i6an";
    getfilelist.GetFileList(
    {
        auth: oauth2Client,
        fields: "files(id)",
        id: topFolderId,
    },
    (err, ress) => {
        if (err) {
        console.log(err);
        return;
        }
        const fileListN = ress.fileList.flatMap(({ files }) => files);
        res.render('non-recycle', {fileListN, loc});
    });
})

app.get('/recyclable/NDU', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];

    const topFolderId = "1wEKkfSZIkAnSZr1NhmvHSZzojZCQLCyz";
    getfilelist.GetFileList(
    {
        auth: oauth2Client,
        fields: "files(id)",
        id: topFolderId,
    },
    (err, ress) => {
        if (err) {
        console.log(err);
        return;
        }
        const fileList = ress.fileList.flatMap(({ files }) => files);
        res.render('recycle', {fileList, loc});
    });
})

app.get('/non-recyclable/NDU', isLoggedIn, (req, res) => {
    const url = req.originalUrl;
    const u = url.split('/')
    const loc = u[u.length - 1];
    
    const topFolderId = "1mK1aB-okF8iazuu1UR2Lyi_kSrLs1myH";
    getfilelist.GetFileList(
    {
        auth: oauth2Client,
        fields: "files(id)",
        id: topFolderId,
    },
    (err, ress) => {
        if (err) {
        console.log(err);
        return;
        }
        const fileListN = ress.fileList.flatMap(({ files }) => files);
        res.render('non-recycle', {fileListN, loc});
    });
})

app.post('/send', (req, res) => {
    const {inputEmail, inputSubject, inputComment, inputFirst, inputLast, inputPhone} = req.body;
    const text = `FROM: ${inputFirst} ${inputLast}\nPHONE NUMBER: ${inputPhone}\nMESSAGE: ${inputComment}`
    sendMail(inputEmail, inputSubject, text, (err, data) => {
        if(err){
            throw new ExpressError('Internal Error', 500);
        }
        else{
            req.flash('success', 'Your message was sent successfully. Thank your for your feedback');
            res.redirect('/contactus');
        }
    });
})

app.use('/', userRoutes);


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log(`Serving on port 3000`);
})