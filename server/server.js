//library imports
const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

//local imports
var {mongoose} = require('./db/mongoose');
var {Product} = require('./models/products');
var {Cart} = require('./models/carts');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

//using middleware - now we can send json to our app
app.use(bodyParser.json());

//GET all products that have inventory greater than zero [don't need auth]
app.get('/products/:status', (req, res) => {
    if (req.params.status == "true") {
        Product.find({}).then((products) => {
            res.send({products}); //send object back rather than an array
        }, (err) => {
            res.status(400).send(err);
        })
    } else if (req.params.status == "false"){
        Product.find({inventory_count: {$gt: 0} }).then((products) => {
            res.send({products}); 
        }, (err) => {
            res.status(400).send(err);
        })
    } else {
        res.status(400).send('Insert true or false')
    }
})

//GET a single product [don't need auth]
app.get('/products/:productName', (req, res) => {
    var productName = req.params.productName;
    Product.find({title: productName }).then((product) => {
        res.send({product}); //send object back rather than an array, get a singular product
    }, (err) => {
        res.status(400).send(err);
    })
})

//POST a product [don't need auth]
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
app.post('/carts', authenticate, (req, res) => {
    var cart = new Cart({
        _creator: req.user._id
    });

    cart.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });

    // ! I removed this part because I decided that there could be multiple active carts, but with different users
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
app.post('/carts/:cartId', authenticate, (req, res) => {
    var cartId = req.params.cartId;
    var product = req.body.product;

    //check if the cartID is valid
    if (!ObjectID.isValid(cartId)) {
        return res.status(404).send();
      }
    //check if the cart is active
    Cart.find({_id: cartId}).then((cart) => {
        if (cart[0].status == "inactive") {
            return res.status(400).send("Inactive Cart");
        }
    }).catch((e) => {
        res.status(400).send(e);
    });
    //find the product in the db and check if it's inventory count isn't zero.
    Product.find({title: product}).then((doc) => {
        var inventory_count = doc[0].inventory_count;

        if (inventory_count == 0 || inventory_count == doc[0].cart_inventory) {
            return res.status(400).send("No Inventory");
        }
        //update the product so that the temporary cart inventory is updated
        Product.findOneAndUpdate({title: product}, {$inc: {cart_inventory: 1}}).then((product) =>{
        });

        var productPrice = doc[0].price;
        //update the cart and add the product to the array of products.
        Cart.findOneAndUpdate({_id: cartId, _creator: req.user._id}, {$inc: {value: productPrice}, $push: { products: {title: product, price: productPrice}}}, {new: true}).then((cart) => {
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
});

//POST checkout -> this will output the value of the cart, inactivate the cart and also reduce the inventory count of all the products
app.post('/carts/:cartId/checkout', authenticate, (req, res) => {
    var cartId = req.params.cartId;

    if (!ObjectID.isValid(cartId)) {
        return res.status(404).send();
      };

    Cart.findOneAndUpdate({_id: cartId, _creator: req.user._id}, {$set: {status: "inactive"}}).then((cart) => {
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

// POST /users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
  
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    })
  });
  
app.get('/users/me', authenticate, (req, res) => {
res.send(req.user);
});

app.post('/users/login', (req, res) => {
var body = _.pick(req.body, ['email', 'password']);

User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
    res.header('x-auth', token).send(user);
    });
}).catch((e) => {
    res.status(400).send();
});
});

app.delete('/users/me/token', authenticate, (req, res) => {
req.user.removeToken(req.token).then(() => {
    res.status(200).send();
}, () => {
    res.status(400).send();
});
});
  

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};

