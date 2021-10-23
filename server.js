const express = require('express');
const { v4 : uuidv4} = require('uuid');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;

const accountSid = "AC0b45470f1e594b28e20b952e23ab4603";
const authToken = "ce37c0ac370bf5390878315b890bbae1";
const client = require('twilio')(accountSid, authToken);

app.use(express.json());

app.get('/', (req, res) => {
    // landing page
});

app.get('/groupcreation/', (req, res) => {
    // group creation form
});

app.post('/groupcreation/', (req, res, next) => {
    const formdata = req.body();
    let newGroup = {
        "groupID": uuidv4().replaceAll("-", ""),
        "partyName": formdata["partyName"],
        "datetime": formdata["datetime"],
        "members": formdata["members"],
        "recipe": "",
        "ingredients": []
    }
    
    // create unique url

    // send group creation text to members of food night
    
    // 
});

// get all recipe names
app.get('/api/recipes', (req, res) => {
    const recipes = databases["recipes"];
    let recipe_names = [];
    recipes.forEach(r => {
        recipe_names.push(r.name);
    });
    res.json({"recipes": recipe_names});
});

// unique url and recipe selection
app.get('/uniqueurl/', (req, res) => {
    
});

app.post('/uniqueurl', (req, res) => {
    const data = req.body(); // json response
    
});

/**
 * const numbers = ["2066437582", "4252733269", "4256589553"]
    for (let i = 0; i < numbers.length; i++) {
        client.messages
        .create({
            body: 'Test',
            from: '+19857773832',
            to: `+1${numbers[i]}` // replace with receiver phone #
        })
        .then(message => console.log(message.sid));
    };
 */

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
});


// schema
/**
 * group:
 *      groupID: string - pk
 *      datatime?: string - when the event is happening
 *      members: [
 *          {
 *              name: string
 *              phonenumber: string (no country code and remove hyphens)
 *              email: string       
 *          }
 *      ],
 *      recipe: string - name of recipe
 *      ingredients: [
 *          {
 *              name: string
 *              bringer: string - member name
 *          }
 *      ]
 *  
 * 
 */

let databases = {
    "groups": [ // push new groups into group id

    ],
    "recipes": [ // static
        {
            "name": "test",
            "image": "www.abc.com",
            "desc": "this is a test recipe",
            "ingredients": [
                {
                    "name": "there is no ingredient",
                    "image": "www.test.com"
                }
            ]
        },
    ]
}