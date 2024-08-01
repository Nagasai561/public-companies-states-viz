let vw = window.innerWidth, vh = window.innerHeight;
const svg = d3.select("svg")

let svgContainer = d3.select("div#svg-container").node().getBoundingClientRect();
let svgWidth = svgContainer.width;
let svgHeight = svgContainer.height;


let colorScaleNumRects = 10;
let colorScaleLegendWidth, colorScaleLegendHeight;
let colorScaleLegendX, colorScaleLegendY;



let device;
if(vw > vh) {
	device = "pc";
} else {
	device = "mobile";
}
console.log(device)

// File paths
const boundaryJsonPath = "./processed_data/final_map.json";
// const boundaryJsonPath = "./minified/minified_map.json"
const companyDataPath = "./processed_data/final_file.csv";

let colorScaleExponent = 0.7;
let precision = 2;
let states = {};
let tooltip;
let showType = "value";
let colorOnFocus = "green";
let colorOfBoundary = "black";
let boundaryThickness = "1px";
let pathData;
let legend;
let colorFrom = "orange", colorTo = "red";
let scaleCount, scaleValue;
let colorScaleCount, colorScaleValue;
let countMax, countMin;
let marketcapMax, marketcapMin;


let dt = [];


d3.select("div#svg-container")
	.style("min-width", svgWidth + "px")
	.style("min-height", svgHeight + "px")





// entry point for the code.
function main() {

	tooltip = makeTooltip();
	makeButtonsInteractive();
	defineLegendValues();
	d3.json(boundaryJsonPath).then(pathData_ => {
		d3.csv(companyDataPath).then(companyData => {
			console.log("Succesfully loaded files");

			pathData = pathData_;
			fillStatesInfo(companyData);
			makeColorScales(companyData);
			drawMap(); // draw map should come after makeColorScales but before makeColorScaleLegend
			makeColorScaleLegend();
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
	
	colorScaleValue = d3.scalePow([marketcapMin, marketcapMax], [colorFrom, colorTo]).exponent(colorScaleExponent);
	colorScaleCount = d3.scalePow([countMin, countMax], [colorFrom, colorTo]).exponent(colorScaleExponent);
	if(device == "pc") {
		scaleCount = d3.scalePow([countMin, countMax], [0, colorScaleLegendHeight]).exponent(colorScaleExponent);
		scaleValue = d3.scalePow([marketcapMin, marketcapMax], [0, colorScaleLegendHeight]).exponent(colorScaleExponent);
	} else {
		scaleCount = d3.scalePow([countMin, countMax], [0, colorScaleLegendWidth]).exponent(colorScaleExponent);
		scaleValue = d3.scalePow([marketcapMin, marketcapMax], [0, colorScaleLegendWidth]).exponent(colorScaleExponent);
	}
}

function makeTooltip() {
	let tooltip = d3.select("body")
					.append("div")
					.attr("id", "tooltip")
					.style("display", "none");
	tooltip.append("div")
			.attr("class", "stateName");
	tooltip.append("div")
			.attr("class", "percent");
	tooltip.append("div")
			.attr("class", "absolute");
					

	console.log(`Successfully finished running makeTooltip`);

	return tooltip;
}

function buttonClicked(event) {
	console.log("Button click event triggered");
	showType = event.target.getAttribute("class");
	updateMap();
	updateColorScaleLegend();
}


function makeButtonsInteractive() {
	for(let elem of document.getElementsByTagName("button")) {
		elem.addEventListener("click", buttonClicked);
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
		};
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
        states[stateName].count += 1;
        totalContribution += contribution;
        totalCount += 1;
	}

	for(let state in states) {
		states[state].contributionPercent = states[state].contributionAbsolute/totalContribution;
		states[state].countRatio = states[state].count/totalCount;
	}
	console.log(`Successfully finished running fillStatesInfo`);

}

function drawMap() {
	let path;
	let ans = svgWidth*1.3;
	let diag = Math.sqrt(svgWidth*svgWidth + svgHeight*svgHeight);
	if(device == "pc") {
		path = d3.geoPath().projection(d3.geoMercator().center([79, 22]).translate([svgWidth/2, svgHeight/2]).scale(svgWidth*1.3));
	} else {
		path = d3.geoPath().projection(d3.geoMercator().center([82, 22]).translate([svgWidth/2, svgHeight*0.6]).scale(diag))
	}

	svg.selectAll("path")
	.data(pathData.features)
	.enter()
	.append("path")
	.attr("d", path)
	.attr("stroke", colorOfBoundary)
	.attr("stroke-width", boundaryThickness);

	showType = "value";
	updateMap();
	console.log(`Successfully finished running drawMap`);
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
		});
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
		.style("display", "block");

		tooltip.select("div.stateName")
				.text("State/UT name: " + stateName);
		tooltip.select("div.percent")
				.text(() => {
					if(showType == "count") return "As % of total: " + (states[stateName].countRatio*100).toFixed(precision) + " %";
					else return "As % of total: " + (states[stateName].contributionPercent*100).toFixed(precision) + " %";
				});
		tooltip.select("div.absolute")
				.text(() => {
					if(showType == "count") return "Absolute figure: " + states[stateName].count.toFixed(precision);
					else return "Absolute figure: " + states[stateName].contributionAbsolute.toFixed(precision) + " Cr";
				});
	})
	.on("mouseout", function(event, d) {
		let stateName = d.properties.NAME_1;
		d3.select(this)
		.attr("fill", () => {
			let v, c;
			if(showType == "count") {
				v = states[stateName].count;
				c = colorScaleCount(v);
			}
			else {
				v = states[stateName].contributionAbsolute;
				c = colorScaleValue(v);
			}
			return c;
		});
		tooltip.style("display", "none");
		
	})
	console.log(`Successfully finished running makeMapInteractive`)
}

