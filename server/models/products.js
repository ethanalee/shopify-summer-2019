var mongoose = require('mongoose');

var Product = mongoose.model('Product', {
    title: {
        type: String,
        required: true, // this means that text value needs to be defined
        minlength: 1, // we need a minimum length
        trim: true, // this will remove leading and trailing spaces
        unique: true
    },
    price: {
        type: Number,
        required: true,
        default: null // give it a default value
    }, 
    inventory_count: {
        type: Number,
        required: true,
        default: 0 // set a default
    }, 
    cart_inventory: {
        type: Number,
        default: 0 // use this to check out the amount already added to carts
    }
});

module.exports = {Product}