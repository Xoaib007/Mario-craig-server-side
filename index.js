const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.Port || 5000;

app.use(cors());
app.use(express.json());
require('dotenv').config();

// ---------
// Mongodb
// ---------

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7grdkwx.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const programCollection = client.db('fitness-programs').collection('programs')

        app.get('/programs', async (req, res) => {
            const query = {}
            const cursor = programCollection.find(query);
            const programs = await cursor.toArray();
            res.send(programs);
          });
    }
    finally{
        
    }
}

run().catch(error => console.error(error))


app.get('/', (req,res) =>{
    res.send('Port is running')
});

app.listen(port, () =>{
    console.log(`port ${port}`)
})