function defineLegendValues() {
	if(device == "pc") {
		colorScaleLegendWidth = svgWidth/15, colorScaleLegendHeight = svgHeight/1.5;
		colorScaleLegendX = svgWidth/8, colorScaleLegendY = svgHeight/7;
	} else {
		colorScaleLegendWidth = svgWidth/1.5, colorScaleLegendHeight = svgHeight/15;
		colorScaleLegendX = svgWidth/6, colorScaleLegendY = svgHeight/10;
	}
}

function makeColorScaleLegend() {


	for(let i=0; i<=colorScaleNumRects; i++) dt.push(i);
	let h;
	if(device == "pc") h = Math.floor(colorScaleLegendHeight/colorScaleNumRects);
	else h = Math.floor(colorScaleLegendWidth/colorScaleNumRects);
	
	legend = d3.select("svg").append("g")
      .attr("transform", `translate(${colorScaleLegendX}, ${colorScaleLegendY})`);


	legend
	.selectAll("rect")
      .data(dt)
      .enter()
      .append("rect")
      .attr("width", () => {
		if(device == "pc") return colorScaleLegendWidth;
		else return h;
	  })
      .attr("height", () => {
		if(device == "pc") return h;
		else return colorScaleLegendHeight;
	  })
      .attr("x", (d, j) => {
			if(device == "pc") return 0;
			else return h*j
		}) 
      .attr("y", (d, j) => {
		if(device == "pc") return h * j;
		else return 0;
	  });

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
		.attr("fill", (d, j) => colorScale((mx/colorScaleNumRects)*j));

	console.log(device)
	if(device == "pc") {
		legend
			.call(d3.axisLeft(scale).tickFormat((d) => {
				if(showType == "count") return d;
				else return formatIndianCurrency(d);
			}));
	} else {
		legend
			.call(d3.axisTop(scale).tickFormat((d) => {
				if(showType == "count") return d;
				else return d/100000 + " Lakh Cr";
			}).ticks(6));
	}

}

function formatIndianCurrency(number) {
	let numStr = number.toString();
    let lastThree = numStr.substring(numStr.length - 3);
    let otherNumbers = numStr.substring(0, numStr.length - 3);
    if(otherNumbers != '') {
        lastThree = ',' + lastThree;
    }
    let formattedNumber = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return formattedNumber + " Cr";
}

main();