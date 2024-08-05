const express = require("express")
const {MongoClient} = require("mongodb");
const fs = require("fs");
const multer = require("multer");

const bodyParser = require("body-parser");
const PORT = 3001;
const uri = "mongodb://localhost:27017";
const upload = multer({dest:"public/uploads"});


const app = express()
app.use(bodyParser.json());
app.use(express.static("public"));
const client = new MongoClient(uri)
client.connect()

const db = client.db("search");
const coll = db.collection("pages");


app.post("/parse", upload.single("textfile"),async (req, res) => {
    const filePath = req.file.path;
    if(!filePath){
        return res.status(400).send("File required");
    }
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const names = fileContent.toLowerCase().split(",").map(name => name.replace(/"/g,"")).map(name => ({ name }));
   
    await coll.insertMany(names)
    res.status(200).send("Inserted successfully")
    
})

app.get("/search", async (req, res) => {
    const query = req.query.q;
   
    if (!query) {
        return res.status(400).send("Query name is required");
    }
    const name = query.toLowerCase();
    
    const foundedName = await coll.find({ name: { $regex: `^${name}` } }).toArray();
    console.log(foundedName)
    if (foundedName.length == 0) {
        return res.status(400).send("Data not found");
    }
     res.status(200).send(foundedName);
});
app.listen(PORT, () => {
    console.log("server running")
})
