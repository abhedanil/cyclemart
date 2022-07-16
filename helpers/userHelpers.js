var db = require('../config/connections')
const userData=require('../models/user')
var nodeMailer=require('nodemailer')
const bcrypt= require('bcrypt')
const async = require("hbs/lib/async");
const { reject } = require("bcrypt/promises");
const req = require("express/lib/request");
const User = require('../models/user');
const productData =require("../models/products")
const category = require("../models/categories")
const subcategory = require("../models/subcategory")
const cart = require("../models/cart");
const ordermodel =require("../models/order")
const wishlistmodel = require("../models/wishlist")
const couponmodel = require("../models/coupon")
const carouselmodel= require("../models/carousel")
const Razorpay = require('razorpay');
require("dotenv").config();
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY,
});
const { response } = require('express');
const { default: mongoose } = require('mongoose');

module.exports={
    doSignup:(doData)=>{
        return new Promise(async (resolve,reject)=>{
            const user = await userData.findOne({email: doData.email});
            if(user){
                reject({status:false,msg:"email already taken"});
            }else{
                doData.password = await bcrypt.hash(doData.password, 10);
                const otpGenerator = Math.floor(1000+Math.random()*9000)
                const newUser = {
                    firstname:doData.firstname,
                    lastname:doData.lastname,
                    email:doData.email,
                    password:doData.password,
                    otp:otpGenerator,
                }
                console.log(newUser)
                if (newUser) {
                    try {
                      const mailTransporter = nodeMailer.createTransport({
                        host: "smtp.gmail.com",
                        service: "gmail",
                        port: 465,
                        secure: true,
                        auth: {
                          user: process.env.NODEMAILER_USER,
                          pass: process.env.NODEMAILER_PASS,
                        },
                        tls: {
                          rejectUnauthorized: false,
                        },
                      });
          
                      const mailDetails = {
                        from: process.env.NODEMAILER_USER,
                        to: doData.email,
                        subject: "cyclemart signup verification",
                        text: "just random texts ",
                        html: "<p>hi " + doData.firstname + "   your otp  " + otpGenerator + "",
                      };
                      mailTransporter.sendMail(mailDetails, (err, Info) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log("email has been sent ", Info.response);
                        }
                      });
                    } catch (error) {
                      console.log(error.message);
                    }
                  }
                  resolve(newUser)
            
            }
        })
    },
    doLogin:(userDaata)=>{
      console.log(userDaata);
      console.log("flfkk");
      return new Promise(async (resolve,reject)=>{
        let loginstatus=false
        let response = {}
        const user= await User.findOne({ email: userDaata.email });
        
        

        if(user)
        {
          if(user.block){
            reject({status:true, msg:"your account has been blocked"})
          }
          else{
            console.log(user);
            console.log(userDaata.password)
            console.log(user.password)
          
             bcrypt.compare(userDaata.password, user.password).then((status)=>{
            if(status){
              console.log('login success')
              response.user = user;
              response.status = true;
              resolve(response);
              console.log(response + "1234")
            }else{
              console.log('login failed');
              reject({status:false, msg:"password not matching"});

            }
          });
        }}
        else{
          console.log("login failed");
          reject({status: false, msg: "email not registered,please signup"})
        }       
      })      
    },

    getAllProducts:()=>{
      console.log('in get all products');
      return new Promise(async(resolve,reject)=>{
        console.log('inside rs');
        const allproducts = await productData.find({}).populate('category').populate('subcategory').limit(10).lean();
        resolve(allproducts)
      })
    },

    getProductsForShop:()=>{
      return new Promise(async(resolve,reject)=>{
        console.log('inside rs');
        const allproducts = await productData.find({}).populate('category').populate('subcategory').lean();
        resolve(allproducts)
      })
    },

    getAllCategory:()=>{
      return new Promise(async(resolve,reject)=>{
          const allCategory=await category.find({}).lean()
          console.log(allCategory+'5555555555555555555555555555555555555');
          resolve(allCategory);
      })
  }, 

  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      const AllCoupons = await couponmodel.find({}).lean();
      resolve(AllCoupons);
    });
  }, 

  validateCoupon: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data.coupon);
      console.log(data.total);
      console.log(data.DeliveryCharges);
      obj = {};
      const coupon = await couponmodel.findOne({ couponCode: data.coupon });
      if (coupon) {
        if (coupon.limit > 0) {
          checkUserUsed = await couponmodel.findOne({
            couponCode: data.coupon,
            usedUsers: { $in: [userId] },
          });
          if (checkUserUsed) {
            obj.couponUsed = true;
            obj.msg = " You Already Used A Coupon";
            console.log(" You Already Used A Coupon");
            resolve(obj);
          } else {
            let nowDate = new Date();
            date = new Date(nowDate);
            if (date <= coupon.expirydate) {
              await couponmodel.updateOne(
                { couponCode: data.coupon },
                { $push: { usedUsers: userId } }
              );
              await couponmodel.findOneAndUpdate(
                { couponCode: data.coupon },
                { $inc: { limit: -1 } }
              );
              let total = parseInt(data.total);
              let percentage = parseInt(coupon.discount);
              let discoAmount = ((total * percentage) / 100).toFixed();
              obj.discoAmountpercentage = percentage;
              obj.total = total - discoAmount;
              obj.success = true;
              resolve(obj);
            } else {
              obj.couponExpired = true;
              resolve(obj);
            }
          }
        } else {
          obj.couponMaxLimit = true;
          resolve(obj);
        }
      } else {
        obj.invalidCoupon = true;
        resolve(obj);
      }
    });
  },

  getSubcategories:()=>{
    return new Promise (async (resolve,reject)=>{
      const allSubcategory = await subcategory.find({}).lean()
      resolve(allSubcategory)
    })
  },
  

    getShop:()=>{
      return new Promise(async(resolve,reject)=>{
        let data ={}
        data.products = await productData.find({}).populate('category').populate('subcategory').lean()
        data.category = await category.find({}).lean()
        data.allsubcategory = await subcategory.find({}).limit(3).lean();
        console.log(data)
        resolve(data);

    })
  },



    getSingleProduct:(data)=>{
      return new Promise(async(resolve,reject)=>{
    
      await productData.findOne({_id:data}).populate("category").populate("subcategory").populate("brand").lean().then((product)=>{
        resolve(product)
        })
       
      })
    },

     addTocart: (proId, userId) => {
      return new Promise(async (resolve, reject) => {
        const userCart = await cart.findOne({ user_Id: userId });
        const product = await productData.findById({ _id: proId });
        if (userCart) {
          let proExist = userCart.products.findIndex(
            (products) => products.pro_Id == proId);
            
          if (proExist != -1) {
            console.log('0000000000000000000000000000000000000000000000000000')
            console.log(proExist);
            cart
              .updateOne(
                { "products.pro_Id": proId, user_Id: userId },
                {
                  $inc: { "products.$.quantity": 1 },
                } 
              )
              .then((response) => {
                console.log(response)
                console.log("11111111111111111111111");
                resolve();
              }).catch((err)=>{
                console.log('000000000000000000000000000000')
                console.log(err)
              })
          } else {
            await cart
              .findOneAndUpdate(
                { user_Id: userId },
                { $push: { products: { pro_Id: proId, Price: product.Price,productName: product.productName} } }
              )
              .then(async (res) => {
                resolve({ msg: '"Added", count: res.product.length + 1 ' });
              });
          }
        } else {
          const newcart = new cart({
            user_Id: userId,
            products: { pro_Id: proId, Price: product.Price ,productName: product.productName},
          });
          await newcart.save((err, result) => {
            if (err) {
              resolve({ error: "cart not created" });
            } else {
              resolve({ msg: "cart created", count: 1 });
            }
          });
        }
      });
    },
      
    addToWishlist:(proId,userid)=>{
      console.log("**********")

      return new Promise(async(resolve,reject)=>{
        const userExist = await wishlistmodel.findOne({user_Id:userid})
        if(userExist){
           const proExist = userExist.products.findIndex(
            (products)=> products.pro_Id == proId
           )
           if(proExist != -1){
              resolve({err:"product already in wishlist"})
           }
           else{
            await wishlistmodel.findOneAndUpdate(
              {user_Id:userid},{$push:{products:{pro_Id:proId}}}
            )
            resolve({msg:"added"})
           }
        }
        else{
          const newWishlist = new wishlistmodel({
            user_Id:userid,
            products:{pro_Id:proId}
          });
          await newWishlist.save((err, result)=>{
            if(err){
              resolve({msg:"not added to wishlist"})
            }
            else{
              resolve({msg:"wishlist created"})
            }
          })
        }
      })
    },
  
    getWishlist:(userid)=>{

      return new Promise(async(resolve,reject)=>{
          const wishlist = await wishlistmodel.findOne(
            {user_Id:userid}).populate("products.pro_Id").lean()
            console.log(wishlist)
            console.log("************")
            resolve(wishlist)
            console.log("**********")
          
      })

    },

    deletewishlist:()=>{

    return new Promise(async (resolve, response) => {
      const remove = await wishlistmodel.updateOne(
        { user_id: user },
        { $pull: { products: { pro_Id: proId } } }
      );
      resolve({ msg: "comfirm delete" });
    });
  },

    getCartProducts:(userId)=>{
      
      console.log(userId)
      return new Promise(async(resolve,reject)=>{
        let cartItem = await cart.findOne({user_Id: userId}).populate("products.pro_Id").lean()       
        console.log(cartItem);
        resolve(cartItem)
        
      })
    },

    getCartCount:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let Count= 0
        let user =await cart.findOne({user_Id : userId})
        if(user){
          Count = user.products.length
        }
        resolve(Count)
      })
    },

   

    subTotal:(user)=>{
      let id= mongoose.Types.ObjectId(user)
      return new Promise(async(resolve,reject)=>{
        const amount = await cart.aggregate([
          {$match:{user_Id:id}},
          {$unwind:"$products"},
          {$project:{
              id:"$products.pro_Id",
              total: { $multiply: ["$products.Price","$products.quantity"]}
            
          }}
        ])
    
        let cartData =await cart.findOne({user_Id:id})
        if(cartData){
          amount.forEach(async(amt)=>{
            await cart.updateMany(
              {"products.pro_Id":amt.id},
              {$set:{"products.$.subTotal": amt.total}}
            )
          })
          resolve() 
        }
      })

    },
    NetTotal:(userData)=>{
      
      const id=mongoose.Types.ObjectId(userData)
      return new Promise(async(resolve,reject)=>{
        const total = await cart.aggregate([
          {$match:{user_Id:id},},
          {$unwind:'$products'},
          {$project:{quantity:'$products.quantity',Price:'$products.Price'}},
          {$group:{_id:null,
                  total:{$sum:{$multiply:['$quantity','$Price']}}
          }}
        ])
      
        console.log("total amount");
        if(total.length ==0){
       resolve({status:true})
        }else{
          let nettTotal=total.pop();
    
         
        resolve({nettTotal,status:true}) 
      }
      })
    
    },

    deliverycharge:(amount)=>{
      return new Promise ((resolve,reject)=>{
        if(amount<2000){
          resolve(0)
        }
        else{
          resolve(500)
        }
  
      })
    },
    grandTotal:(netTotal,deliveryCharge)=>{
      return new Promise((resolve,reject)=>{
        const grandTotal = netTotal+deliveryCharge
        resolve(grandTotal)
        console.log(grandTotal)
      })
    },

    changeProductQuantity:(data, user)=>{
      console.log('skk ');
    // cartid= data.cartid;
    console.log(data)
    cart_id=data.cartid
    proId= data.product;
    quantity= parseInt(data.quantity);
  
    price= parseInt(data.price)
    const procount = parseInt(data.count);
    console.log(procount+"**********procount");
    console.log(data.quantity)
      return new Promise(async(resolve,response)=>{
       
     
      if(data.count==-1&&data.quantity==1){
     
        console.log(user._id)
        await cart.findOneAndUpdate({ user_Id : user._id},
          {$pull:{products:{_id:cart_id}}})
          .then((response)=>{
            resolve({removeProduct:true})
          })
      }else{  
        console.log("-------------------------------")
        await cart.findOneAndUpdate(
          {user_Id: user._id,"products.pro_Id":data.product},
          {$inc:{"products.$.quantity":procount}})
          .then((response)=>{
            resolve(true)
          })
        }
      })
    },

    removeCart:(data,user)=>{
      console.log(user, "data")
      return new Promise(async(resolve,reject)=>{
     
    await cart.findOneAndUpdate({ user_Id:user._id},
  
      {
      
        $pull:{products:{_id:data.cartid } } 
      }).then((response)=>{ 
        console.log("product removed")
        resolve({removeProduct:true}) 
      })  
    })
  },
  placeOrder:(order,CartItems,netTotal,deliveryCharge,grandTotal,user)=>{
   const mainTotal= parseInt(order.mainTotal)
   console.log(order.mainTotal)
    return new Promise(async(resolve,reject)=>{
      // let id=mongoose.Types.ObjectId(user._id)
      const status = order.paymentMethod==='cod'?'placed':'pending'
      
      const orderObj =await ordermodel({
        user_Id:user._id,
        paymentMethod:order.paymentMethod,
        Total:netTotal.total,
        ShippingCharge:deliveryCharge,
        grandTotal:order.mainTotal,
        coupondiscountedPrice: order.discountedPrice,
        couponPercent: order.discoAmountpercentage,
        couponName: order.couponName,
        ordered_on:new Date(),
        payment_status:status,
        products:CartItems.products,
        deliveryDetails:{
            name:order.fname,
            number:order.phone,
            email:order.email,
            house:order.homeaddress,
            locality:order.locality,
            city:order.cityname,  
            district:order.districtname, 
            state:order.statename,
            country:order.countryname,
            pincode:order.pincode
        }
      })
      await orderObj.save(async(err,res)=>{
        await cart.remove({user:order.userId})
         resolve(orderObj); 
       })    
    })
  },



    getUserOrders:(userId)=>{

      return new Promise(async(resolve,reject)=>{

        const orders= await ordermodel.find({user_Id:userId}).sort({_id:-1}).lean()
        console.log("---------------------")
        console.log(orders+"---------------------")
        resolve(orders)
      })



    },

    OrderDetails:(orderid)=>{
      console.log("................")
      console.log(orderid+"5555555")

      return new Promise(async(resolve,reject)=>{

        const orderdetails = await ordermodel.findOne({_id:orderid}).populate("products.pro_Id").lean()
        console.log(orderdetails+"orderdetailsssss")
        resolve(orderdetails)
      })  

    },

    genearteRazorpay:(orderId,grandTotal)=>{

      return new Promise((resolve,reject)=>{
        var options = {
          amount: grandTotal*100,  // amount in the smallest currency unit
          currency: "INR",
          receipt: ""+orderId
        };
        instance.orders.create(options, function(err, order) {
          console.log(order);
          resolve(order)
        });
        
    })
  },

  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
    const crypto = require("crypto");
    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY)
    hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
    hmac=hmac.digest('hex')
    if(hmac==details['payment[razorpay_signature]']){
      console.log("*******")
      resolve()
    }
    else{
      reject()
    }
  })
  },
  changePaymentStatus:(orderId)=>{
    console.log(orderId) 
    return new Promise(async(resolve,reject)=>{
      const changestatus= await ordermodel.findOneAndUpdate(
        {_id:orderId},{$set:{payment_status:'placed'}})
        .then((changestatus)=>{
          resolve(changestatus)
        })

    })

  },

    doresetPasswordOtp: (resetData) => {
      return new Promise(async (resolve, reject) => {
        const user = await userData.findOne({ email: resetData.email });
        
        console.log(user);
        if (user) {
          // resetData.password = await bcrypt.hash(resetData.password, 10);
  
          const otpGenerator = await Math.floor(1000 + Math.random() * 9000);
          const newUser = await {            
            email: resetData.email,
            otp: otpGenerator,
            _id:user._id
            
          };
          console.log(newUser);
  
          try {
            const mailTransporter = nodeMailer.createTransport({
              host: "smtp.gmail.com",
              service: "gmail",
              port: 465,
              secure: true,
              auth: {
                user:  process.env.NODEMAILER_USER,
                pass:   process.env.NODEMAILER_PASS,
              },
              tls: {
                rejectUnauthorized: false,
              },
            });
  
            const mailDetails = {
              from: process.env.NODEMAILER_USER,
              to: resetData.email,
              subject: "just testing nodemailer",
              text: "just random texts ",
              html: "<p>Hi " + "user, " + "your otp for resetting Toycart account password is " + otpGenerator+".",
            };
            mailTransporter.sendMail(mailDetails, (err, Info) => {
              if (err) {
                console.log(err);
              } else {
                console.log("email has been sent ", Info.response);
              }
            });
          } catch (error) {
            console.log(error.message);
          }
  
          resolve(newUser);
  
  
        } else {
          reject({ status: false, msg: "Email not registered, please sign up!" });
        }
      });
    },

   
  cancelorder:(data)=>{
    orderId = mongoose.Types.ObjectId(data.orderId);
    proId = mongoose.Types.ObjectId(data.proId);
    console.log("print")
    console.log(orderId+"orderId")
    console.log(proId+"proId")
    const status = "Cancelled";
    return new Promise(async(resolve,reject)=>{
      const cancelorder = await ordermodel.updateMany(
        {_id:orderId,"products._id":proId},
        {$set:
          {
            "products.$.status":status,
            "products.$.orderCancelled":true,
          }}
      )
      resolve()
    })
    },
  
