'use strict';

const tinderContainer = document.querySelector('.tinder');
const nope = document.getElementById('nope');
const love = document.getElementById('love');

const groupID = 'ID_REPLACED_BY_EXPRESS';
const base_url = `https://localhost:8000`;

const urlParams = new URLSearchParams(window.location.search);
const memberName = urlParams.get('member');
let recipes = [];

let allCards = [];
addCard().then(() => {
	initCards();
	allCards = document.querySelectorAll('.tinder--card');
	setupSwipe();
});

function initCards(card, index) {
	var newCards = document.querySelectorAll('.tinder--card:not(.removed)');

	newCards.forEach(function (card, index) {
		card.style.zIndex = allCards.length - index;
		card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
		card.style.opacity = (10 - index) / 10;
	});

	tinderContainer.classList.add('loaded');
}

async function addCard() {
	const url = 'https://food-night-app.herokuapp.com/api/recipes';

	try {
		const response = await fetch(url);
		const isJson = response.headers.get('content-type')?.includes('application/json');
		const data = isJson && (await response.json());

		// check for error response
		if (!response.ok) {
			// get error message from body or default to response status
			const error = data?.message || response.status;
			throw error;
		}

		// const foodHTML = data.recipes.map((recipe) =>
		// 	`<div class="tinder--card">
		// 		<div style="background-image:url(${recipe.image_url})"></div>
		// 		<h3>${recipe.recipe_name}</h3>
		// 		<p></p>
		// 	</div>`
		// ).join('');
		// document.querySelector('.tinder--cards').insertAdjacentHTML('beforeend', foodHTML);
		for (let i = 0; i < data.recipes.length; i++) {
			let ingredients = data.recipes[i].ingredients[0].name;
			recipes = [...recipes, 0];
			for (let j = 1; j < data.recipes[i].ingredients.length; j++) {
				ingredients += ", " + data.recipes[i].ingredients[j].name;				
			}
			const foodHTML = `<div class="tinder--card" index=${i}>
				<div style="background-image:url(${data.recipes[i].image_url})"></div>
				<h3>${data.recipes[i].recipe_name}</h3>
				<p>${ingredients}</p>
			</div>`;
			document.querySelector('.tinder--cards').insertAdjacentHTML('beforeend', foodHTML);
		}
	} catch (error) {
		console.error('There was an error.', error);
	}
}

function setupSwipe() {
	for (let i = 0; i < allCards.length; i++) {
		let el = allCards[i];
		var hammertime = new Hammer(el);

		hammertime.on('pan', function (event) {
			el.classList.add('moving');
		});

		hammertime.on('pan', function (event) {
			if (event.deltaX === 0) return;
			if (event.center.x === 0 && event.center.y === 0) return;

			tinderContainer.classList.toggle('tinder_love', event.deltaX > 0);
			tinderContainer.classList.toggle('tinder_nope', event.deltaX < 0);

			var xMulti = event.deltaX * 0.03;
			var yMulti = event.deltaY / 90;
			var rotate = xMulti * yMulti;

			event.target.style.transform =
				'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';
		});

		hammertime.on('panend', function (event) {
			el.classList.remove('moving');
			// tinder_love and tinder_nope for overall container, not cards
			tinderContainer.classList.remove('tinder_love');
			tinderContainer.classList.remove('tinder_nope');

			var moveOutWidth = document.body.clientWidth;
			var keep = Math.abs(event.deltaX) < 60 || Math.abs(event.velocityX) < 0.4;

			event.target.classList.toggle('removed', !keep);

			if (keep) {
				event.target.style.transform = '';
			} else {
				var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
				var toX = event.deltaX > 0 ? endX : -endX;
				var endY = Math.abs(event.velocityY) * moveOutWidth;
				var toY = event.deltaY > 0 ? endY : -endY;
				var xMulti = event.deltaX * 0.03;
				var yMulti = event.deltaY / 80;
				var rotate = xMulti * yMulti;
				
				recipes[el.getAttribute("index")] = (toX > 0) ? 1 : 0; // right : left
				console.log(recipes);

				event.target.style.transform =
					'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
				initCards();
			}
		});
	}
}


function createButtonListener(love) {
	return function (event) {
		var cards = document.querySelectorAll('.tinder--card:not(.removed)');
		var moveOutWidth = document.body.clientWidth * 0.5;

		if (!cards.length) return false;

		var card = cards[0];

		card.classList.add('removed');

		if (love) {
			card.style.transform = 'translate(' + moveOutWidth + 'px, -100px) rotate(-30deg)';
		} else {
			card.style.transform = 'translate(-' + moveOutWidth + 'px, -100px) rotate(30deg)';
		}

		recipes[card.getAttribute("index")] = (love) ? 1 : 0; // right : left
		console.log(recipes);
		initCards();

		event.preventDefault();
	};
}

const nopeListener = createButtonListener(false);
const loveListener = createButtonListener(true);

nope.addEventListener('click', nopeListener);
love.addEventListener('click', loveListener);
