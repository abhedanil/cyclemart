
const adminData = require("../models/admin")
const db =require("../config/connections")
const bcrypt= require('bcrypt');
const { promise, reject } = require("bcrypt/promises");
const category = require("../models/categories")
const subcategory = require("../models/subcategory")
const brand = require("../models/brands")
const productData =require("../models/products")
const userData = require("../models/user")
const ordermodel = require("../models/order")
const couponmodel = require("../models/coupon")
const carouselmodel= require("../models/carousel")
module.exports={

    doLogin:(adminDaata)=>{
        console.log(adminDaata);
        console.log("flfkk");
        return new Promise(async (resolve,reject)=>{
          let loginstatus=false
          let response = {}
          const admin= await adminData.findOne({ email: adminDaata.email });
          console.log(admin)
          
  
          if(admin)
          {
            console.log(admin);
            console.log(adminDaata.password)
            console.log(admin.password)
            
            bcrypt.compare(adminDaata.password , admin.password).then((status)=>{
              if(status){
                console.log('login success')
                response.admin = admin;
                response.status = true;
                resolve(response);
                console.log(response + "1234")
              }else{
                console.log('login failed');
                reject({status:false, msg:"password not matching"});
  
              }
            });
          }else{
            console.log("login failed");
            reject({status: false, msg: "email not registered,please signup"})
          }       
        })      
      },

      addCategory: (data) => {
        return new Promise(async (resolve, reject) => {
          const categoryNames = data.category;
          console.log(categoryNames,'sfasfasfasfas');
          const categoryOld = await category.findOne({ category: categoryNames });
          if (categoryOld) {
            reject({ status: false, msg: "Category already added!" });
          } 
          else {
            const addCategory = await new category({
              category: categoryNames
            });
            await addCategory.save(async (err, result) => {
              if (err) {
                console.log("category NOT ADDED")
                reject({ msg: "Category not added" });
              } else {
                resolve({ result, msg: "Category added" });
              }
            });
          }
        });
      },
      
      getProducts:()=>{
        return new Promise(async (resolve,reject)=>{
          const allProducts = await productData.find({}).populate('brand').populate('category').populate('subcategory').lean()
          resolve(allProducts)
        })
      },
      
   

      getCategories: () => {
        return new Promise(async (resolve, reject) => {
          const allCategory = await category.find({}).lean();
          resolve(allCategory);
        });
      },

  addSubcategory:(Data)=>{
  return new Promise(async (resolve, reject) => {
    const subcategoryName = Data.subcategory;
    console.log(subcategoryName,'sfasfasfasfas');
    const subcategoryFind = await subcategory.findOne({ subcategory: subcategoryName });
    const categoryFind = await category.findOne({Category: Data.Category})
    
    if (subcategoryFind) {
      reject({ status: false, msg: "Sub-Category already added!" });
    } else {
      const addSubcategory = await new subcategory({
        subcategory: subcategoryName,
        category: categoryFind._id

      });
      await addSubcategory.save(async (err, result) => {
        if (err) {
          reject({ msg: "Sub-Category not added" });
        } else {
          resolve({ result, msg: "sub_Category added" });
        }
      });
    }
  });
},

addProduct:(data,image1,image2,image3,image4)=>{
  return new Promise (async (resolve,reject)=>{
    console.log('in add product');
      const subcategoryData= await subcategory.findOne({subcategory : data.subcategory})
      const brandData = await brand.findOne({brandname: data.brand})
      const categoryData = await category.findOne({category :data.category})
      console.log("subcategory:" + subcategoryData)
      console.log("category:" + categoryData)
      console.log("brandname:" + brandData)
    if(!image2){
      reject({ msg:"upload Image"})
    }
    else{
      const newProduct = await new productData({

        productName:data.productName,
        Price:data.price,
        
        stock:data.stock,
        discount:data.discount,
        description :data.description,
        category: categoryData._id,
        subcategory: subcategoryData._id,
        brand: brandData._id,
        Images: { image1, image2, image3, image4 },

      });
      await newProduct.save(async(err,result)=>{
        if(err){
          console.log(err+"not added")
          reject({ msg : "product can't be added"})
        }
        else{
          resolve({ date: result , msg: "product added succesfully"})
        }
      });
    }
  });
},

getSubcategories:()=>{
  return new Promise (async (resolve,reject)=>{
    const allSubcategory = await subcategory.find({}).lean()
    resolve(allSubcategory)
  })
},

addBrand: (Data) => {
  return new Promise(async (resolve, reject) => { 

      const brandexist = await brand.findOne({BrandName: Data.brand_Name })
      if (brandexist) {
        reject({ status: false, msg: "This Brand already exists!" });
      } else {
        const addBrand = await new brand({
          BrandName: Data.brand_Name,
        });
        await addBrand.save(async (err, result) => {
          if (err) {
            reject({ msg: "Brand can't be added" });
          } else {
            resolve({ result, msg: "New Brand added" });
          }
        });
      }
    });
  },

  getBrands: () => {
    return new Promise(async (resolve, reject) => {
      const brandsData = await brand.find({}).lean()
      resolve(brandsData)
    })
  },
  
  getAllusers:()=>{
    return new Promise(async (resolve,reject)=>{
      let users = await userData.find().lean()
      resolve(users)
    })
  },

  blockUser:(userId)=>{
    console.log(userId)
    return new Promise (async (resolve,reject)=>{
      const user = await userData.findByIdAndUpdate(
        {_id: userId},
        {$set:{block:true}},
        {upsert:true}
        )
        resolve(user)
    })
  },


unBlockUser:(userId)=>{
return new Promise(async(resolve,reject)=>{
  const user = await userData.findByIdAndUpdate(
    {_id: userId},
    {$set:{block: false }},
    {upsert:true}
    )
    resolve(user)
  })
},

deleteProduct:(proId)=>{
    return new Promise(async(resolve,reject)=>{
      const removedProduct = await productData.findByIdAndDelete({_id:proId})
      resolve(removedProduct)
    })
},

editProducts:(data,proId,image1,image2,image3,image4)=>{

  return new Promise(async(resolve,reject)=>{
    console.log("ddsfs")
    const subcategoryData =await subcategory.findOne({
      _id:data.subcategory
    })
    const brandData =await brand.findOne({_id: data.brand})
    const categoryData = await category.findOne({_id: data.category})
    console.log(categoryData)
    const updateProduct =await productData.findByIdAndUpdate(
      {_id: proId},
      {
        $set:{
          productName:data.productName,
        Price:data.price,
        
        stock:data.stock,
        discount:data.discount,
        description :data.description,
        category: categoryData._id,
        subcategory: subcategoryData._id,
        brand: brandData._id,
        Images: { image1, image2, image3, image4 },
        },
      }

    ); resolve({updateProduct,msg:"The product is Edited"})
  })
},

getoneProduct:(data)=>{
  return new Promise(async(resolve,reject)=>{

    const theProduct = await productData.findOne({_id:data}).lean() 
    resolve(theProduct)
  })
},

AddCoupon:(data)=>{
  console.log(data)
return new Promise(async(resolve,reject)=>{
  const  newcoupon = new couponmodel({

    couponName:data.CouponName,
    couponCode:data.CouponCode,
    limit: data.limit,
    discount:data.discount,
    expirydate:data.expirydate

 })
 console.log(newcoupon)
  await newcoupon.save();
  console.log("*******")
  resolve()
  }) 
},

allCarousel:()=>{
  return new Promise(async (resolve, reject) => {
    const allCarousel = await carouselmodel.find({}).lean();
    resolve(allCarousel);
  });
},



addCarousel: (data, image) => {
  return new Promise(async (resolve, reject) => {
    const addCarousel = new carouselmodel({
      CarouselHeading: data.CarouselHeading,
      Sub_heading: data.Subheading,
      Image: image,
    });
    await addCarousel.save();
    resolve();
  });
},
getAllcoupons:()=>{
  return new Promise(async(resolve,reject)=>{

    const allcoupons = await couponmodel.find({}).lean()
    console.log(allcoupons)
    resolve(allcoupons) 
  })

},

deleteCoupon:(proId)=>{
  return new Promise(async(resolve,reject)=>{

    const removecoupon = await couponmodel.findByIdAndDelete({_id:proId})
    resolve(removecoupon)
  })
},

getAllOrders:()=>{

return new Promise (async(resolve,reject)=>{
  const orders = await ordermodel.find({}).populate("products.pro_Id").sort({_id:-1}).lean()
  resolve(orders)
})

},

OrderDetails:(orderid)=>{

return new Promise(async(resolve,reject)=>{

  const orderdetails = await ordermodel.findOne({_id:orderid}).populate("products.pro_Id").lean()
  resolve(orderdetails)
})

},


changeOrderStatus: (data) => {
  console.log(data);
  return new Promise(async (resolve, reject) => {
    const state = await ordermodel.findOneAndUpdate(
      { _id: data.orderId, "products._id": data.proId },
      {
        $set: {
          "products.$.status": data.orderStatus,
        },
      }
    );
    console.log(state, "state");

    resolve();
  }).catch((err) => {
    console.log(err, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
  });
},


salesReport: (data) => {
  let response = {};
  let { startDate, endDate } = data;
  let d1, d2, text;
  if (!startDate || !endDate) {
    d1 = new Date();
    d1.setDate(d1.getDate() - 7);
    d2 = new Date();
    text = "For the Last 7 days";
  } else {
    d1 = new Date(startDate);
    d2 = new Date(endDate);
    text = `Between ${startDate} and ${endDate}`;
  }
  const date = new Date(Date.now());
  const month = date.toLocaleString("default", { month: "long" });
  return new Promise(async (resolve, reject) => {
    let salesReport = await ordermodel.aggregate([
      {
        $match: {
          ordered_on: {
            $lt: d2,
            $gte: d1,
          },
        },
      },
      {
        $match: { payment_status: "placed" },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$ordered_on" },
          total: { $sum: "$grandTotal" },
        },
      },
    ]);
    let brandReport = await ordermodel.aggregate([
      {
        $match: { payment_status: "placed" },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          brand: "$products.productName",
          quantity: "$products.quantity",
        },
      },

      {
        $group: {
          _id: "$brand",
          totalAmount: { $sum: "$quantity" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]);
    // let orderCount = await ordermodel
    //   .find({ date: { $gt: d1, $lt: d2 } })
    //   .count();
    // let totalAmounts = await orderModel.aggregate([
    //   {
    //     $match: { payment_status: "placed" },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalAmount: { $sum: "$grandTotal" },
    //     },
    //   },
    // ]);
    // let totalAmountRefund = await orderModel.aggregate([
    //   {
    //     $match: { status: "Order placed" },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalAmount: { $sum: "$reFund" },
    //     },
    //   },
    // ]);
    response.salesReport = salesReport;
    response.brandReport = brandReport;
    // response.orderCount = orderCount;
    // response.totalAmountPaid = totalAmounts.totalAmount;
    // response.totalAmountRefund = totalAmountRefund.totalAmount;
    resolve(response);
  });
},
}
