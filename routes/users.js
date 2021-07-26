const express = require('express');
const router=express.Router();
const bcrypt=require('bcryptjs')
const User=require('../models/User');
const passport = require ('passport');

router.get('/login', (req, res)=>{
    res.render('login');
})

router.get('/register', (req, res)=>{
    res.render('register');
})

//registration
router.post('/register',(req,res)=>{
    const{name, email, password, password2}=req.body;
    let errors=[];

    //check required fields
    if(!name || !email || !password ||!password2){
        errors.push({msg:'Please fill all fields'})
    }

    if(password!==password2){
        errors.push({msg:'Passwords do not match'});
    }

    if(errors.length>0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })

    }else{
        User.findOne({email:email
        }).then(user=>{
            if(user){
                errors.push({msg:'Email already exists'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }else{
                const newUser=new User({
                    name,
                    email,
                    password
                });

                //pw hashing
                bcrypt.genSalt(10, (err, salt)=>{bcrypt.hash(newUser.password, salt, (err,hash)=>{
                    if(err) throw err;
                    newUser.password=hash;
                    newUser.save()
                    .then(user=>{
                        req.flash('success_msg', 'You are now registered');
                        res.redirect('/users/login')
                    })
                    .catch(err=>console.log(err));
                })})                

            }
        });
    }
    
})

//login
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);

});


//logout
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', 'Logged out');
    res.redirect('/users/login');
})

module.exports=router;