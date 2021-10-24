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

// remove friend buttons
document.querySelector('.party-members').addEventListener('click', (e) => {
	if (e.target.classList.contains('remove-friend')) {
		e.target.parentElement.remove();
	}
});

// parse form into data Object. TODO: error handling and empty field handling
function parseForm() {
	const date = document.getElementById('date').value;
	const time = document.getElementById('time').value;
	const partyName = document.getElementById('party-name').value;
	if (!partyName || !date || !time) {
		alert('Fields not filled out. Aborting');
		return null;
	}
	return {
		partyName,
		date: `${date} ${time}`,
		members: [...document.querySelectorAll('.party-members > *')].map((div) => ({
			name: div.querySelector('.member-name').value,
			phone: div.querySelector('.member-phone').value,
			email: div.querySelector('.member-email').value,
		})).filter(x => x.name && (x.phone || x.email)),
	};
}

// handle create party button
document.querySelector('.create-party').addEventListener('click', async () => {
	const parsed = parseForm();
	if (parsed !== null) {
		const json = JSON.stringify(parsed);
		console.log(parsed, json);

		const response = await fetch('/groupcreation/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			body: json,
		});
		console.log('Response', await response.json());		
	}	
	showPopUp();
	setTimeout(() => {hidePopUp()}, 2500);
});

function showPopUp() {
	document.querySelector('#pop-up').style.visibility = "visible";
	document.querySelector('#pop-up').style.display = "block";
}

function hidePopUp() {
	document.querySelector('#pop-up').style.visibility = "hidden";
	document.querySelector('#pop-up').style.display = "none";
}