const express = require("express");
const path = require("path");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const moment = require('moment');
require("dotenv").config();

const database = require("./config/database");

const systemConfig = require("./config/system");
const routeAdmin = require("./routes/admin/index.route");
const route = require("./routes/client/index.route");

database.connect();
const app = express();
const port = process.env.PORT;

app.use(methodOverride('_method'));

//url endcode
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//Flash
app.use(cookieParser('keyboard cat'));

//Session
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 60000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    } 
}));
app.use(flash());
// End Flash

// TinyMCE
app.use(
    '/tinymce',
    express.static(path.join(__dirname, "node_modules", 'tinymce'))
);
// End TinyMCE

// App local variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
//Moment
app.locals.moment = moment;

app.use(express.static(`${__dirname}/public`));

//Route
routeAdmin(app);
route(app);
app.get("*", (req, res) => {
    res.render("client/pages/error/404", {
        pageTitle: "404 Not Found",
    });
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});