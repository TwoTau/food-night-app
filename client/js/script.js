// add a friend on button click
const addFriendButton = document.querySelector('.add-friend');
function addFriend() {
	const friendHtml = `<div class="friend">
		<input class="member-name" type="text" placeholder="Name">
		<input class="member-email" type="email" placeholder="Email">
		<input class="member-phone" type="tel" name="phone" placeholder="123-456-6789"
			pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
		<button class="remove-friend">x</button>
	</div>`;
	document.querySelector('.party-members').insertAdjacentHTML('beforeend', friendHtml);
}
addFriend(); // add first friend
addFriendButton.addEventListener('click', addFriend);

// parse form into data Object. TODO: error handling and empty field handling
function parseForm() {
	return {
		partyName: document.getElementById('party-name').value,
		date: document.getElementById('date').value,
		time: document.getElementById('time').value,
		members: [...document.querySelectorAll('.party-members > *')].map((div) => ({
			name: div.querySelector('.member-name').value,
			phone: div.querySelector('.member-phone').value,
			email: div.querySelector('.member-email').value,
		})),
	};
}

// remove friend buttons
document.querySelector('.party-members').addEventListener('click', (e) => {
	if (e.target.classList.contains('remove-friend')) {
		e.target.parentElement.remove();
	}
});

// handle create party button
document.querySelector('.create-party').addEventListener('click', () => {
	const parsed = parseForm();
	const json = JSON.stringify(parsed);
	console.log(parsed, json);
});
