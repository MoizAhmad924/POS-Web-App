const express = require('express');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const router = express.Router();
const isLoggedIn = require('../Utils/isLoggedIn');

// Getting all inventory items that belong to the logged in user
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const items = await Inventory.find({userId: req.userId});
        res
        .status(200)
        .render('inventory', { items });
        
        
    } catch (error) {
        res.status(500).send(error);
    }
});

//to add a new inventory item
router.post('/add', isLoggedIn, async (req, res) => {
    const { productId,name, stock, price } = req.body;
    const userId = req.userId;
    
    try {
        let newItem = await Inventory.create({
            productId,
            name,
            stock,
            price,
            userId
        });
        await User.findByIdAndUpdate({_id : userId}, { $push: { inventory: newItem._id } }, { new: true });
        res.status(201).redirect('/inventory');
    } catch (error) {
        res.status(400).send(error);
    }
});

//for editting an inventory item
router.post('/edit', isLoggedIn, async (req, res) => {
    const {oldId,newId,newName,newStock,newPrice} = req.body;
    const userId = req.userId;
    try {
        const updatedItem = await Inventory.findOneAndUpdate({productId: oldId,userId}, { 
            name:newName, 
            productId:newId,
            stock:newStock,
            price:newPrice
        }, { new: true });
        
        if (!updatedItem) {
            return res.status(404).send('Item not found');
        }
        res.status(200).redirect('/inventory');
    } catch (error) {
        res.status(400).send(error);
    }
});

// to delete an inventory item
router.get('/delete/:productId', isLoggedIn, async (req, res) => {
    const { productId } = req.params;
    try {
        const deletedItem = await Inventory.findOneAndDelete({productId});
        if (!deletedItem) {
            return res.status(404).send('Item not found');
        }
        User.findByIdAndUpdate(req.userId, { $pull: { inventory: deletedItem._id } }, { new: true });
        res
        .status(200)
        .redirect('/inventory');
    } catch (error) {
        res.status(500).send(error);
    }
});

// Searching for inventory items
router.get('/search', isLoggedIn, async (req, res) => {
    const { query } = req.query; 
    try {
        const items = await Inventory.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { productId: { $regex: query, $options: 'i' } }
            ],
            $and: [
                {userId: req.userId}
            ]
        });
        res
        .status(200)
        .render('inventory', { items });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
