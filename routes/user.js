var express = require('express');
const userHelpers = require('../helpers/userHelpers');
var router = express.Router();
const userHelper = require("../helpers/userHelpers")
const user = require("../models/user")
const adminHelpers = require("../helpers/adminHelpers");
const async = require('hbs/lib/async');
const products =require('../models/products');
const moment = require('moment')
const { deliveryCharge, grandTotal } = require('../helpers/userHelpers');
const { response } = require('express');
const cart = require('../models/cart');

const VerifyLogin =(req,res,next)=>{
  if(req.session.logedin){
    next()
  } 
  else{
    res.redirect("/login")
  }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user;
  let CartCount =null
  if(user){
    CartCount = await userHelpers.getCartCount(user)
  }
  const categoryData =await userHelpers.getAllCategory()
  const showProducts = await userHelpers.getAllProducts()
  res.render('user/index', { user, showProducts, categoryData, CartCount  });


});



router.get('/login', function (req, res, next) {
  if (req.session.logedin) {

    res.redirect('/')
  }
  else {
    console.log(req.session.loggedInError + "log3")
    res.render("user/uLogin", {
      signupSuccess: req.session.signupSuccess,
      loggErr: req.session.loggedInError, signuperror: req.session.loggErr2, passwordreset: req.session.message, title: "userLogin", layout: false
    })


  }
  req.session.signupSuccess = null,
    req.session.loggErr2 = null;
  req.session.loggedInError = null;
  req.session.message = null;
})


router.get('/Signup', function (req, res) {
  res.render('user/uSignup', { signerr: req.session.signUperror, layout: false })
})

router.post('/signUp', function (req, res, next) {
  userHelper.doSignup(req.body).then((response) => {
    req.session.otp = response.otp
    req.session.userdetails = response
    res.redirect('/otp')
  }).catch((err) => {
    req.session.signUperror = err.msg;
    res.redirect("/Signup")
  })
})

router.get('/otp', function (req, res, next) {
  res.render('user/otpSignup', { layout: false, otpErr: req.session.otpError })
})



const VerifyOtp = async (req, res) => {
  if (req.session.otp == req.body.otpsignup) {
    let userData = req.session.userdetails
    const adduser = await new user({
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      password: userData.password
    })
    await adduser.save()
    req.session.signupSuccess = "signup successful,please login to continue"
    res.redirect('/login')
  }
  else {
    res.redirect('/signup')
  }
}
router.post('/otpverify',VerifyOtp)

router.post("/login", (req, res) => {

  userHelper.doLogin(req.body).then((response) => {
    console.log("inside dologin");
    if (response.user) {
      req.session.logedin = true;
      req.session.user = response.user;
      res.redirect("/");
    }

    else {
      req.session.loggedInError = "invalid username or password";
      console.log(req.session.loggedInError + "log1")
      res.redirect("/login");
    }
  })
    .catch((err) => {
      req.session.loggedInError = err.msg;
      console.log(req.session.loggedInError + "log2")
      res.redirect("/login");
    })
})

router.post("/forget", async (req, res) => {
  userHelpers
    .doresetPasswordOtp(req.body)
    .then((response) => {
      console.log(response);
      req.session.otp = response.otp;
      req.session.userdetails = response;
      req.session.userRID = response._id;
     ;
      res.redirect("/otpReset");
    })
    .catch((err) => {
      req.session.loggErr2 = err.msg;
      res.redirect("/userlogin");
    });
});
router.get("/otpreset", function (req, res, next) {
  res.render("user/otpreset", { layout: false, otpErr: req.session.otpError })
})

router.post("/otpResetVerify", async (req, res) => {
  console.log(req.session.otp)
  console.log(req.body.otpsignup)
  if (req.session.otp == req.body.otpsignup) {
    res.redirect("/newPassword")
  }
  else {
    console.log("otp incorrect");
    req.session.otpError = "OTP not Matching!"
    res.redirect("/otpReset")
  }
})
router.get("/newPassword", function (req, res) {
  console.log("newpssword page")
  res.render("user/newPassword")
})





router.post("/RPass", async (req, res) => {
  console.log(req.body);
  if (req.body.password == req.body.confirmPassword) {
    console.log("if loop ")
    userHelper.doresetPass(req.body, req.session.userRID)
      .then((response) => {
        console.log(response)
        req.session.message = "password changed succesfully ! please login with new password"
        res.redirect("/login")
        console.log("password updated")
      })
  } else {
    console.log("password mismatch")
    req.session.passErr = "password mismatch";
    res.redirect("/newPassword")
  }
})




router.get("/logout", function (req, res, next) {
  res.redirect("/")
  req.session.destroy();
});

router.get('/forgetpassword', function (req, res, next) {
  res.render("user/forgetPassword")
})


//shopping

router.get("/shopPage", async (req, res, next) => {
  let user = req.session.user;
  let CartCount =null
  if(user){
    CartCount = await userHelpers.getCartCount(user)
  }
  const showProducts = await userHelpers.getProductsForShop()
  const subcategoryData =await userHelpers.getSubcategories()
  const categoryData =await userHelpers.getAllCategory()

    res.render('user/shop', { user, showProducts, CartCount , subcategoryData,  categoryData });

 
})

router.get("/shopsingle/:id",VerifyLogin, async (req, res) => {
  let user = req.session.user
  CartCount=null
  if(user){
    CartCount = await userHelpers.getCartCount(user)
  }
   
  let product = await userHelpers.getSingleProduct(req.params.id)
  res.render("user/shopSingle", { product, user: req.session.user , CartCount });

});

