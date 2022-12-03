// Fake Database with initial data json file is added but never used

const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.Port || 5000;

app.use(cors());
app.use(express.json());
require('dotenv').config();

// ---------
// Mongodb
// ---------

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7grdkwx.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader= req.headers.authorization;
    if(!authHeader){
        res.status(401).send({messege: 'unauthorized access'})
    }
     const token = authHeader.split(' ')[1];
     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_CODE, function(error, decoded){
        if(error){
            res.status(401).send({messege: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
     })
}

async function run() {
    try {
        
        const reviewsCollection = client.db('fitness-programs').collection('reviews');
        const programCollection = client.db('fitness-programs').collection('programs');
        const userCollection = client.db('fitness-programs').collection('users');

        // jwt 

        app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_CODE, {expiresIn: '6h'});
            res.send({token})
          })

        // Programs

        app.get('/programs', async (req, res) => {
            const query = {}
            const cursor = programCollection.find(query);
            const programs = await cursor.toArray();
            res.send(programs);
        });

        app.post('/programs', async (req, res) => {
            const program = req.body;
            const result = await programCollection.insertOne(program);
            res.send(result)
        })

        app.get('/programs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await programCollection.findOne(query);
            res.send(service)
        });

        // Reviews

        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', async (req, res) => {
            const review= req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result)
        });

        app.get('/reviews/:id', async (req, res) => {
            const query = {program: (req.params.id)}
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/reviews/user/:user', async (req, res) => {
            const query = {user: (req.params.user)}
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.delete('/reviews/id/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            console.log(query)
            const result = await reviewsCollection.deleteOne(query);
            res.send(result)
        });

        app.patch('/reviews/id/:id', async(req, res)=>{
            const id = req.params.id;
            console.log(id)
            const review = req.body.review;
            console.log(review)
            const query = {_id : ObjectId(id)};
            const updatedDoc = {
                $set:{
                    review: review
                }
            }
            const result = await reviewsCollection.updateOne(query, updatedDoc);
            res.send(result)
          })

        // users
        
        app.get('/users', async (req,res)=>{
            const query= {};
            const allUsers= await userCollection.find(query).toArray();
            res.send(allUsers)
        })
        
        app.get('/users/:email', async (req,res)=>{
            const email=req.params.email;
            const query= {email: email};
            const result= await userCollection.findOne(query);
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user= req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        });

    }
    finally {

    }
}

run().catch(error => console.error(error))


app.get('/', (req, res) => {
    res.send('Port is running')
});

app.listen(port, () => {
    console.log(`port ${port}`)
})