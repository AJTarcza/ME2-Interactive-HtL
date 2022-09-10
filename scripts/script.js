//Data structures for all of the tables
var defenderTable = ["legion", "samara", "tali", "mordin", "garrus", "miranda", "grunt", "jacob", "thane", "jack", "zaeed", "kasumi"];
var escortTable = [];
var shepSquadTable = [];
var missingTable = [];
var casualtyTable = [];

//Helper table for fetching a table's data structure using its unique id
const TABLE_LOOKUP = {
	[DEFENDER_TABLE_ID]: defenderTable, 
	[ESCORT_TABLE_ID]: escortTable, 
	[SHEP_SQUAD_TABLE_ID]: shepSquadTable, 
	[MISSING_TABLE_ID]: missingTable, 
	[CASUALTY_TABLE_ID]: casualtyTable
};

//Enum for whether or not a squadmate is alive
const Status = {
	ALIVE: "alive",
	DEAD: "dead"
}

//Path to images
const IMAGE_PATH = "images/Characters/";

/**
 Creates a filename for an image based on the character it is for and their status
 
 @params:
	id - The name of the character
	status - Whether or not the character is dead
*/
function createFilename(id, status) {
	//Capitalize the first letter of the ID
	const capID = id[0].toUpperCase() + id.substring(1);
	
	if(status === Status.ALIVE)
		return IMAGE_PATH + "Icon_" + capID + ".png";
	else
		return IMAGE_PATH + "Icon_" + capID + "_Dead.png";
}

/**
 Toggle's the loyalty of a squadmate to its opposite value
 
 @params:
	character - The character to toggle the loyalty for
*/
function toggleLoyalty(character) {
	const node = document.getElementById(character);
	const curState = node.getAttribute(LOYALTY_ATTR_ID);
	
	node.setAttribute(LOYALTY_ATTR_ID, curState === "true" ? "false" : "true");
}

/**
 Swaps the places of two containers in a table
 
 @params: 
	c1 - The first container
	c2 - The second container
*/
function swapContainers(c1, c2) {
	const afterc2 = c2.nextElementSibling;
    const parent = c2.parentNode;
    c1.replaceWith(c2);
    parent.insertBefore(c1, afterc2);
}

/**
 Rebalances the nodes in a given table so that all of the empty spaces are moved to the end
 
 @params:
	table - The table to be rebalanced
*/
function rebalanceTable(table) {
	//Fetch all of the containers in the table
	var containers = table.querySelectorAll(CONTAINER_CLASS);
	for(var i = 0; i < containers.length; i++) {
		var id = containers[i].querySelector("img").id;
		
		//We found an empty space
		if(id === EMPTY_ID) {
			var next = i < containers.length - 1 ? containers[i+1] : null;
			
			//If we aren't already at the end of the list then find then next non empty space
			if(next) {
				var idx = i;
				while(idx < containers.length && next.querySelector("img").id === EMPTY_ID)
					next = containers[idx++];
				
				//Swap the containers in the table
				swapContainers(containers[i], next);
				
				//Update the container list to reflect the swap
				containers = table.querySelectorAll(CONTAINER_CLASS);
			}
		}
	}
}

/**
 Sets the loyalty of all squadmates to a given value
 
 @params:
	value - The value to set the loyalty to
*/
function setAllLoyalty(value) {
	//Update the loyalty values
	var nodes = document.querySelectorAll(DRAG_CONTAINER_CLASS);
	nodes.forEach(node => {node.setAttribute(LOYALTY_ATTR_ID, value)});
	
	//Update the checkboxes to reflect the new values
	var checkboxes = document.querySelectorAll(CHECKBOX_CLASS);
	checkboxes.forEach(checkbox => {checkbox.checked = JSON.parse(value)});
	
}

/**
 Attach the event handlers for the loyalty buttons
*/
function attachButtonHandlers() {
	//Make all loyal button
	document.getElementById(LOYAL_BTN_ID).onclick = function () {
		setAllLoyalty("true");
		calculateScore();
	};
	
	//Make all disloyal button
	document.getElementById(DISLOYAL_BTN_ID).onclick = function () {
		setAllLoyalty("false");
		calculateScore();
	};
}

/**
 Programatically apply IDs to necessary elements
*/
function applyIDs() {
	//Assign image nodes
	var charIdx = 0;
	var tables = document.querySelectorAll(NODE_TABLE_CLASS);
	tables.forEach(table => {
		var imgs = table.querySelectorAll("img");
		imgs.forEach(img => {
			//By default, all of the characters are placed in the defender table and the rest of the tables are all empty
			if(table.getAttribute("id") === DEFENDER_TABLE_ID) {
				var id = defenderTable[charIdx];
				img.setAttribute("id", id);
				img.src = createFilename(id, Status.ALIVE);
				img.setAttribute("alt", id)
				img.setAttribute(LOYALTY_ATTR_ID, "true");
				charIdx++;
			}
			else {
				img.setAttribute("id", EMPTY_ID);
				img.setAttribute("alt", EMPTY_ID);
				img.src = createFilename(EMPTY_ID, Status.ALIVE);
			}
		});
		
	});
	
	//Character node IDs
	var idx = 0;
	var nodes = document.querySelectorAll(CHAR_NODE_CLASS);
	nodes.forEach(node => node.setAttribute("id", idx++));
	
	//Container IDs
	idx = 0;
	var containers = document.querySelectorAll(CONTAINER_CLASS);
	containers.forEach(container => container.setAttribute("id", CONTAINER_ID + idx++));
	
	//Checkbox IDs
	idx = 0;
	var checkboxes = document.querySelectorAll(CHECKBOX_CLASS);
	checkboxes.forEach(checkbox => {
		//Assign checkbox ID
		const character = defenderTable[idx++];
		const id = "chkbox-" + character;
		checkbox.setAttribute("id", id);
		
		//Set the checkbox's default value and assign it a click handler
		checkbox.checked = true;
		checkbox.onclick = function () {
			toggleLoyalty(character);
			calculateScore();
		};
		
		//Create a label for custom checkbox
		const label = document.createElement("label");
		label.setAttribute("class", INPUT_LABEL_ID);
		label.setAttribute("for", id);
		
		//Add the label to the 
		checkbox.parentNode.appendChild(label);
	});
	
}

/**
 Sets up various elements in the document
*/
function setup() {
	applyIDs();
	attachButtonHandlers();
	calculateScore();
}