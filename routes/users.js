 
var express = require('express');
var router = express.Router();
  
const userHelpers = require('../helpers/user-helpers');
const VerifyLogin=((req,res,next)=>{
    if(req.session.loggedIn){
        next();
    }else{
        res.redirect('/login')
    }
});
 
  

/* GET users listing. */
router.get('/',  async function(req, res, next) {
    let user=req.session.user

    let cartCount=null;
        if( user){
           cartCount=await userHelpers.getCartCount(req.session.user._id)
        
        }
    userHelpers.getAllProducts().then((products)=>{
      
         
       
          res.render('user/index', { admin:false,products,cartCount})
      
        })
 
});


router.get('/login', (req,res)=>{

    if(req.session.loggedIn){
        res.render('/');
    }else{

    res.render("user/login",{'loginErr':req.session.LoginError});
    }

    
});

router.get('/signup',(req,res)=>{
    res.render("user/signup")
});

 router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
        console.log(response)
    })
 });

 router.post('/login',(req,res)=>{
     userHelpers.doSignin(req.body).then((response)=>{
         console.log(response)
         if(response.status){
             req.session.loggedIn=true;
             req.session.user=response.user
             res.redirect('/')
         }else{

            req.session.LoginError='Invalid Name or Password'
             res.redirect('login')
         }
     })
 })

 router.get('/logout',(req,res)=>{
     req.session.destroy()
     res.redirect('/')
 });
 router.get('/cart', VerifyLogin,async(req,res)=>{
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelpers.getCartCount(userId);
    let cartProducts = await userHelpers.getCartProducts(userId);
    let total = null;
    if (cartCount != 0) {
      total = await userHelpers.getTotalAmount(userId);
    }
    res.render("user/cart", {
      admin: false,
      user,
      cartCount,
      cartProducts,
      total,
    });
 
   
 })
 router.get('/add-to-Cart/:id',VerifyLogin,(req,res)=>{
    console.log('api call' );
  
     userHelpers.addToCart(req.params.id,req.session.user._id).then(( )=>{
         res.json({status:true})
   
   
     })
   
  });
  router.post("/change-product-quantity", function (req, res) {
    console.log(req.body);
    userHelpers.changeProductQuantity(req.body).then((response) => {
      res.json(response);
    });
  });
  router.post("/remove-cart-product", (req, res, next) => {
    userHelpers.removeCartProduct(req.body).then((response) => {
      res.json(response);
    });
  });
  router.get("/place-order",  VerifyLogin, async (req, res) => {
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelpers.getCartCount(userId);
    let total = await userHelpers.getTotalAmount(userId);
    res.render("user/place-order", { admin: false, user, cartCount, total });
  });
  
  router.post("/place-order",VerifyLogin, async (req, res) => {
    let user = req.session.user;
    let products = await userHelpers.getCartProductList(req.body.userId);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers
      .placeOrder(req.body, products, totalPrice, user)
      .then((orderId) => {
        if (req.body["payment-method"] === "COD") {
          res.json({ codSuccess: true });
          console.log("COD Choosed")
        } else {
          userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
            res.json(response);
          });
        }
      });
      
  });
  
  router.post("/verify-payment", async (req, res) => {
    console.log(req.body);
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        userHelpers.changePaymentStatus(req.body['receipt']).then(() => {
          console.log("Payment Sucess")
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err)
        res.json({ status: false, errMsg: "Payment Failed" });
      });
  });
  
  router.get("/order-placed", VerifyLogin, async (req, res) => {
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelpers.getCartCount(userId);
    res.render("user/order-placed", { admin: false, user, cartCount });
  });
  
  router.get("/orders", VerifyLogin, async function (req, res) {
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelpers.getCartCount(userId);
    let orders = await userHelpers.getUserOrder(userId);
    res.render("user/orders", { admin: false, user, cartCount, orders });
  });
  
  router.get(
    "/view-ordered-products/:id",
    VerifyLogin,
    async function (req, res) {
      let user = req.session.user;
      let userId = req.session.user._id;
      let cartCount = await userHelpers.getCartCount(userId);
      let orderId = req.params.id;
      let products = await userHelpers.getOrderProducts(orderId);
      res.render("user/order-products", {
        admin: false,
        user,
        cartCount,
        products,
      });
    }
  );
  
  router.get("/cancel-order/:id", VerifyLogin, function (req, res) {
    let orderId = req.params.id;
    userHelpers.cancelOrder(orderId).then(() => {
      res.redirect("/orders");
    });
  });
  
  router.post("/search", VerifyLogin, async function (req, res) {
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelpers.getCartCount(userId);
    userHelpers.searchProduct(req.body).then((response) => {
      res.render("user/search-result", { admin: false, user, cartCount, response });
    });
  });
  
module.exports = router;
