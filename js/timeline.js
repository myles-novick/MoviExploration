
/*
 * Timeline - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

Timeline = function(_parentElement, _data, _colorScale){
    this.parentElement = _parentElement;
    this.data = _data;
    this.colorScale = _colorScale;
    // No data wrangling, no update sequence
    this.displayData = this.data;

    this.initVis();
}


/*
 * Initialize area chart with brushing component
 */

Timeline.prototype.initVis = function(){
	var vis = this;

	vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

	vis.width = 600 - vis.margin.left - vis.margin.right,
    vis.height = 100 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(addYear());

    vis.y = d3.scaleSqrt()
        .range([vis.height, 0])
        .domain([0, d3.max(vis.displayData, function(d) { return d.Revenue; })]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);


    // SVG area path generator
    vis.area = d3.area()
        .x(function(d) { return vis.x(parseYear(d.Year)); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.Revenue); });

    // Draw area by using the path generator
    vis.svg.append("path")
        .datum(vis.displayData)
        .attr("fill", "#ccc")
        .attr("d", vis.area);

    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush", brushed);

    vis.svg.append("g")
        .attr("class", "x brush")
        .call(vis.brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", vis.height + 7);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);
    
    function addYear() {
        range = d3.extent(vis.data, function(d) { return d.Year; });
        return [parseYear(range[0]), parseYear(range[1]+1)]//new Date(last.getFullYear() + 1, last.getMonth(), last.getDate())]
    }
}

