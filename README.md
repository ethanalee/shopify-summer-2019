# Shopify Summer 2019 Backend Challenge

## Find the Design Guidelines Here
https://docs.google.com/document/d/1J49NAOIoWYOumaoQCKopPfudWI_jsQWVKlXmw1f1r-4/edit

## My Thought Process Outlined Below
I decided to use two collections for the carts and products and another for the user. I made the routes for creating carts, adding carts and checking out private using JWT authentication. This hopefully simulates a real user logging into their account to make purchases. Also we are eagerly initializing the cart before a product is created vs lazy initialization which creates the cart when the product is "purchased".  I also didn't require authorization for routes to obtain products or create new products. 

I included a cart_inventory field in the Product model as the design document didn't say that I couldn't include one. This solves the issue of only reducing `inventory_count` after the cart is completed in the checkout. Everytime a product is added to any cart, the cart_inventory goes up. If this count eventually equals `inventory_count` then there is no more inventory available. I suppose if you deleted a cart, you could then free up this temporary storage, but the design document didn't specificy that carts could be deleted. I would add this as an improvement. 

I also assumed that carts would persist even after they had been 'completed'. Thus I would only make them inactive and there could be multiple active carts under different users. I did also add a potential for only having a single cart at a time. I handled this by checking if a cart was inactive before performing certain operations such as adding a product. 

Another assumption I made was that the design document implied that I could only add products to the cart one by one. Otherwise, if users could specify their quantity, I could have done the additions to the cart in a different manner.

I also could have created additional routes, but I wanted to follow the design document as close as possible, while making the least assumptions possible.

I also added a model for the user and routes for user creation and authentication. I can provide further elaboration if required, but I thought it was extraneous compared the main task of creating the API.

### Models
 - Define the models for the database using MongoDB (you can find it in the models directory)
 - Product Structure: 
    - title : string
    - price : number
    - inventory_count : number
    - cart_inventory: number
 - Cart Structure:
    - status: inactive or active
    - products: array of products
    - value: total dollar value of the cart
    - creater: the user who created the cart

### Routes
```
GET /products/:status
return all products, status: true for all, false for only those above 0.

GET /products/:productName
return specific product

POST /products
add a product

POST /carts
make a new cart

POST /carts/:cartId
*must specify product name in req.body
adds product to the cart

POST /carts/:cartId/checkout
find the cart and output the value of the cart
loops through and decrements the value of the product inventory. Also clears cart_inventory which was the temporary count for the products in all carts.
```

### Usage
- Ensure that MongoDB is installed on your system
- Use `node server/server.js` to start the app on `localhost:3000`
- Use Postman to test out specific routes
- One can use RoboMongo to view the database and its updates

### Improvements/ Stuff I Should Do
- make a delete route if one wants to remove completed carts (this would reduce the complexity of having 'inactive' carts)
- make a route to modify the cart contents (this wasn't specified in the design document)
- make some routes to display the value of the cart or output the cart contents
- add unit tests, would need to create a seed file for the authenticated users to test


