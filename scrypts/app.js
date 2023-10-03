'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/*page */
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1:document.querySelector('.h1'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar')
	},
	content: {
		daysContainer: document.getElementById('days'),
		nextDay: document.querySelector('.habbit__day')
	},
	popup: {
		popUpCover: document.querySelector('.cover'),
		iconField: document.querySelector('.popup__form input[name="icon"]')
	}
}

/* utils */

function loadData() {
	const habbitsString = localStorage.getItem(HABBIT_KEY);
	const habbitArray = JSON.parse(habbitsString);
	if (Array.isArray(habbitArray)) {
		habbits = habbitArray;
	}
}

function saveData() {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits))
}

/*render */
function rerenderMenu(activeHabbit) {
	document.querySelector('.menu__list').innerHTML = '';
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
		if(!existed) {
			//создание
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}"/>`;			
			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu__item_active');
			}
			page.menu.appendChild(element);
			continue;

		}
		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu__item_active');
		} else {
			existed.classList.remove('menu__item_active');
		}
	}
}

function rerenderHead(activeHabbit) {
	page.header.h1.innerText = activeHabbit.name;
	const progress = activeHabbit.days.length / activeHabbit.target > 1
		? 100
		: activeHabbit.days.length / activeHabbit.target * 100;	
	page.header.progressPercent.innerText = progress.toFixed(0) + '%';
	page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`)
}

function rerenderContent(activeHabbit) {
	page.content.daysContainer.innerHTML = '';
	for (const index in activeHabbit.days) {
		const element = document.createElement('div');
		element.classList.add('habbit');
		element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
              <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
              <button class="habbit__delete" onclick="deleteDay(${index})">
                <img src="./images/delete.svg" alt="Удалить день ${index + 1}" />
              </button>`;
		page.content.daysContainer.appendChild(element);
	}
	page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;
	const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
	if (!activeHabbit) {
		return;
	};
	document.location.replace(document.location.pathname + '#' + activeHabbitId);
	rerenderMenu(activeHabbit);
	rerenderHead(activeHabbit);
	rerenderContent(activeHabbit);
}

/* work with days */
function addDays(event) {
	const form = event.target;
	event.preventDefault();
	const data = new FormData(form);
	const comment = data.get('comment');
	form['comment'].classList.remove('error');
	if (!comment) {
		form['comment'].classList.add('error')
	}
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment }])
			}
		}
		return habbit;
	})
	
	form['comment'].value = '';
	rerender(globalActiveHabbitId);
	saveData();
}

function deleteDay(index) {
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days
			};
		}
		return habbit;
	});
	rerender(globalActiveHabbitId);
	saveData();
}

function togglePopup() {
	page.popup.popUpCover.classList.contains('cover_hidden') 
	? page.popup.popUpCover.classList.remove('cover_hidden') 
	: page.popup.popUpCover.classList.add('cover_hidden')	
}

function addHabbit(event) {
	console.log(event)
	event.preventDefault();
	const form = event.target;
	const data = new FormData(form);
	const name = data.get('name');
	const target = data.get('target');
	habbits.push({
		"id": habbits.length+1,
		"icon": document.querySelector('.icon.icon_active')['name'],
		"name": name,
		"target": target,
		"days": []
	})
	
	rerender(habbits.length);
	togglePopup();
	saveData();
}


/* Working with habbits */

function setIcon(context, icon) {
	page.popup.iconField.value = icon;
	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');
	context.classList.add('icon_active')
}
/* init */
(() => {
	loadData();
	loadData();
	const hashId = Number(document.location.hash.replace('#', ''));
	const urlHabbit = habbits.find(habbit => habbit.id == hashId);
	if (urlHabbit) {
		rerender(urlHabbit.id);
	} else {
		rerender(habbits[0].id);
	}
})();