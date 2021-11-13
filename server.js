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

        // get all the drones packages
        app.get('/drones', async (req, res) => {
            const cursor = packagesCollection.find({});
            const package = await cursor.toArray();
            res.send(package);
        });
        // get one drones packacges by id
        app.get('/drones/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const package = await packagesCollection.findOne(query);
            res.send(package);
        });
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