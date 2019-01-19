//library imports
var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

//local imports
var {mongoose} = require('./db/mongoose');
var {Product} = require('./models/products');
var {Cart} = require('./models/carts');

var app = express();

//using middleware - now we can send json to our app
app.use(bodyParser.json());

//GET all products that have inventory greater than zero
app.get('/products', (req, res) => {
    Product.find({inventory_count: {$gt: 0} }).then((products) => {
        res.send({products}); //send object back rather than an array
    }, (err) => {
        res.status(400).send(err);
    })
})

//GET a single product
app.get('/products/:productName', (req, res) => {
    var productName = req.params.productName;
    Product.find({title: productName }).then((product) => {
        res.send({product}); //send object back rather than an array, get a singular product
    }, (err) => {
        res.status(400).send(err);
    })
})

//POST a product
app.post('/products', (req, res) => {
    var product = new Product({
        title: req.body.title,
        price: req.body.price,
        inventory_count: req.body.inventory_count
    });
    
    product.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

//POST a cart
app.post('/carts', (req, res) => {
    var cart = new Cart();

    cart.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });

    // only one active cart at a time
    // Cart.findOne({status: "active"}).then((doc) => {
    //     if (doc) {
    //         res.sendStatus(403);
    //     }
    //     else {
    //         cart.save().then((doc) => {
    //             res.send(doc);
    //         }, (err) => {
    //             res.status(400).send(err);
    //         });
    //     }
    // });
});

//POST add stuff to a cart
// Route path: /users/:userId/books/:bookId
// Request URL: http://localhost:3000/users/34/books/8989
// req.params: { "userId": "34", "bookId": "8989" }
//should maybe also check if the cart is active?
// need a remove function
app.post('/carts/:cartId', (req, res) => {
    var cartId = req.params.cartId;
    var product = req.body.product;

    if (!ObjectID.isValid(cartId)) {
        return res.status(404).send();
      }

    Product.find({title: product}).then((doc) => {
        var inventory_count = doc[0].inventory_count;

        if (inventory_count == 0 || inventory_count == doc[0].cart_inventory) {
            return res.status(400).send("No Inventory");
        }
        // if (inventory_count == doc[0].cart_inventory) {
        //     return res.status(400).send("No Inventory");
        // }

        Product.findOneAndUpdate({title: product}, {$inc: {cart_inventory: 1}}).then((product) =>{
            //res.send('Success');
        });

        var productPrice = doc[0].price;

        Cart.findOneAndUpdate({_id: cartId}, {$inc: {value: productPrice}, $push: { products: {title: product, price: productPrice}}}, {new: true}).then((cart) => {
            if (!cart) {
                return res.status(404).send(); // if cart doesn't exist , exit 404
            }
            res.send({cart});
            }).catch((e) => {
            res.status(400).send(e);
            })
    }).catch((e) => {
        res.status(400).send(e);
    })
    // .then((productPrice) => {
    //     Cart.findOneAndUpdate({_id: cartId}, {$inc: {value: productPrice}, $push: { products: {title: product, price: productPrice}}}).then((cart) => {
    //         if (!cart) {
    //             return res.status(404).send(); // if cart doesn't exist , exit 404
    //         }
    //         res.send({cart});
    //         }).catch((e) => {
    //         res.status(400).send();
    //         })
    // })
});

// GET all products in cart
//GET total value

//POST checkout
//check if the cart is active, inventoryu_ -1 all of the products, output the value of the cart?
//find the cart, ouput value, deactivate cart ~ possibly delete
app.post('/carts/:cartId/checkout', (req, res) => {
    var cartId = req.params.cartId;

    if (!ObjectID.isValid(cartId)) {
        return res.status(404).send();
      };

    Cart.findOneAndUpdate({_id: cartId}, {$set: {status: "inactive"}}).then((cart) => {
        if (cart.status == "inactive") {
            return res.status(404).send();
        }
        var value = cart.value;
        
        var productArray = cart.products
        var i;
        for (i = 0; i < productArray.length; i++) {
            var productName = productArray[i].title;

            Product.findOneAndUpdate({title: productName}, {$inc: {inventory_count: -1, cart_inventory: -1}}).then((product) =>{

            }).catch((e) => {
                res.status(407).send(e);
            });
        }
        res.send(`The Cart Value is ${value}`);
    }).catch((e) => {
        res.status(400).send(e);
    });;

});
  

app.listen(3000, () => {
    console.log('Started on port 3000');
});

// we want eager initialization

//  GET - all products
//  /products

//  POST a shopping cart
//  - with authorization 
//  /cart

//  POSt - put a product in cart
//  /cart/{cart_id}

//  GET - cart contents
//  cart/{cart_id}

//  POST - checkout
//  /cart/{cart_id}/checkout

//  provide tokens which we can only do with mongo vs sql

module.exports = {app};