doresetPass:(rData,rid)=>{
  console.log(rData);
  return new Promise(async(resolve,reject)=>{
    let response={};
    rData.password=await bcrypt.hash(rData.password,10);
    console.log(rData.password+"11")
    console.log(userData.email+"aa")
    let userId=rid
    console.log(userId+"21")
    let resetuser=await userData.findByIdAndUpdate({_id:userId},
      
      {$set:{password:rData.password}})
      resolve(resetuser)

    })
},
 
userdetails:(userid)=>{
  return new Promise(async(resolve,reject)=>{
    usersprofile= await User.findOne({}).lean()
    resolve(usersprofile)
  })
},

addAddress:(data,userId)=>{
  return new Promise(async (resolve, reject) => {
    const user = User.findOne({ _id: userId });
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          address: {
            fname: data.fname,
            lname: data.lname,
            house: data.house,
            towncity: data.towncity,
            district: data.district,
            state: data.state,
            pincode: data.pincode,
            email: data.email,
            mobile: data.mobile,
          },
        },
      }
    );
    resolve();
  });
},

getAddresses: (userId) => {
  return new Promise(async (resolve, response) => {
    const Addresses = await User.findOne({ _id: userId }).lean();
    resolve(Addresses);
  });
},

getAddress:(addressId,userId)=>{
  addressId = mongoose.Types.ObjectId(addressId);
  userId = mongoose.Types.ObjectId(userId);
  return new Promise(async(resolve,reject)=>{
    const address= await User.aggregate([
      {$match: {_id:userId} },
      {$unwind: "$address" },
      {$match:{"address._id":addressId}},
      {$project:{address:1,_id:0}}
    ])
    console.log(address)
    resolve(address)
  })
},

getCarousel: () => {
  return new Promise(async (resolve, reject) => {
    const Carousel = carouselmodel.find().sort({ _id: -1 }).limit(3).lean();
    console.log(Carousel)
    resolve(Carousel);
  });
}


}