router.get("/cart", VerifyLogin,async(req,res,next) => {
  let user = req.session.user
  console.log(user, "user");
  
  let CartCount = await userHelpers.getCartCount(user) 
  if( CartCount>0){
  console.log(user)

  const subTotal = await userHelpers.subTotal(req.session.user._id)
  console.log(subTotal+"subtotal")
  const totalAmount = await userHelpers.NetTotal(req.session.user._id)
  const netTotal = totalAmount.nettTotal.total
  const deliveryCharge = await userHelpers.deliverycharge(netTotal)
  const grandTotal = await userHelpers.grandTotal(netTotal,deliveryCharge)
  
  console.log(netTotal)
  let cartItems =await userHelpers.getCartProducts(user._id)
  res.render("user/cart",{cartItems,user,CartCount,subTotal,netTotal,deliveryCharge,grandTotal})
}else{



  res.render("user/cart",{CartCount})
}

})

router.get("/add-to-cart/:id",VerifyLogin ,(req, res, next) => {
  console.log("enter get method")
  userHelpers
  .addTocart(req.params.id,req.session.user._id)
  .then((response)=>{
    console.log("req.session.user._id")
    res.json({status:true})
  })
  .catch((error)=>{
    console.log("33333333333333333")
    console.log(error.msg)
    res.redirect("/shopsingle")
  })
});

router.get("/addtowishlist/:id",VerifyLogin,(req,res,next)=>{
  console.log(req.params.id)
  console.log("++++++++++")  

  console.log(user)
  userHelpers.addToWishlist(req.params.id,req.session.user._id)
  .then((response)=>{
    res.json(response)
  }).catch((error)=>{
    res.redirect("/login")
  })
})

router.get("/viewWishlist",VerifyLogin,async(req,res)=>{
  const user = req.session.user
  const  cartCount = await userHelpers.getCartCount(req.session.user)
  console.log("11111111111111wish")
  const wishlistProducts = await userHelpers.getWishlist(req.session.user)
  console.log(wishlistProducts)
  

  
  
  res.render("user/wishlist",{wishlistProducts,user,cartCount})
})


router.post("/change-product-quantity", (req, res) => {
  userHelpers.changeProductQuantity(req.body, req.session.user).then();
  res.json({ status: true });
});


router.post("/removeCart", (req, res, next) => {
  console.log("inside post method")
  userHelpers.removeCart(req.body, req.session.user).then(() => {
    res.json({ status: true });
  });
});

router.get('/checkout',async(req,res,next)=>{
  const user= req.session.user
  let cartItems =await userHelpers.getCartProducts(req.session.user._id)
  const totalAmount = await userHelpers.NetTotal(req.session.user._id)     
  const netTotal = totalAmount.nettTotal.total
  const deliveryCharge = await userHelpers.deliverycharge(netTotal) 
  const grandTotal = await userHelpers.grandTotal(netTotal,deliveryCharge) 
  let cartCount = await userHelpers.getCartCount(req.session.user._id)

  
  
  res.render('user/checkout',{user,cartItems,cartCount,netTotal,deliveryCharge,grandTotal})
})

router.post('/place-order',async(req,res)=>{
  console.log("777777777777777") 
  const user=req.session.user
  const cartItem = await userHelpers.getCartProducts(req.session.user._id)
  const totalAmount = await userHelpers.NetTotal(req.session.user._id)
  const netTotal = totalAmount.nettTotal
  const deliveryCharge = await userHelpers.deliverycharge(netTotal)
  const grandTotal = await userHelpers.grandTotal(netTotal.total,deliveryCharge)
  userHelpers.placeOrder(req.body,cartItem,netTotal,deliveryCharge,grandTotal,user)
  .then((response)=>{
    req.session.orderId = response._id

    console.log("2222222222222/22222222222222") 
    if(req.body["paymentMethod"]=="cod"){ 
      res.json({codSuccess:true})
    } 
     else{
      userHelpers.genearteRazorpay(response._id,grandTotal).then((response)=>{

        res.json(response)
      })
     }  
    
  })
})


router.post("/verify-payment",(req,res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    console.log("apyemntttttt")
    userHelpers.changePaymentStatus(req.body["order[receipt]"])
    .then((response)=>{
      console.log("skadsdsada")
      res.json({status:true})
    })  
  })  
    .catch((err)=>{ 
      console.log("djskdjsb")
      res.json({status:false})
    })
}) 
  
router.get("/successPage",async(req,res)=>{
  const user= req.session.user 
 
    res.render("user/ordersuccess",{user})  
  })  
 
 


router.get("/orders",VerifyLogin, async(req,res)=>{
  const user=req.session.user
  const orders = await userHelpers.getUserOrders(req.session.user._id)
  orders.forEach(element=>{
  element.ordered_on = moment(element.ordered_on).format('MMMM Do YYYY, h:mm:ss a')
 })
  res.render("user/orders",{user,orders}) 
})

router.get("/view-order-products/:id",async(req,res)=>{ 
const user = req.session.user
console.log(req.params.id+"params id") 
orderProducts= await userHelpers.OrderDetails(req.params.id)
console.log(orderProducts+"++++++++++++")

res.render("user/detailedOrder",{user,orderProducts})
})


router.post("/cancel-order", (req, res) => {
  userHelper.cancelorder(req.body).then((response) => {
    res.json({ status: true });
  });
});


module.exports = router;
