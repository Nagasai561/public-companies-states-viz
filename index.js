// svg 
const width = 1000, height = 700;

// Legend
const colorScaleLegendWidth = 50, colorScaleLegendHeight = 500;
const colorScaleLegendX = 100, colorScaleLegendY = 100;
const colorScaleNumRects = 20;

// File paths
const boundaryJsonPath = "./fetched_data/india_state_ut_administered.geojson";
const companyDataPath = "./processed_data/final_file.csv"


let states = {};
let tooltip;
let checkboxes = document.getElementsByTagName("input");
let showType = "value";
let colorOnFocus = "green";
let colorOfBoundary = "black";
let boundaryThickness = "1px";
let pathData;
let legend;

let scaleCount, scaleValue;
let colorScaleCount, colorScaleValue;
let countMax, countMin;
let marketcapMax, marketcapMin;


let dt = [];
for(let i=0; i<colorScaleNumRects; i++) dt.push(i);
let h = Math.floor(colorScaleLegendHeight/colorScaleNumRects);

const svg = d3.select("body")
				.append("svg")
				.attr("width", width)
				.attr("height", height)


// entry point for the code.
function main() {

	tooltip = makeTooltip();
	makeCheckboxesInteractive();
	document.querySelector("input.value").checked = true;
	d3.json(boundaryJsonPath).then(pathData_ => {
		d3.csv(companyDataPath).then(companyData => {
			console.log("Succesfully loaded files")

			pathData = pathData_
			fillStatesInfo(companyData);
			makeColorScales(companyData);
			makeColorScaleLegend();
			drawMap();
			makeMapInteractive();
		}) 
	})	
}

function makeColorScales() {
	marketcapMax = -1;
	marketcapMin = 100000000;
	
	countMax = -1;
	countMin = 10000000;

	for(let state in states) {
		let currMarketCap = states[state].contributionAbsolute;
		let currCount = states[state].count;
		marketcapMax = Math.max(marketcapMax, currMarketCap);
		marketcapMin = Math.min(marketcapMin, currMarketCap);
		countMax = Math.max(countMax, currCount);
		countMin = Math.min(countMin, currCount);
	}	
	
	scaleCount = d3.scaleSqrt([countMin, countMax], [0, colorScaleLegendHeight]);
	scaleValue = d3.scaleSqrt([marketcapMin, marketcapMax], [0, colorScaleLegendHeight]);
	colorScaleValue = d3.scaleSqrt([marketcapMin, marketcapMax], ["orange", "red"]);
	colorScaleCount = d3.scaleSqrt([countMin, countMax], ["orange", "red"]);
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
	for(let elem of checkboxes) {
		if((elem.checked == true) && (elem != cb)) {
			elem.checked = false;
		}
	}

	showType = cb.getAttribute("class");
	updateMap();
	updateColorScaleLegend();
}

function makeCheckboxesInteractive() {
	for(let elem of checkboxes) {
		if(elem.value == showType) elem.checked = true;
		elem.addEventListener("change", checkboxChanged)
	}
}


function fillStatesInfo(companyData) {
	for(let elem of pathData.features) {
		let stateName = elem.properties.NAME_1;
		states[stateName] = {
			contributionAbsolute: 0,
			contributionPercent: 0,
			count: 0,
			countRatio: 0
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
	}
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
			let v, c;
			if(showType == "count") {
				v = states[stateName].count;
				c = colorScaleCount(v);	
			}
			else {
				v = states[stateName].contributionAbsolute;
				c = colorScaleValue(v)
			}
			return c;
		})
}

function makeMapInteractive() {
	svg.selectAll("path")
	.data(pathData.features)
	.on("mouseover", function (event, d) {
		let stateName = d.properties.NAME_1;
		const bbox = this.getBBox();
		
		d3.select(this)
		.attr("fill", colorOnFocus);
		
		tooltip.style("left", bbox.x + 20 + "px")
		.style("top", bbox.y - 20 + "px" )
		.style("display", "inline")
		.text(() => {
			let a, r;
			if((showType == "count")) {
				a = states[stateName].count;
				r = states[stateName].countRatio;
			}
			else {
				a = states[stateName].contributionAbsolute;
				r = states[stateName].contributionPercent;
			}
			return `${stateName} \n ${r.toFixed(2)} \n ${a}`;
		})
		
	})
	.on("mouseout", function(event, d) {
		let stateName = d.properties.NAME_1;
		d3.select(this)
		.attr("fill", () => {
			let v, c;
			if(showType == "count") {
				v = states[stateName].countRatio;
				c = colorScaleCount(v);
			}
			else {
				v = states[stateName].contributionPercent;
				c = colorScaleValue(v);
			}
			return c;
		});
		tooltip.style("display", "none");
		
	})
	console.log(`Successfully finished running makeMapInteractive`)
}

function makeColorScaleLegend() {
	
	legend = d3.select("svg").append("g")
      .attr("transform", `translate(${colorScaleLegendX}, ${colorScaleLegendY})`);


	legend
	.selectAll("rect")
      .data(dt)
      .enter()
      .append("rect")
      .attr("width", colorScaleLegendWidth)
      .attr("height", h)
      .attr("x", 0) // Set x to 0 within the group
      .attr("y", (d, j) => h * j)  // Calculate y based on index

	updateColorScaleLegend();

}

function updateColorScaleLegend() {
	let colorScale, scale, mx;
	if(showType == "count") {
		colorScale = colorScaleCount;
		scale = scaleCount;
		mx = countMax;
	}
	else {
		colorScale = colorScaleValue;
		scale = scaleValue;
		mx = marketcapMax;
	}

	legend
		.selectAll("rect")
		.data(dt)
		.attr("fill", (d, j) => colorScale((mx/colorScaleNumRects)*j))

	legend
		.call(d3.axisLeft(scale));
}

main()