var mongoose = require('mongoose');

var Cart = mongoose.model('Carts', {
    status: {
        default: 'active',
        type: String
    },
    products: {
        type: [{title: String, price: Number}],
    },
    value: {
        default: 0,
        type: Number
    }
});

module.exports = {Cart}