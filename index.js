const width = 1000, height = 700;
const boundaryJsonPath = "./fetched_data/india_state_ut_administered.geojson";
const companyDataPath = "./processed_data/final_file.csv"


let states = {};
let tooltip;
let infobox;
let coreCheckboxes = document.getElementsByClassName("core");
let optionalCheckbox = document.querySelector("input.option")
let showType = "value";
let colorOnFocus = "green";
let colorOfBoundary = "black";
let boundaryThickness = "1px";
let pathData;
let outlierState = "Maharashtra";

const colorScale = d3.scaleSequential(d3.interpolatePurples)
const svg = d3.select("body")
				.append("svg")
				.attr("width", width)
				.attr("height", height)


// entry point for the code.
function main() {

	tooltip = makeTooltip();
	makeCheckboxesInteractive();
	d3.json(boundaryJsonPath).then(pathData_ => {
		d3.csv(companyDataPath).then(companyData => {
			pathData = pathData_
			console.log("Succesfully loaded files")
			fillStatesInfo(companyData);
			drawMap();
			makeMapInteractive();
	
		}) 
	})
	infobox = makeInfoBox();
	
}

function makeTooltip() {
	let tooltip = d3.select("body")
					.append("div")
					.attr("id", "tooltip")
					.style("display", "none")
					.text("Hello")
					

	console.log(`Successfully finished running makeTooltip`)

	return tooltip;
}

function checkboxChanged(event) {
	console.log("checkboxChanged event triggered")
	let cb = event.target;
	if((coreCheckboxes[0].checked) && (coreCheckboxes[1].checked)) {
		if(coreCheckboxes[0] == cb) coreCheckboxes[1].checked = false;
		else coreCheckboxes[0].checked = false;
	}
	let base = "";
	for(let elem of coreCheckboxes) {
		if(elem.checked) base += elem.value;
	}
	if(optionalCheckbox.checked) base += "_";

	showType = base;
	updateMap();
}

function makeCheckboxesInteractive() {
	for(let elem of coreCheckboxes) {
		if(elem.value == showType) elem.checked = true;
		elem.addEventListener("change", checkboxChanged)
	}
	optionalCheckbox.addEventListener("change", checkboxChanged);
}


function fillStatesInfo(companyData) {
	for(let elem of pathData.features) {
		let stateName = elem.properties.NAME_1;
		states[stateName] = {
			contributionAbsolute: 0,
			contributionPercent: 0,
			count: 0,
			countRatio: 0,
			contributionPercent_: 0,
			countRatio_: 0
		}
	}

	let totalContribution = 0;
	let totalCount = 0;
	for(let data of companyData) {
		if(data["State"] == "") {
			continue;
		}
		let stateName = data["State"];
		let contribution = Number(data["Market Cap"]);
		states[stateName].contributionAbsolute += contribution;
		states[stateName].count += 1
		totalContribution += contribution;
		totalCount += 1;
	}

	for(let state in states) {
		states[state].contributionPercent = states[state].contributionAbsolute/totalContribution;
		states[state].countRatio = states[state].count/totalCount;
		if(state != outlierState) {
			states[state].contributionPercent_ = states[state].contributionAbsolute/(totalContribution-states[outlierState].contributionAbsolute);
			states[state].countRatio_ = states[state].count/(totalCount-states[outlierState].count)
		}
	}
	console.log(states)
	console.log(`Successfully finished running fillStatesInfo`)

}

function drawMap() {
	const path = d3.geoPath().projection(d3.geoMercator().translate([-width/2, 700]).scale(800))
	svg.selectAll("path")
	.data(pathData.features)
	.enter()
	.append("path")
	.attr("d", path)
	.attr("stroke", colorOfBoundary)
	.attr("stroke-width", boundaryThickness)

	showType = "value";
	updateMap();
	console.log(`Successfully finished running drawMap`)
}

function updateMap() {
	svg.selectAll("path")
		.data(pathData.features)
		.attr("fill", d => {
			let stateName = d.properties.NAME_1;
			let v;
			if(showType == "count") v = states[stateName].countRatio;
			else if(showType == "value") v = states[stateName].contributionPercent;
			else if(showType == "count_") v =  states[stateName].countRatio_;
			else if(showType == "value_") v = states[stateName].contributionPercent_;
			else v = 0;
			return colorScale(v);
		})
}

function makeMapInteractive() {
	svg.selectAll("path")
	.data(pathData.features)
	.on("mouseover", function (event, d) {
		let stateName = d.properties.NAME_1;
		if((showType != "_") && (showType != "")) {
			d3.select(this)
				.attr("fill", colorOnFocus);
			const bbox = this.getBBox();
			tooltip.style("left", bbox.x + 20 + "px")
			.style("top", bbox.y - 20 + "px" )
			.style("display", "inline")
			.text(() => {
				let a, r;
				if((showType == "count")) {
					a = states[stateName].count;
					r = states[stateName].countRatio;
				}
				else if(showType == "count_") {
					a = states[stateName].count;
					r = states[stateName].countRatio_;
				}
				else if(showType == "value") {
					a = states[stateName].contributionAbsolute;
					r = states[stateName].contributionPercent;
				}
				else if(showType == "value_") {
					a = states[stateName].contributionAbsolute;
					r = states[stateName].contributionPercent_;
				}
				return `${stateName} \n ${r.toFixed(2)} \n ${a}`;
			})
		}
	})
	.on("mouseout", function(event, d) {
		let stateName = d.properties.NAME_1;
		if((showType != "_") && (showType != "")) {
			d3.select(this)
			.attr("fill", () => {
				let v;
				if(showType == "count") v = states[stateName].countRatio;
				else if(showType == "count_") v = states[stateName].countRatio_;
				else if(showType == "value") v = states[stateName].contributionPercent;
				else if(showType == "value_") v = states[stateName].contributionPercent_;
				return colorScale(v);
			});
			tooltip.style("display", "none");
		}
	})
	console.log(`Successfully finished running makeMapInteractive`)
}

function makeInfoBox() {
	return 1;
}


main()