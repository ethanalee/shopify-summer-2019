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
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
});

module.exports = {Cart}