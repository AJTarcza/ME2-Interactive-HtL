//Base score for each squadmate
const BASE_VALUES = {
	"legion": 1,
	"samara": 1, 
	"tali": 0, 
	"mordin": 0, 
	"garrus": 3, 
	"miranda": 1, 
	"grunt": 3, 
	"jacob": 1, 
	"thane": 1, 
	"jack": 0, 
	"zaeed": 3, 
	"kasumi": 0
};

//Casualty lookup table based on how many defenders are present
const CASUALTY_LOOKUP = {
	"5+": [0, 1, 2, 3],
	"4":  [0, 1, 2, 3, 4],
	"3":  [0, 1, 2, 3],
	"2":  [0, 1, 2],
	"1":  [0, 1]
};

//Priority list for defender casualties
const PRIORITY_LIST = ["mordin", "tali", "kasumi", "jack", "miranda", "jacob", "garrus", "samara", "legion", "thane", "zaeed", "grunt"];

/**
 Returns the loyalty status of a given squadmate
 
 @params:
	squadmate - The squadmate to be checked
*/
function isLoyal(squadmate) {
	return document.getElementById(squadmate).getAttribute(LOYALTY_ATTR_ID) === "true" ? "true" : "false";
}

/**
 Returns the average defense score of a given list of defenders
 
 @params:
	squadList - the list of squadmembers to calculate the average value for
*/
function getAverage(squadList) {
	var sum = 0;
	squadList.forEach(squadmate => {sum += BASE_VALUES[squadmate.toLowerCase()] + (isLoyal(squadmate) === "true" ? 1 : 0)});
	
	return (sum / squadList.length).toFixed(2);
}

/**
 Uses the casualty lookup table to calculate how many defenders will die
 
 @params:
	numDefenders - The number of defenders
	avg - The avg defense score of the defenders
*/
function getDefenderCasualties(numDefenders, avg) {
	if(numDefenders >= 5) {
		switch(true) {
			case avg >= 2.0:
				return CASUALTY_LOOKUP["5+"][0];
			case avg >= 1.5 && avg < 2.0:
				return CASUALTY_LOOKUP["5+"][1];
			case avg >= 0.5 && avg < 1.5:
				return CASUALTY_LOOKUP["5+"][2];
			case avg >= 0.0 && avg < 0.5:
				return CASUALTY_LOOKUP["5+"][3];
		}
	}
	else {
		switch(numDefenders) {
			case 4:
				switch(true) {
					case avg >= 2.0:
						return CASUALTY_LOOKUP["4"][0];
					case avg > 1.0 && avg < 2.0:
						return CASUALTY_LOOKUP["4"][1];
					case avg >= 0.5 && avg <= 1.0:
						return CASUALTY_LOOKUP["4"][2];
					case avg > 0.0 && avg < 0.5:
						return CASUALTY_LOOKUP["4"][3];
					case avg == 0.0:
						return CASUALTY_LOOKUP["4"][4];
			case 3:
				switch(true) {
					case avg >= 2.0:
						return CASUALTY_LOOKUP["3"][0];
					case avg >= 1.0 && avg < 2.0:
						return CASUALTY_LOOKUP["3"][1];	
					case avg > 0.0 && avg < 1.0:
						return CASUALTY_LOOKUP["3"][2];
					case avg == 0.0:
						return CASUALTY_LOOKUP["3"][3];
				}
			case 2:
				switch(true) {
					case avg >= 2.0:
						return CASUALTY_LOOKUP["2"][0];
					case avg > 0.0 && avg < 2.0:
						return CASUALTY_LOOKUP["2"][1];
					case avg == 0.0:
						return CASUALTY_LOOKUP["2"][2];
				}
			case 1:
				switch(true) {
					case avg >= 2.0:
						return CASUALTY_LOOKUP["1"][0];
					case avg >= 0.0 && avg < 2.0:
						return CASUALTY_LOOKUP["1"][1];		
				}
			}
		}
	}
}

