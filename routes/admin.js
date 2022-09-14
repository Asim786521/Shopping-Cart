var express = require("express");
var adminHelper = require("../helpers/product-helpers");
var fs = require("fs");
const userHelper = require("../helpers/user-helpers");
var collections = require("../config/collections");
var db = require("../config/connection");
const objectId = require("mongodb").ObjectID;
 
var router = express.Router();

 
var nodemailer = require('nodemailer');

 

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
   user: 'asimasm61@gmail.com',
   pass: 'gkzpmytwxyqcvnjy'
 }
});


const verifySignedIn = (req, res, next) => {
  if (req.session.signedInAdmin) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
};

/* GET admins listing. */
router.get("/", function (req, res, next) {
 
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products,   });
  });
});

router.get("/all-products",  function (req, res) {
 
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
});

// router.get("/signup", function (req, res) {
//   if (req.session.signedInAdmin) {
//     res.redirect("/admin");
//   } else {
//     res.render("admin/signup", {
//       admin: true,
//       signUpErr: req.session.signUpErr,
//     });
//   }
// });

// router.post("/signup", function (req, res) {
//   adminHelper.doSignup(req.body).then((response) => {
//     console.log(response);
//     if (response.status == false) {
//       req.session.signUpErr = "Invalid Admin Code";
//       res.redirect("/admin/signup");
//     } else {
//       req.session.signedInAdmin = true;
//       req.session.admin = response;
//       res.redirect("/admin");
//     }
//   });
// });

// router.get("/signin", function (req, res) {
//   if (req.session.signedInAdmin) {
//     res.redirect("/admin");
//   } else {
//     res.render("admin/signin", {
//       admin: true,
//       signInErr: req.session.signInErr,
//     });
//     req.session.signInErr = null;
//   }
// });

// router.post("/signin", function (req, res) {
//   adminHelper.doSignin(req.body).then((response) => {
//     if (response.status) {
//       req.session.signedInAdmin = true;
//       req.session.admin = response.admin;
//       res.redirect("/admin");
//     } else {
//       req.session.signInErr = "Invalid Email/Password";
//       res.redirect("/admin/signin");
//     }
//   });
// });

// router.get("/signout", function (req, res) {
//   req.session.signedInAdmin = false;
//   req.session.admin = null;
//   res.redirect("/admin");
// });

router.get("/add-product",  function (req, res) {
  
  res.render("admin/add-product", { admin: true,   });
});

router.post("/add-product", function (req, res) {
  adminHelper.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id",  async function (req, res) {
 
  let productId = req.params.id;
  let product = await adminHelper.getProductDetails(productId);
  console.log(product);
  res.render("admin/edit-products", { admin: true, product  });
});

router.post("/edit-product/:id", async function (req, res) {
  let productId = req.params.id;
   console.log(req.body.Price)
   
  let product = await adminHelper.getProductDetails(productId);

      // var user=  db.get()
      //  .collection(collections.USERS_COLLECTION).findOne()
  
 
    
 if(req.body.Price>product.Price){
 var mailOptions = {
   
    from: 'asimasm61@gmail.com',
    to:  'asimsalim749@gmail.com ,asimachu345@gmail.com',
    subject: 'Cart price Alert',

 
    text:'Price of '+req.body.Name+ ' increased to ₹'+req.body.Price
    
  };
 }else {
  
  var mailOptions = {
   
    from: 'asimasm61@gmail.com',
    to:  'asimsalim749@gmail.com ,asimachu345@gmail.com',
    subject: 'Product price Alert',

 
    text:'Price of '+req.body.Name+ ' dropped to ₹'+req.body.Price
    
  };
 }
   
 transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Price changed to ' + info.response);
  }
});

  adminHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/product-images/" + productId + ".jpg");
      }
     
    }
   
    res.redirect("/admin");
  });
});

router.get("/delete-product/:id",   function (req, res) {
  let productId = req.params.id;
  adminHelper.deleteProduct(productId).then((response) => {
    console.log("Product deleted")
    // fs.unlinkSync("./public/product-images/" + productId + ".jpg");
    res.redirect("/admin");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  adminHelper.deleteAllProducts().then(() => {
    res.redirect("/admin/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/all-users", { admin: true, administator, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  adminHelper.removeUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  adminHelper.removeAllUsers().then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let orders = await adminHelper.getAllOrders();
  res.render("admin/all-orders", {
    admin: true,
    administator,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let administator = req.session.admin;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("admin/order-products", {
      admin: true,
      administator,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  adminHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  adminHelper.cancelOrder(orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  adminHelper.cancelAllOrders().then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.searchProduct(req.body).then((response) => {
    res.render("admin/search-result", { admin: true, administator, response });
  });
});


module.exports = router;
