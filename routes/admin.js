var express = require('express');
const { response } = require('../app');
const adminHelpers = require('../helpers/adminHelpers');
var router = express.Router();
const user = require("../models/user")
const products = require("../models/products")
const Storage = require("../middleware/multer");
const subcategory = require('../models/subcategory');
const { fields } = require('../middleware/multer');
const userHelpers = require('../helpers/userHelpers');
const moment = require('moment')

/* GET users listing. */


const VerifyLogin = (req,res,next)=>{
  if(req.session.adminLogged){
    next()
  } 
  else{
    res.redirect("/admin")
  }
}

router.get("/", function (req, res, next) {
  if (req.session.adminLogged) {
    res.redirect("/admin/adminPage")
  } else {
    res.render("admin/adminLogin", { layout: "adminlayout", loginPage: true, loggErr: req.session.loggedInError })
  }
  req.session.loggedInError = null;
});

router.get("/adminPage", function (req, res) {
  if (req.session.adminLogged) {
    res.render("admin/adminDash", { layout: "adminlayout" })
  }

})

router.post("/adminlogin1", function (req, res) {
  adminHelpers.doLogin(req.body).then((response) => {
    console.log("entered dologinn")
    if (response.admin) {
      req.session.adminLogged = true;
      req.session.admin = response.admin;
      console.log("hai")
      res.redirect("/admin/adminPage")
    }
    else {
      res.render("/adminLogin", { layout: "adminLayout", loginpage: true })
    }
  }).catch((err) => {
    req.session.logInError = err.msg;
    res.redirect("/admin",)
  })
})


router.get("/addcategory",VerifyLogin, (req, res) => {
  adminHelpers.getCategories().then((allCategory) => {
    res.render("admin/addCategory", { allCategory, layout: "adminlayout" })
  });
  // res.render("admin/addCategory",{layout:"adminlayout",Caterr:req.session.loggC})
  // req.session.loggC = null;

})

router.get("/")


router.get("/addProducts",VerifyLogin, async (req, res) => {
  const category = await adminHelpers.getCategories();
  const BrandName = await adminHelpers.getBrands();
  const subcategory = await adminHelpers.getSubcategories();

  res.render("admin/addProduct", {
    category,
    subcategory,
    BrandName,
    layout: "adminlayout"
  });
});

router.post("/addProducts", Storage.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]),
  (req, res) => {
    console.log(req.body)
    console.log(req.files)

    const img1 = req.files.image1[0].filename;
    const img2 = req.files.image1[0].filename;
    const img3 = req.files.image1[0].filename;
    const img4 = req.files.image1[0].filename;
    console.log(img1, img2, img3, img4)

    adminHelpers
      .addProduct(req.body, img1, img2, img3, img4)
      .then((response) => {
        console.log(response);
        req.flash("msg", "Product Added Successfully");
        res.redirect("/admin/addProducts");
      })
      .catch((err) => {
        req.session.logp = err.msg
        console.log(req.session.logp)
        res.redirect("/admin/addProducts")
      })
  })

  router.post("/getData", async (req, res) => {
    const date = new Date(Date.now());
    const month = date.toLocaleString("default", { month: "long" });
    adminHelpers.salesReport(req.body).then((data) => {
      // let pendingAmount = data.pendingAmount;
      let salesReport = data.salesReport;
      let brandReport = data.brandReport;
      // let orderCount = data.orderCount;
      // let totalAmountPaid = data.totalAmountPaid;
      // let totalAmountRefund = data.totalAmountRefund;
       console.log(month._id)
      let dateArray = [];
      let totalArray = [];
      salesReport.forEach((s) => {
        dateArray.push(`${month}-${s._id} `);
        totalArray.push(s.total);
      });
      console.log(salesReport)
      let brandArray = [];
      let sumArray = [];
      brandReport.forEach((s) => {
        brandArray.push(s._id);
        sumArray.push(s.totalAmount);
      });
      res.json({
        // totalAmountRefund,
        dateArray,
        totalArray,
        brandArray,
        sumArray,
        // orderCount,
        // totalAmountPaid,
        // pendingAmount,
      });
    });
  });

router.post("/AddCategory", (req, res) => {
  console.log(req.body);
  console.log("category log");
  adminHelpers
    .addCategory(req.body)
    .then((response) => {
      res.redirect("/admin/addcategory");
    })
    .catch((err) => {
      req.session.loggC = err.msg;
      console.log(req.session.loggC);
      res.redirect("/admin/addcategory");
    });
});
router.post("/AddSubcategory", (req, res) => {
  console.log(req.body);
  console.log("subcategory log");
  adminHelpers
    .addSubcategory(req.body)
    .then((response) => {
      res.redirect("/admin/addcategory");
    })
    .catch((err) => {
      req.session.loggSc = err.msg;
      console.log(req.session.loggSc);
      res.redirect("/admin/addcategory");
    });
});

router.post("/AddBrands", (req, res) => {
  console.log(req.body);
  console.log("hfdajshfjhasg");
  adminHelpers
    .addBrand(req.body)
    .then((response) => {
      res.redirect("/admin/addcategory");
    })
    .catch((err) => {
      req.session.loggE = err.msg;
      console.log(req.session.loggE);
      res.redirect("/admin/addcategory");
    });
});

router.post("/addCategory", (req, res) => {
  console.log(req.body);
  console.log("category log");
  adminHelpers
    .addCategory(req.body)
    .then((response) => {
      res.redirect("/admin/addBrands");
    })
    .catch((err) => {
      req.session.loggC = err.msg;
      console.log(req.session.loggC);
      res.redirect("/admin/addbrands");
    });
});


