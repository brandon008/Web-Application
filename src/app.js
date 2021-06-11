const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');

const upload = require('express-fileupload');
const app = express();

let s = {};
const Song = mongoose.model('Song');
const User = mongoose.model('User');

let userList = [];
let str = '';

function addSong(title, description, id, filename, errorCallback, successCallback){
    const newSong = new Song({
      title: title,
      description: description,
      userId: id,
      fileName: filename
    });
  
    newSong.save(function(err, result){
      if(err){
        errorCallback({message: "DOCUMENT SAVE ERROR" });
      }
      if(result){
        successCallback(result);
      }
    });
  } 

//views folder 
app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next)=>{
    res.locals.user = req.session.user;
    next();
});  
  
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'mp3')));

app.use(upload());
app.get('/', (req, res) => {
    Song.find(function(err, result){
        if(!err){
            res.render("index", {'result': result});
        }else{
            console.log(err);
        }
    });

});

app.get('/users', (req, res) => {

    User.find(function(err, users){
        users.map(function callBack(value){
            if(!userList.includes(value.username)){
                userList.push(value.username);
            }
        })
    })

    userList = userList.sort();


    res.render('users', {'userList': userList});

})


app.get('/searchMp3', (req, res) => {
    const fileName = req.query.fileName;
    console.log(fileName);


    if(fileName){
        Song.find({fileName}, function(err, songResult){
            res.render('searchMp3',{'songResult': songResult});

        });
    }else{
        Song.find(function(err, songResult){
            res.render('searchMp3',{'songResult': songResult});

            
        })
    }

})
app.get('/searchPost', (req, res) => {
    const title = req.query.title;


    if(title){
        Song.find({title}, function(err, songResult){
            res.render('searchPost',{'songResult': songResult});

        });
    }else{
        Song.find(function(err, songResult){
            res.render('searchPost',{'songResult': songResult});

        })
    }
})

app.get('/logout', (req, res) =>{
    res.locals.user = undefined;
    req.session.user = undefined;
    res.redirect('/');
})

app.get('/song/add', (req, res) => {


    if(!req.session.user){
        res.redirect('/');
    }else{
        res.render('song-add.hbs');
    }
    
});


app.post('/song/add', (req, res) => {
        if(req.files){
            console.log(req.files);
            const file = req.files.file;
            const filename = file.name;
            console.log(filename);
    
            file.mv('../app/src/public/mp3/'+filename, function(err){
                if(err){
                    // res.render("index",err);
                    console.log(err); 
                } else{
                    addSong(req.body.title, req.body.description, req.session.user._id, filename,
                        (error) =>{
                            res.render('song-add.hbs', error);
                        }, 
                        (success)=>{
                            console.log(success);
                            console.log('file uploaded');
                            req.session.song = filename;
                            res.redirect('/');
                        });
                }
            }); 
        }
});

app.get('/song/slug', (req, res) => {
    let details = {};
    Song.findOne(req.query, function(err, song){
        if(!err){
            details = {'title': song.title,'description': song.description, 'file': song.fileName };
            User.findOne({'_id': song.userId}, function(err, user){
                if(!err){
                    details.op = user.username;

                    res.render('song-detail',{'details': details});
                }else{
                    console.log(err);
                    res.redirect('/');
                } 
            });
        }else{
            console.log(err);
            res.redirect('/');
        }
    });
});




app.get('/register', (req, res) => {
    res.render("register");
});

app.post('/register', (req, res) => {

    auth.register(req.body.username, req.body.email, req.body.password, 
        (error) =>{ 
            console.log(error); 
            res.render("register", error);
        }, 
        (success)=>{ 
            s = success;
            auth.startAuthenticatedSession(req, s, function f(){res.redirect("/");});
        });
});
        

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    auth.login(req.body.username, req.body.password, 
        (error)=>{
            console.log(error); 
            res.render("login", error);
        }, 
        (success)=>{
            s = success;
            auth.startAuthenticatedSession(req, s, function f(){res.redirect("/");});
        }
    );
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000; // app to listen in local
}
app.listen(port);
