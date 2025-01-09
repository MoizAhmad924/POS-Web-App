const express = require('express');
const User = require('../models/User'); 
const Inventory = require('../models/Inventory'); 
const Sales = require('../models/Sales');
const isLoggedIn = require('../Utils/isLoggedIn');
const router = express.Router();



// Retrieve sales records
router.get('/', isLoggedIn, async (req, res) => {
    try {
        let sales = await Sales.find({userId: req.userId});
        res.render('sales',{sales});
    } catch (error) {
        res.status(500).send('Error retrieving sales records');
    }
});



module.exports = router;