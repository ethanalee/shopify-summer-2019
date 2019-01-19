# shopify-summer-2019

https://docs.google.com/document/d/1J49NAOIoWYOumaoQCKopPfudWI_jsQWVKlXmw1f1r-4/edit

# My Thought Process
 - Define the Schema for the database using MongoDB
 - Structure: 
    - title : string
    - price : number
    - inventory_count : number

 - find({}) - use this to grab all of the products
 - find({_id}) - use this to find based on a specific product _id

 - GET ('/products') -> req (id), res (only those with inventory > 0)

 - POST ('/purchase') -> use the $inc modifier to update the db
 - products with inventory = 0 should not be able to be purchased

# Organizing the Cart:
- Just keep a list of the objects that have been returned from the db after the purchase - seperate cart database
- initialize a data base
- purchase items to add to cart
- POST - complete cart
- should this clear the data base then after?
- IMPROVEMENT - use PATCH to edit the existing things

just add some automation tests

 - maybe add some unit tests lmao

 Use POSTMAN to test this

 JWT token or authorization header for HTTP requests
 authorization not required for the HTTP request to list all available products

 we want eager initialization

 GET - all products
 /products

 POST a shopping cart
 - with authorization 
 /cart

 POSt - put a product in cart
 /cart/{cart_id}

 GET - cart contents
 cart/{cart_id}

 POST - checkout
 /cart/{cart_id}/checkout

 provide tokens which we can only do with mongo vs sql