/**
 Calculates the 'hold the line' score and casualty list for the document and displays that information to the user
*/
function calculateScore() {
	//Clear the casualty table
	casualtyTable = [];
	
	//A setup is only valid if Shepard's squad is filled
	var isValidSetup = shepSquadTable.length == 2 ? true : false;
	
	//Only calculate casualties if the setup is valid
	if(isValidSetup) {
		//Calculate the average defense score
		const avg = getAverage(defenderTable);
		document.getElementById(DEFENSE_SCORE_ID).innerHTML = "Defense Score: " + avg;
		
		//Crew Escort status
		if(escortTable.length == 1 && isLoyal(escortTable[0]) === "false") {
			casualtyTable.push(escortTable[0]);
		}
		
		//Shepard squadmate 1 status
		if(isLoyal(shepSquadTable[0]) === "false") {
			casualtyTable.push(shepSquadTable[0]);
		}
		
		//Shepard squadmate 2 status
		if(isLoyal(shepSquadTable[1]) === "false") {
			casualtyTable.push(shepSquadTable[1]);
		}
		
		//Get the number of defender casualties
		const defenderCasualties = getDefenderCasualties(defenderTable.length, avg);
		
		if(defenderCasualties > 0) {
			//List of defenders ordered based on both the priority list and their loyalty status
			var orderedDefenders = [];
			
			//Add unloyal squadmates based on their place in the priority list
			PRIORITY_LIST.forEach(character => {
				if(defenderTable.includes(character) && isLoyal(character) === "false")
					orderedDefenders.push(character);
			});
			
			//Add loyal squadmates based on their place in the priority list
			PRIORITY_LIST.forEach(character => {
				if(defenderTable.includes(character) && isLoyal(character) === "true")
					orderedDefenders.push(character);
			});
			
			//Push the ordered list to the casualty table
			for(var i = 0; i < defenderCasualties; i++) {
				casualtyTable.push(orderedDefenders[i]);
			}
		}

	}
	else {
		document.getElementById(DEFENSE_SCORE_ID).innerHTML = "";
	}
	
	//Clear the casualty table
	var casTable = document.getElementById(CASUALTY_TABLE_ID);
	casTable.innerHTML = "";
	
	//Create a fresh row for the casualty table
	var casualtyRow = document.createElement("tr");
	casualtyRow.setAttribute("class", NODE_ROW_ID);

	//If there are any casualties then add their images to the casualty row, otherwise display an empty cell
	if(casualtyTable.length > 0) {
		for(var i = 0; i < casualtyTable.length; i++) {
			//Create a character node for the table
			var td = document.createElement("td");
			td.setAttribute("class", CHAR_NODE_ID);
			
			//Create a character node for the table
			var img = document.createElement("img");
			img.setAttribute("class", CASUALTY_CONTAINER_ID);
			img.setAttribute("draggable", false);
			img.src = createFilename(casualtyTable[i], Status.DEAD);
			
			//Add the element to the casualty row
			td.appendChild(img);
			casualtyRow.appendChild(td);
		}
	}
	else {
		//Only display the empty cell if the setup is valid
		if(isValidSetup) {
			//Create a character node for the table
			var td = document.createElement("td");
			td.setAttribute("class", CHAR_NODE_ID);
			
			//Create an empty image node
			var img = document.createElement("img");
			img.setAttribute("class", CASUALTY_CONTAINER_ID);
			img.src = createFilename(EMPTY_ID, Status.DEAD);
			
			//Add the element to the casualty row
			td.appendChild(img);
			casualtyRow.appendChild(td);
		}
	}
	
	//Only show the casualty headers if the setup is valid
	if(isValidSetup)
		document.getElementById(CASUALTY_HEADER_ID).style.display = "";
	else
		document.getElementById(CASUALTY_HEADER_ID).style.display = "none";
	
	//Update the casualty table
	casTable.appendChild(casualtyRow);
}