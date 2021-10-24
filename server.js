const fs = require('fs');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;

const accountSid = 'AC0b45470f1e594b28e20b952e23ab4603';
const authToken = 'ce37c0ac370bf5390878315b890bbae1';

const client = require('twilio')(accountSid, authToken);
const domain = 'http://localhost:8000';

app.use(cors());

app.use(express.json());

app.use(express.static('client'));

app.post('/groupcreation/', (req, res, next) => {
	const formdata = req.body();
	let memberData = formdata['members']; // TODO: change to front end response
	members = [];
	for (let i = 0; i < memberNames.length; i++) {
		let member = memberData[i];
		member['response'] = [];
		member['votingCompleted'] = false;
	}

	const groupID = uuidv4().replaceAll('-', '').substring(0, 8);

	let newGroup = {
		groupID: groupID,
		partyName: formdata['partyName'],
		datetime: formdata['datetime'],
		members: members,
		recipe: '',
		ingredients: [],
	};

	databases['groups'] = [...databases['groups'], newGroup];

	// create unique url
	const url = `${domain}/party/${groupID}/recipes`;

	// send group creation text to members of the group
	sendSMS(
		members,
		`You have been invited to ${formdata['partyName']} happening on ${formdata['datetime']}!\n
    \n Please vote on the recipe that you will be making at your next food night by going to this link: ${url}`
	);

	// TODO: send group creation email to the members of the group
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

	const url = `${domain}/party/${groupID}/ingredients/`;

	sendSMS(
		group.members,
		`The votes are in and you have decided to make ${max_recipe}! But before your fun food adventure can begin, we need a little more information from you!
    Please navigate to the following link and distribute the recipe ingredients to truly get your party started: ${url}`
	);
});

app.get('/party/:groupID/ingredients', (req, res) => {
	// serve ingredients page to the user
});

app.post('/party/:groupID/ingredients', (req, res) => {
	const groupID = req.params.groupID;
	const data = res.body();

	// get group
	let group = null;
	// find group
	for (let i = 0; i < databases.groups.length; i++) {
		if (groupID === databases.groups[i].groupID) {
			group = databases.groups[i];
			break;
		}
	}

	group.ingredients = data['ingredients'];

	// check if ingredients completed
	for (let i = 0; i < group.ingredients.length; i++) {
		if (group.ingredients[i] === null) {
			return;
		}
	}

	// all ingredients distributed - send texts
	let msg = `The recipe is chosen, the ingredients distributed, and the party is about to start. \n
    \n            
    Please refer below for who is bringing what:\n`;

	group.ingredients.forEach((i) => {
		msg += `\t${i.name}: ${i.bringer}\n`;
	});

	msg += '\nHave a great food night!';

	sendSMS(group.members, msg);
});

// requires page will make 2 calls,
//      1. /:groupID/finalinvite for party information
//      2. /recipe?recipe_name=<name> for recipe information
app.get('/party/:groupID/invite/', (req, res) => {});

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

// get final invite information
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

app.listen(PORT, () => {
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
