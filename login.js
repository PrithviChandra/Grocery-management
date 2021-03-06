const mysql=require('mysql');
const express=require('express');
const session=require('express-session');
const bodyParser=require('body-parser');
const path=require('path');
//const router=express.Router();
 
//const { createConnection } = require('net');
//const { Server } = require('http');

const conn=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'sanjana123',
    database: 'Ecommercedb'
});

const app=express();
app.set('view engine','ejs');

app.use(express.static('public'));
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.post('/auth',(req,res)=>{
    var username=req.body.username;
    var password=req.body.password;
    if(username && password){
        conn.query('SELECT * FROM accounts WHERE username= ? AND password= ?', [username,password], (error,results,fields)=>{
         if(results.length>0 && username=="test"){
             req.session.loggedin = true;
             req.session.username=username;
             res.redirect('/home');
         }else if(results.length>0){
            req.session.loggedin = true;
            req.session.username=username;
            res.redirect('/home');
         }
         else{
             res.send("Incorrect");
         }
         res.end();
        });

    }else{
        res.send("Please enter username and pass");
        res.end();
    }
});
var Users=[];
app.get('/signmeup',(req,res)=>{
    res.sendFile(path.join(__dirname + 'public/signup.html'));
})


app.post('/signup',(req,res)=>{
    if(!req.body.username || !req.body.password){
        res.status("400");
        res.send("Invalid details!");
    }
    else{
    Users.filter(function(user){
        if(user.username===req.body.id){
            res.render('index',{message: 'User already exists!'});
        }
    });
    var sql='INSERT INTO accounts(username,password,email) values (?,?,?)'
    var newUser=[req.body.username, req.body.password,req.body.email];
    conn.query(sql,newUser, (error,results,fields)=>{
        if(error){
            return res.status(400);
            //res.send("Error");
            //console.log(error);
        }
        else{
            return res.redirect('/home'); 
            //res.status(200).json({
                //status: 'success'
            //});
            console.log("Success");
            res.send("Successfully signed up");
            res.redirect('/home');
        }
    });
    
    }
});

app.get('/home', function(request, response) {
	if (request.session.loggedin && request.session.username=="test") {
		response.redirect('/admin');
    }else if(request.session.loggedin){
        response.redirect('/buyer');
    } 
    else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/buyer', (req,res)=>{
    res.sendFile(path.join(__dirname + '/public/buyer.html'));
});

app.get('/admin',(req,res)=>{
    res.sendFile(path.join(__dirname+ '/public/admin.html'));
});

app.post('/insert',(req,res)=>{
    var sql = 'INSERT INTO items (i_name, price, quantity) VALUES (?,?,?)';
    var newItem=[req.body.itemname,req.body.price,req.body.quantity];
    conn.query(sql, newItem, function (error,data) {
       if (error) throw error;
            console.log("Item inserted");
        });
    res.redirect('/admin');
});
app.post('/display',(req,res)=>{ 
    var sql='SELECT * FROM items';
    conn.query(sql,(error,data)=>{
        if(error) throw error;
        res.render('display', {title: 'Product list',productData:data});

    });   
});

/*app.post('/update/:id',(req,res)=>{
   var sql='UPDATE items SET ? WHERE i_id='+req.params.id+';';
   var updateItem=[req.body.itemname,req.body.price,req.body.quantity];
   conn.query(sql,updateItem,(error,data)=>{
   if(error) throw error;
   res.render('/update',{title: 'Update list',itemData:data});
   });

});*/
  

app.listen(5000);
