const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000;

// app.get('/', (req, res) => {
// 	res.send('Hello World!');
// });

app.use(express.static('public'));

//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));

// Handle GET requests to /api route
app.get('/api', (req, res) => {
	let groups = {
		groupId: 'string',
		datetime: 'string',
		members: [
			{
				name: 'Allan',
				phone: 'string',
				email: 'string',
				dietary: [],
			},
			{
				name: 'Bob',
				phone: 'string',
				email: 'string',
				dietary: ['peanuts'],
			},
		],
	};
	let otherObject = { item1: 'item1val', item2: 'item2val' };
	res.json(
		{
			groups: groups,
			another: 'item',
		}
		// groups: [
		//     {
		//         groupId: "string",
		//         datetime: "string",
		//         members: [
		//         {
		//             name: "string",
		//             contact: "string",
		//             dietary: ["string"]
		//         },
		//         ],
		//         recipe: "string",
		//         ingredients: [
		//         {
		//             ingredientName: "string",
		//             bringer: "string"
		//         },
		//         ],
		//     },
		//     {
		//         groupId: "string",
		//         datetime: "string",
		//         members: [
		//         {
		//             name: "string",
		//             contact: "string",
		//             dietary: ["string"]
		//         },
		//         ],
		//         recipe: "string",
		//         ingredients: [
		//         {
		//             ingredientName: "string",
		//             bringer: "string"
		//         },
		//         ],
		//     }
		// ]
		// recipes: [
		//     {
		//         recipeName: "string",
		//         image: Blob,
		//         description: "string",
		//         ingredients: [
		//         {
		//             ingredientName: "string",
		//             image: Blob
		//         },
		//         ],
		//     },]
	);
});

app.listen(PORT, () => {
	console.log(`food-night-app listening at http://localhost:${PORT}`);
});
