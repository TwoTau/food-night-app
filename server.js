const fs = require('fs');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const accountSid = 'AC0b45470f1e594b28e20b952e23ab4603';
const authToken = 'ce37c0ac370bf5390878315b890bbae1';

const client = require('twilio')(accountSid, authToken);
const domain = 'http://localhost:8000';

app.use(cors());

app.use(express.json());

app.use(express.static('client'));

const mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chicken.tinder.dubhacks@gmail.com',
        pass: 'dubhacksahhhhh'
    }
});

app.post('/groupcreation/', (req, res, next) => {
	const formdata = req.body;	
	for (let member of formdata.members) {
		member.response = [];
		member.votingCompleted = false;
	}

	const groupID = uuidv4().replaceAll('-', '').substring(0, 8);

	let newGroup = {
		groupID: groupID,
		partyName: formdata['partyName'],
		datetime: formdata['datetime'],
		members: formdata.members,
		recipe: '',
		ingredients: [],
	};

	databases['groups'] = [...databases['groups'], newGroup];

	// create unique url
	const url = `${domain}/party/${groupID}/recipes`;

	// send group creation text to members of the group
    sendSMS(members, `Welcome to ChickenTinder, we're lucky to have you. You have been invited to ${formdata["partyName"]} happening on ${formdata["datetime"]}!\n
    \n Please vote on the recipe that you will be making at your next food night by going to this link: ${url}`);
	
    sendEmail(members, `Welcome to ChickenTinder, we're lucky to have you. You have been invited to ${formdata["partyName"]} happening on ${formdata["datetime"]}!\n
    \n Please vote on the recipe that you will be making at your next food night by going to this link: ${url}`, "ChickenTinder Invite!!");

<<<<<<< HEAD
=======
	console.log(`Created group ${groupID} with name "${newGroup.partyName}" and ${members.length} members`);
	res.json({
		id: groupID,
	})

	// TODO: send group creation email to the members of the group
>>>>>>> 0b1255253b34554292b4f72ed6a92d7516ae2a30
});

// unique url and recipe selection
app.get('/party/:groupID/recipes', (req, res) => {
	const groupID = req.params.groupID;
	// send react compiled page
});

app.post('/party/:groupID/recipes', (req, res) => {
	// groupID encoded as url param
	const groupID = req.params.groupID;

	const data = res.body();
	const member = data['member']; // TODO: set front end field
	let group = null;
	// find group
	for (let i = 0; i < databases.groups.length; i++) {
		if (groupID === databases.groups[i].groupID) {
			group = databases.groups[i];
			break;
		}
	}

	// set member field based on data received from front end
	for (let i = 0; i < group.members.length; i++) {
		if (member === group.members[i].name) {
			// set responses and voting completed flag
			group.members[i].responses = data['responses'];
			group.members[i].votingCompleted = data['votingCompleted'];
		}
	}

	// check if all members have finished voting, if yes then send out ingredient distribution link
	for (let i = 0; i < group.members.length; i++) {
		if (group.members[i].votingCompleted === false) {
			return;
		}
	}

	// tabulate results and send link to ingredient distribution with recipe
	let vote_count = new Map();
	let recipes = getRecipeNames();
	recipes.forEach((r) => {
		vote_count.set(r, 0);
	});

	for (let i = 0; i < group.members.length; i++) {
		for (let j = 0; recipes.length; j++) {
			if (vote_count.has(recipes[j])) {
				if (group.members[i].responses[j] === 1) {
					vote_count.set(recipes[j], vote_count.get(recipes[j]) + 1);
				} else if (group.members[i].responses[j] === 2) {
					vote_count.delete(recipes[j]);
				}
			}
		}
	}

	let max_vote = 0;
	let max_recipe = '';
	for (let [key, value] of vote_count.entries()) {
		if (value > max_vote) {
			max_recipe = key;
			max_vote = value;
		}
	}

	// set recipe and ingredients list in group and send out ingredient distribution
	group['recipe'] = max_recipe;

	let ingredientList = [];
	const ingredients = databases['recipes'].ingredients;
	ingredients.forEach((i) => {
		ingredientList = [...ingredientList, { name: i.name, image: i.image, bringer: null }];
	});
	group['ingredients'] = ingredientList;

	const url = `${domain}/party/${groupID}/invite/`;

	// all ingredients distributed - send texts
    let msg = `The recipe is chosen and the party is about to start.
    \n Please refer to the invite link to sign up to bring ingredients: ${url}\n
    \nHave a great food night and thank you for using ChickenTinder!`;

    sendSMS(group.members, msg);
});

// requires page will make 2 calls,
//      1. /api/:groupID/finalinvite for party information
//      2. /api/recipe?recipe_name=<name> for recipe information
app.get("/party/:groupID/invite/", (req, res) => {

});

////////////////////////////// API /////////////////////////////////////

// get all recipe names and information
app.get('/api/recipes', (req, res) => {
	res.json({ recipes: databases.recipes });
});

// get specific recipe information, <recipe> if recipe exists, null otherwise
app.get('/api/recipe', (req, res) => {
	const recipe_name = req.query.recipe_name;
	const recipes = databases['recipes'];
	let recipe = null;
	for (let i = 0; i < recipes.length; i++) {
		if (recipe_name === recipes[i].recipe_name) {
			recipe = recipes[i];
		}
	}
	res.json({ recipe: recipe });
});

