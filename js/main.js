/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.6 - D3 Brushes
*/

// global variables
let lineChart
let donutChart1
let donutChart2
let timeline
let filteredData = {}
let donutData = []
//const color = d3.scaleOrdinal(d3.schemePastel1)
const color = d3.scaleOrdinal(d3.schemeCategory10)

// time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")

// event listeners
$("#season-select").on("change", updateCharts)
$("#var-select").on("change", updateCharts)

// add jQuery UI slider
$("#date-slider").slider({
	range: true,
	max: parseTime("31/12/2015").getTime(),
	min: parseTime("01/01/2015").getTime(),
	step: 86400000, // one day
	values: [
		parseTime("01/01/2015").getTime(),
		parseTime("31/12/2015").getTime()
	],
	slide: (event, ui) => {
		const dates = ui.values.map(val => new Date(val))
		const xVals = dates.map(date => timeline.x(date))

		timeline.brushComponent.call(timeline.brush.move, xVals)
	}
})

d3.json("data/results.json").then(data => {
	// prepare and clean data
	Object.keys(data).forEach(season => {
		console.log(season);
		filteredData[season] = data[season]
			.filter(d => {
				return !(d["count"] == null)
			}).map(d => {
				d["count"] = Number(d["count"])
				d["feels"] = Number(d["feels"])
				d["temperature"] = Number(d["temperature"])
				d["date"] = parseTime(d["date"])
				return d
			})
		donutData.push({
			"season": season,
			"data": filteredData[season].slice(-1)[0]
		})
	})

	lineChart = new LineChart("#line-area")
	donutChart1 = new DonutChart("#donut-area1", "feels")
	donutChart2 = new DonutChart("#donut-area2", "temperature")
	timeline = new Timeline("#timeline-area")
})

function brushed() {
	const selection = d3.event.selection || timeline.x.range()
	const newValues = selection.map(timeline.x.invert)

	$("#date-slider")
		.slider('values', 0, newValues[0])
		.slider('values', 1, newValues[1])
	//$("#dateLabel1").text(formatTime(newValues[0]))
	//$("#dateLabel2").text(formatTime(newValues[1]))
	$("#dateLabel1").text((newValues[0]).toLocaleDateString())
	$("#dateLabel2").text((newValues[1]).toLocaleDateString())

	lineChart.wrangleData()
}

function arcClicked(arc) {
	$("#season-select").val(arc.data.season)
	updateCharts()
}

function updateCharts(){
	lineChart.wrangleData()
	donutChart1.wrangleData()
	donutChart2.wrangleData()
	timeline.wrangleData()
}
