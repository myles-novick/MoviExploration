StackedAreaChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.initVis();
}

StackedAreaChart.prototype.initVis = function() {
    var vis = this;

	vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

	vis.width = 800 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
       .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.release_date; }));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");


    // TO-DO: Initialize stack layout
    var dataCategories = colorScale.domain();
    var stack = d3.stack().keys(dataCategories);
    vis.stackedData = stack(vis.data)

    // TO-DO: Rearrange data

    // TO-DO: Stacked area layout
    vis.area = d3.area()
    .x(function(d) { return vis.x(d.data.release_date); })
    .y0(function(d) { return vis.y(d[0]); })
    .y1(function(d) { return vis.y(d[1]); });


	// TO-DO: Tooltip placeholder
    vis.tooltip = vis.svg.append("text")
        .attr("x", 0)
        .attr("y", 0)

	// TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
}