// get the ingredients associated with recipe chosen by group with id groupID
app.get('/api/:groupID/ingredients', (req, res) => {
	const groupID = req.params.groupID;
	let group = null;
	// find group
	for (let i = 0; i < databases.groups.length; i++) {
		if (groupID === databases.groups[i].groupID) {
			group = databases.groups[i];
			break;
		}
	}

	res.json({ ingredients: group.ingredients });
});

// get final invite information -- groupID is included (used for the socket)
app.get('/api/:groupID/finalinvite', (req, res) => {
	const groupID = req.params.groupID;
	let group = null;
	// find group
	for (let i = 0; i < databases.groups.length; i++) {
		if (groupID === databases.groups[i].groupID) {
			group = databases.groups[i];
			break;
		}
	}

	res.json({ groupInfo: group });
});

////////////////////////////// END API /////////////////////////////////

//// socket connections /////

let groupToSocket = {};

io.on('connection', (socket) => {
    socket.username = socket.handshake.query.name;
    let groupID = socket.handshake.query.groupID;
    
    if (!groupToSocket[groupID]) {
        groupToSocket[groupID] = [];        
    }

    groupToSocket[groupID].push(socket);
    socket.join(groupID);
    console.log(`New client ${socket.id} connected to group ${groupID}`);
    sendUsersUpdate(groupID);

    socket.on('disconnect', () => {
        if (groupToSocket[socket]) {
            const idx = groupToSocket[groupID].indexOf(socket);
			if (idx > -1) {
				groupToSocket[groupID].splice(index, 1)
				// delete groupID
				if (groupToSocket[groupID].length === 0) {
					delete groupToSocket[groupID];					
				}
			}
        }

        console.log(`Client ${socket.id} disconnected froom group ${groupID}`);
		sendUsersUpdate(groupID);
    });

    socket.on('edit', (data) => {
        io.to(groupID).emit('edit', { ingredient: data.ingredient, content: data.content });

        // set ingredient to new contents of text box
        let group = null;
        // find group
        for (let i = 0; i < databases.groups.length; i++) {
            if (groupID === databases.groups[i].groupID) {
                group = databases.groups[i];
                break;
            }
        }

        for (let i = 0; i < group.ingredients.length; i++) {
            if (group.ingredients[i].name === data.ingredient) {
                group.ingredients[i].bringer = data.content;
            }
        }
    });

    socket.on('textbox_select', (data) => {
        io.to(groupID).emit('textbox_select', {ingredient: data.ingredient, name: socket.username});
    });
});

function sendUsersUpdate(groupID) {
	if (groupToSocket[groupID]) {
		io.to(groupID).emit('users_list', groupToSocket[groupID].map((s) => ({
			name: s.username						
		})));
	}
}

//// end socket connections/

server.listen(PORT, () => {
	console.log(`food-night listening at http://localhost:${PORT}`);
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
 *              responses: [<ints>]     - list of ints, 0 = no, 1 = yes, 2 = no (dietary), response.length = current index
 *              votingCompleted: false
 *          }
 *      ],
 *      recipe: string - name of recipe
 *      ingredients: [
 *          {
 *              name: string
 *              image: string -- url
 *              bringer: string - member name
 *          }
 *      ]
 *
 * recipe: - static
 *      recipeName: string - pk
 *      image: string -- url to image
 *      desc: string
 *      ingredients: [
 *          {
 *              name: string
 *              image: blob (or url)
 *          }
 *      ]
 */

app.get('/test/', (req, res) => {
	// group creation form
	res.send(databases);
});

const test = new Date(2021, 9, 23, 11, 00, 0);

let databases = {
    social_feed: [
        
    ],
	groups: [
		// push new groups into group id
		{
			groupID: '123',
			datetime: test.toString(),
			members: [
				{
					name: 'jiamae wang',
					phonenumber: '4256589553',
					email: 'jiamae@uw.edu',
					responses: [],
					votingCompleted: false,
				},
				{
					name: 'johnson kuang',
					phonenumber: '4252733269',
					email: 'jkuang7@uw.edu',
					responses: [],
					votingCompleted: false,
				},
				{
					name: 'allan dao',
					phonenumber: '2066437582',
					email: 'allandao@uw.edu',
					responses: [],
					votingCompleted: false,
				},
				{
					name: 'vishal devireddy',
					phonenumber: '4254991077',
					email: 'vishal@uw.edu',
					responses: [],
					votingCompleted: false,
				},
			],
			recipe: '',
			ingredients: [],
		},
	],
	recipes: JSON.parse(fs.readFileSync('recipes.json', 'utf-8'))['recipes'],
};

function getRecipeNames() {
	const recipes = databases['recipes'];
	let recipe_names = [];
	recipes.forEach((r) => {
		recipe_names.push(r.recipe_name);
	});
	return recipe_names;
}

function sendSMS(members, msg) {
	for (let i = 0; i < members.length; i++) {
		client.messages
			.create({
				body: msg,
				from: '+19857773832',
				to: `+1${members[i]['phonenumber']}`, // replace with receiver phone #
			})
			.then((message) => console.log(message.sid));
	}
}

function sendEmail(members, msg, subject) {    
    for (let i = 0; i < members.length; i++) {
        const mailOptions = {
            from: 'chicken.tinder.dubhacks@gmail.com',
            to: members[i].email,
            subject: subject,
            text: msg,
        };

		mail.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
	}
      
}
