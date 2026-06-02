// Functions to create all the navigation bars in the app, including vertical and horizontal ones
// Function to draw navigation bars
function createNavLink(link, text, context) {
    const a = document.createElement('a');
    a.href = link;
    a.innerHTML = text;
    if (context === text) {
        a.setAttribute('selected', '');
    }
    return a;
}

/**
 * Automatically draw vertical navigation bar with class 'vertical-nav' based on the current section and room context
 * @param {*} contextSection name of the current page section, e.g. 'lights', 'hvac', 'curtains'
 * @param {*} contextRoom name of the current room, e.g. 'bedroom', 'living_room', 'bathroom'.
 */
function drawVerticalNav(contextSection, contextRoom) {
    let center_content = document.getElementsByClassName('container')[0];
    const verticalNav = document.createElement('div');
    verticalNav.setAttribute('class', 'vertical-nav');
    const roomNav = document.createElement('div');
    roomNav.setAttribute('id', 'room-control');
    // add children nodes
    roomNav.appendChild(createNavLink('./html/light.html?room_name=' + contextRoom, 'lights', contextSection));
    roomNav.appendChild(createNavLink('./html/hvac.html?room_name=' + contextRoom, 'hvac', contextSection));
    roomNav.appendChild(createNavLink('./html/curtains.html?room_name=' + contextRoom, 'curtains', contextSection));
    // other sub menu
    const extraNav = document.createElement('div');
    extraNav.setAttribute('id', 'extra-control');
    // add children nodes
    extraNav.appendChild(createNavLink('./html/eco_mode.html?prev_room_name=' + contextRoom + '&prev_section=' + contextSection, 'eco_mode', contextSection));
    extraNav.appendChild(createNavLink('./html/eco_mode.html?prev_room_name=' + contextRoom + '&prev_section=' + contextSection, 'settings', contextSection));

    verticalNav.appendChild(roomNav);
    verticalNav.appendChild(extraNav);
    center_content.appendChild(verticalNav);
}

/**
 * Automatically draw horizontal navigation bar in div with class 'footer' based on the current section and room context
 * @param {*} contextSection name of the current page section, e.g. 'lights', 'hvac', 'curtains'
 * @param {*} contextRoom name of the current room, e.g. 'bedroom', 'living_room', 'bathroom'.
 */
function drawHorizontalNav(contextSection, contextRoom) {
    let footer = document.getElementsByClassName('footer');
    if (footer.length === 0) {
        console.error('No footer element found to append the horizontal navigation bar.');
        return;
    }
    footer = footer[0];
    // add children nodes
    footer.appendChild(createNavLink('./html/' + contextSection + '.html?room_name=bedroom', 'bedroom', contextRoom));
    footer.appendChild(createNavLink('./html/' + contextSection + '.html?room_name=living_room', 'living_room', contextRoom));
    footer.appendChild(createNavLink('./html/' + contextSection + '.html?room_name=bathroom', 'bathroom', contextRoom));
}

/**
 * Creates a "Go Back" button and appends it to the header of the page. When clicked, it navigates back to the previous section and room context.
 * @param {*} prevRoomName name of the previous room, e.g. 'bedroom', 'living_room', 'bathroom'.
 * @param {*} prevSection name of the previous page section, e.g. 'lights', 'hvac', 'curtains'.
 * @returns 
 */
function goBackButton(prevRoomName, prevSection) {
    let header = document.getElementsByClassName('header');
    if (header.length === 0) {
        console.error('No header element found to append the go back button.');
        return;
    }
    header = header[0];
    const button = document.createElement('button');
    button.innerHTML = 'Go Back';
    button.addEventListener('click', () => {
        window.location.href = `./html/${prevSection}.html?room_name=${prevRoomName}`;
    });
    header.appendChild(button);
}
