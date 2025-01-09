const express = require('express');
const User = require('../models/User'); 
const Inventory = require('../models/Inventory'); 
const Sale = require('../models/Sales');
const isLoggedIn = require('../Utils/isLoggedIn');
const router = express.Router();

router.get('/',isLoggedIn, async (req, res) => {
    let thisInventory = await Inventory.find({userId: req.userId});
    let thisUser = await User.findById(id_ = req.userId);
    let thisCart = thisUser.cart;
    let cartTotal = thisUser.cartTotal;
    res.render('pos', { inventory: thisInventory, cart: thisCart , cartTotal});
});


// to add a item to cart
router.get('/add-to-cart/:productId',isLoggedIn, async (req, res) => {
    const productId = req.params.productId;
    const product = await Inventory.findOne({ productId });
    try {
        if(product.stock < 1){}
        else{
        const user = await User.findById(id_ = req.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.cart.find(index => index.productId === productId)){
            await User.findByIdAndUpdate(
                { _id: req.userId },
                { $inc: { "cart.$[element].quantity": 1 } },
                { arrayFilters: [{ "element.productId": productId }], new: true }
              );    
        }
        else{
            await User.findByIdAndUpdate({_id : req.userId}, { $push: { cart: {productId, name: product.name, price: product.price }} }, { new: true });
        };
        await User.findByIdAndUpdate(
                { _id: req.userId}, 
                { $inc: {cartTotal: product.price} });
        await Inventory.findOneAndUpdate({productId}, { $inc: { stock: -1 } });
        res.status(200).redirect('/pos');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error adding item to cart');
    }
});


// Remove item from cart
router.get('/remove-from-cart/:productId',isLoggedIn, async (req, res) => {
    const productId = req.params.productId;
    const product = await Inventory.findOne({ productId });
    const user = await User.findById(id_ = req.userId);
    try {
        if (user.cart.find(index => index.productId === productId).quantity === 1) {
            await User.findByIdAndUpdate(
                { _id: req.userId },
                { $pull: { cart: { productId } } },
                { new: true }
            );
        }else{
            await User.findByIdAndUpdate(
            { _id: req.userId },
            { $inc: { "cart.$[element].quantity": -1 } },
            { arrayFilters: [{ "element.productId": productId }], new: true });
            await Inventory.findOneAndUpdate({productId}, { $inc: { stock: 1 } });
            };

        await User.findByIdAndUpdate(
            { _id: req.userId}, 
            { $inc: {cartTotal: -product.price} });
        res.status(200).redirect('/pos');
    } catch (error) {
        res.status(500).send('Error removing item from cart');
    }
});

router.get('/checkout', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.userId);
    const cart = user.cart;
    const cartTotal = user.cartTotal;
    res.render('checkout', { cart, cartTotal });
});


// to place order
router.get('/place-order', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.userId);
    try {
        // to create a new sale record
        const newSale = new Sale({ userId: req.userId, items: user.cart, totalAmount: user.cartTotal });
        await newSale.save();

        // to update user cart and cartTotal
        await User.findByIdAndUpdate(req.userId, { cart: [], cartTotal: 0 });

        // to update inventory for each item sold
        //for (const item of items) {
        //    await Inventory.findByIdAndUpdate(item.id, { $inc: { stock: -item.quantity } });
        //}

        res.status(201).redirect('/pos');
    } catch (error) {
        res.status(500).send('Error placing order');
    }
});

module.exports = router;
