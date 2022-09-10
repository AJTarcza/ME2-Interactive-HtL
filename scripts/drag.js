/**
 Enables dropping
 
 @params:
	ev - The event
*/
function allowDrop(ev) {
	ev.preventDefault();
}

/**
 Handles dragging a draggable object
 
 @params:
	ev - The drag event
*/
function drag(ev) {
	ev.dataTransfer.setData("src", ev.target.id);
}

/**
 Handles dropping of a draggable object
 
 @params:
	ev - The drop event
*/
function drop (ev) {
	ev.preventDefault();
	
	//Fetch the source and target nodes
	var src = document.getElementById(ev.dataTransfer.getData("src"));
	var srcParent = src.parentNode;
	var tgt = ev.currentTarget.firstChild;

	var srcId = src.firstChild.getAttribute("id");
	var tgtId = tgt.firstChild.getAttribute("id");
	
	//If we tried to move a node to itself then just return since nothing will change
	if(srcId === tgtId)
		return;

	//Find the id of the src node's table
	var srcTable = src;
	while(srcTable.tagName.toLowerCase() != "table")
		srcTable = srcTable.parentNode;
	var srcArr = TABLE_LOOKUP[srcTable.getAttribute("id")];
	
	//Find the id of the tgt node's table
	var tgtTable = tgt;
	while(tgtTable.tagName.toLowerCase() != "table")
		tgtTable = tgtTable.parentNode;
	var tgtArr = TABLE_LOOKUP[tgtTable.getAttribute("id")];

	//Indices of the src and tgt in their respective arrays
	const srcIndex = srcArr.indexOf(srcId);
	const tgtIndex = tgtArr.indexOf(tgtId);
	
	//If we are just moving items around in the same table then don't even bother swapping them, just continue on
	if(srcArr != tgtArr) {
		//Swap the items in their respective arrays (unless it was an empty space then just ignore it)
		if(srcIndex > -1) {
			srcArr.splice(srcIndex, 1);
			tgtArr.push(srcId);
		}
		if(tgtIndex > -1) {
			tgtArr.splice(tgtIndex, 1);
			srcArr.push(tgtId);
		}
	}
	
	//If src node was moved to the missing table then change its image to the dead variant
	if(tgtArr === missingTable)
		src.firstChild.src = createFilename(srcId, Status.DEAD);
	else
		src.firstChild.src = createFilename(srcId, Status.ALIVE);
	
	//If tgt node was moved to the missing table then change its image to the dead variant
	if(srcArr === missingTable)
		tgt.firstChild.src = createFilename(tgtId, Status.DEAD);
	else
		tgt.firstChild.src = createFilename(tgtId, Status.ALIVE);

	//Swap the nodes
	ev.currentTarget.replaceChild(src, tgt);
	srcParent.appendChild(tgt);
	
	//If we moved a node to/from the larger tables, then rebalance the nodes so that all of the empty spaces are moved to the end of the table
	if(srcArr === defenderTable || srcArr === missingTable)
		rebalanceTable(srcTable);
	if(tgtArr === defenderTable || tgtArr === missingTable)
		rebalanceTable(tgtTable);
	
	//Recalculate the scores
	calculateScore();
}