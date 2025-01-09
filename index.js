const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');   

const inventoryRoutes = require('./routes/inventoryRoutes');
const userRoutes = require('./routes/userRoutes');
const posRoutes = require('./routes/posRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");


// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/inventory_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Use the routes
app.use('/inventory', inventoryRoutes);
app.use('/users', userRoutes);
app.use('/pos', posRoutes);
app.use('/sales', saleRoutes);



app.get('/', (req, res) => {
    res.redirect('/pos');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});