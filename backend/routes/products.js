const Router = require('express').Router;
const Decimal128 = require("mongodb").Decimal128;
const ObjectId= require("mongodb").ObjectId;
const router = Router();
const dbClient = require("../db")
const products = [
  {
    _id: 'fasdlk1j',
    name: 'Stylish Backpack',
    description:
      'A stylish backpack for the modern women or men. It easily fits all your stuff.',
    price: 79.99,
    image: 'http://localhost:3100/images/product-backpack.jpg'
  },
  {
    _id: 'asdgfs1',
    name: 'Lovely Earrings',
    description:
      "How could a man resist these lovely earrings? Right - he couldn't.",
    price: 129.59,
    image: 'http://localhost:3100/images/product-earrings.jpg'
  },
  {
    _id: 'askjll13',
    name: 'Working MacBook',
    description:
      'Yes, you got that right - this MacBook has the old, working keyboard. Time to get it!',
    price: 1799,
    image: 'http://localhost:3100/images/product-macbook.jpg'
  },
  {
    _id: 'sfhjk1lj21',
    name: 'Red Purse',
    description: 'A red purse. What is special about? It is red!',
    price: 159.89,
    image: 'http://localhost:3100/images/product-purse.jpg'
  },
  {
    _id: 'lkljlkk11',
    name: 'A T-Shirt',
    description:
      'Never be naked again! This T-Shirt can soon be yours. If you find that buy button.',
    price: 39.99,
    image: 'http://localhost:3100/images/product-shirt.jpg'
  },
  {
    _id: 'sajlfjal11',
    name: 'Cheap Watch',
    description: 'It actually is not cheap. But a watch!',
    price: 299.99,
    image: 'http://localhost:3100/images/product-watch.jpg'
  }
];

// Get list of products products
router.get('/', async (req, res, next) => {
  // Return a list of dummy products
  // Later, this data will be fetched from MongoDB
  const queryPage = req.query.page;
  const pageSize = 1;

  const client =await dbClient.getConnection();
  const result = await client.db().collection("products").aggregate([{$sort:{price:-1}}, {$skip:(queryPage - 1) * pageSize},{$limit:pageSize}]).toArray()
  await dbClient.closeConnection();
  result.map(product=>{
    product.price = product.price.toString();
  })
  let resultProducts = [...result];
  res.json(resultProducts);
});

// Get single product
router.get('/:id', async (req, res, next) => {
  const client =await dbClient.getConnection();
  const originalProduct = await client.db().collection("products").findOne({_id:new ObjectId(req.params.id)})
  res.json({...originalProduct, price:originalProduct.price.toString()});
});

// Add new product
// Requires logged in user
router.post('', async (req, res, next) => {
  const newProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };
  
  const client = await dbClient.getConnection();
  const result = await client.db().collection("products").insertOne(newProduct);
  dbClient.closeConnection();

  res.status(201).json({ message: 'Product added', productId: 'DUMMY' });
});

// Edit existing product
// Requires logged in user
router.patch('/:id', async (req, res, next) => {
  const updatedProduct = {
    name: req.body.name,
    description: req.body.description,
    price: Decimal128.fromString(req.body.price.toString()), // store this as 128bit decimal in MongoDB
    image: req.body.image
  };
  const client = await dbClient.getConnection();
  const result = await client.db().collection("products").updateOne({_id:new ObjectId(req.params.id)},{$set:updatedProduct});
  dbClient.closeConnection();
  res.status(200).json({ message: 'Product updated', productId: result._id });
});

// Delete a product
// Requires logged in user
router.delete('/:id',async (req, res) => {
  const client = await dbClient.getConnection();
  const result = await client.db().collection("products").deleteOne({_id:new ObjectId(req.params.id)});
  dbClient.closeConnection();

  res.status(200).json({ message: 'Product deleted' });
});

module.exports = router;
