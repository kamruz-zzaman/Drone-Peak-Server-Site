const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.utqcf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {

    try {

        // initialize Mongodb
        await client.connect();
        const database = client.db("DronePeak");
        const packagesCollection = database.collection("Drone");
        const orderCollection = database.collection("Order");
        const reviewCollection = database.collection("Review");
        const usersCollection = database.collection("User");

        // get all the drones packages
        app.get('/drones', async (req, res) => {
            const cursor = packagesCollection.find({});
            const package = await cursor.toArray();
            res.send(package);
        });
        // Upload or post a package
        app.post('/drones', async (req, res) => {
            const data = req.body;
            const package = await packagesCollection.insertOne(data);
            res.send(package);
        });

        // get one drones packacges by id
        app.get('/drones/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const package = await packagesCollection.findOne(query);
            res.send(package);
        });
        // post or upload orderInfo
        app.post('/order', async (req, res) => {
            const data = req.body;
            const order = await orderCollection.insertOne(data);
            res.send(order);
        });

        // get order by email
        app.get('/order', async (req, res) => {
            const email = req.query.Email;
            const query = { email: email }
            const cursor = orderCollection.find(query);
            const order = await cursor.toArray();
            res.json(order);
        })

        // get orderInfo 
        app.get('/order', async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });
        // manage order
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    Status: `Shipped`
                },
            };
            const result = orderCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result);
        });
        // delet on order info
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const orderr = await orderCollection.deleteOne(query);
            res.send(orderr);
        })
        // updload review
        app.post('/review', async (req, res) => {
            const data = req.body;
            const review = await reviewCollection.insertOne(data);
            res.send(review);
        });

        // get all review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // add user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // update user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // search admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
    } finally {
        // await client.close();
    };
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Drone Peak Start')
});


app.listen(port, () => {
    console.log('server start at port', port);
});