router.get("/viewProducts",VerifyLogin, async (req, res) => {
  const products = await adminHelpers.getProducts()
  const brands = await adminHelpers.getBrands()
  const categories = await adminHelpers.getCategories()
  const subcategories = await adminHelpers.getSubcategories()
  console.log(products)
  // const alert = req.flash("msg")
  res.render("admin/viewProducts", {
    layout: "adminlayout",
    products,
    brands,
    categories,
    subcategories,
    // alert
  })


})


router.get("/deleteProducts/:id",VerifyLogin, (req, res) => {
  console.log("hai")
  console.log(req.params.id + 'inside delete method')
  const proId = req.params.id
  adminHelpers.deleteProduct(proId).then((response) => {

    req.session.removedProduct = response;
    res.redirect("/admin/viewProducts")
  })
})


router.get("/editProduct/:id",VerifyLogin, async (req , res) => {

  console.log("hai")
  const product = await adminHelpers.getoneProduct(req.params.id)
  console.log(product._id)
  const brands = await adminHelpers.getBrands();
  const categories = await adminHelpers.getCategories();
  const subcategories = await adminHelpers.getSubcategories();
  console.log("++++++++++++++++++++++++++++++++++++++++++++")
  res.render("admin/editProductss", { product, brands, categories, subcategories, layout: "adminlayout" })
  console.log("---------------------------------------------")
})

router.post("/editProducts/:id", Storage.fields([
  
  { name: "image1", maxcount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]), (req, res) => {
  {
    console.log("entered post method")
    const proId = req.params.id
    console.log(proId, "id")
    const img1 = req.files.image1 ? req.files.image1[0].filename : req.body.image1;
    const img2 = req.files.image2 ? req.files.image2[0].filename : req.body.image2;
    const img3 = req.files.image3 ? req.files.image3[0].filename : req.body.image3;
    const img4 = req.files.image4 ? req.files.image4[0].filename : req.body.image4;

    console.log(proId,img1, img2, img3, img4);
    adminHelpers.editProducts(req.body, proId, img1, img2, img3, img4)
      .then((response) => {
        console.log("response :" + response);
        // req.flash("msg", response.updateproduct.Product_Name, response.msg)
        res.redirect("/admin/viewProducts")
      })
  }
}
)
router.get("/CarouselManagement",VerifyLogin,async(req,res)=>{
  Carousel = await adminHelpers.allCarousel()

  res.render("admin/CarouselManagement",{layout:"adminlayout",Carousel})
})

router.get("/addCarousel",VerifyLogin,(req,res)=>{
  res.render("admin/addCarousel",{layout:"adminlayout"})
})

router.get("/userManage",VerifyLogin,(req,res)=>{
  adminHelpers.getAllusers().then((user)=>{
    res.render("admin/userManage",{layout:"adminlayout", user})
  })
})

router.post(
  "/AddCarousel",
  Storage.fields([{ name: "image1", maxCount: 1 }]),
  (req, res) => {
    const img1 = req.files.image1[0].filename;
    adminHelpers.addCarousel(req.body, img1).then(() => {
      res.redirect("/admin/CarouselManagement");
    });
  }
);

router.get("/blockUser/:id",VerifyLogin,(req,res)=>{
  console.log("entereed +++++++++++++++")
const proId = req.params.id
console.log(proId)
console.log("-----------------")
adminHelpers.blockUser(proId).then((response)=>{
  res.json({status:true})
})
})

router.get("/unBlockUser/:id",VerifyLogin,(req,res)=>{
  const proId =req.params.id
  adminHelpers.unBlockUser(proId).then((response)=>{
    res.json({status: true})
  })
})

router.get("/manageOrders",VerifyLogin,async(req,res)=>{

  const orders = await adminHelpers.getAllOrders()

    orders.forEach((element)=>{
      element.ordered_on = moment(element.ordered_on).format('MMMM Do YYYY, h:mm:ss a')
     })
  

  res.render("admin/viewOrders",{layout:"adminlayout",orders})
})

router.get("/viewordersinorder/:id",VerifyLogin,async(req,res)=>{ 

  orderProducts= await adminHelpers.OrderDetails(req.params.id)
  console.log(orderProducts+"++++++++++++")

  res.render("admin/ordersinorder",{layout:"adminlayout",orderProducts})
})

router.post('/changeOrderStatus',(req,res)=>{
  console.log(req.body)
  console.log('inside change')
  adminHelpers.changeOrderStatus(req.body).then((response)=>{
    res.redirect('/admin/manageOrders')
  })
})



router.get("/addCoupon",VerifyLogin,(req,res)=>{

  res.render("admin/addCoupon",{layout:"adminlayout"})
})

router.post("/add-coupon",(req,res)=>{ 
  console.log("++++++++++")

  console.log(req.body)
  adminHelpers.AddCoupon(req.body)
  .then(()=>{ 
    
    res.redirect("/admin/addCoupon")  
  })
})  
router.get("/viewCoupons",VerifyLogin,(async(req,res)=>{
    const allcoupons = await adminHelpers.getAllcoupons()
  
    console.log(allcoupons)
    
    res.render("admin/viewCoupons",{allcoupons,layout:"adminlayout"}) 
}))
 
router.get("/deleteCoupons/:id",VerifyLogin,(req,res)=>{
    console.log("************")
    console.log(req.params.id) 
  
    adminHelpers.deleteCoupon(req.params.id).then((response)=>{
      console.log("1000000000001")
      res.redirect("/admin/viewCoupons")
    })

})

router.get("/logout",VerifyLogin, function (req, res) {
  req.session.destroy(() => {
    res.redirect("/admin")
  })
}) 


module.exports = router
 