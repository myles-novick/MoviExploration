StackedAreaChart = function(_parentElement, _data, _colorScale){
	this.parentElement = _parentElement;
    this.data = _data;
    this.colorScale = _colorScale;
    this.displayData = [];
    this.initVis();
}

StackedAreaChart.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

	vis.width = 600 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
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
    
    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return parseYear(d.Year); }));

    vis.y = d3.scaleSqrt()
        .range([vis.height, 0])

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(function(d) {return d3.format("$.2s")(d).replace(/G/, "B")});

    vis.text = vis.svg.append("text")
        .attr("transform","translate(" + vis.width/2 + ",0)");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    var dataCategories = vis.colorScale.domain();
    vis.stack = d3.stack().keys(dataCategories);
    vis.stackedData = vis.stack(vis.data)

    vis.area = d3.area()
        .x(function(d) { return vis.x(parseYear(d.data.Year)); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.tooltip = vis.svg.append("text")
        .attr("id","stacked-area-chart-text")
        .attr("x", 10)
        .attr("y", 0)

    vis.wrangleData();
}



/*
 * Data wrangling
 */

StackedAreaChart.prototype.wrangleData = function(){
	var vis = this;

	vis.displayData = vis.stack(vis.data.filter(function(d) {
        domain = vis.x.domain();
        return d.Year >= domain[0].getFullYear() && d.Year <= domain[1].getFullYear() + 1
    }));

	// Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

StackedAreaChart.prototype.updateVis = function(){
	var vis = this;

    var chartDescription = vis.text
        .attr("class", "stackedareachart-label")
        .text("By Year");

	vis.y.domain([0, d3.max(vis.displayData, function(d) {
			return d3.max(d, function(e) {
				return e[1];
			});
		})
	]);

    var dataCategories = vis.colorScale.domain();

    // Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .attr("clip-path", "url(#clip)")
        .merge(categories)
        .style("fill", function(d,i) {
            return colorScale(dataCategories[i]);
        })
        .attr("d", function(d) {
            return vis.area(d);
        })
        .on("mouseover", function(d,i) {
            vis.tooltip.style("fill",colorScale(dataCategories[i]))
            vis.tooltip.text(d.key)
        });

	categories.exit().remove();

	// Call axis functions with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
}