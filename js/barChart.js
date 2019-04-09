BarChart = function(_parentElement, _data, _colorScale){
	this.parentElement = _parentElement;
    this.data = _data;
    this.colorScale = _colorScale;
    this.filteredData = _data;
    this.displayData = [];
    this.initVis();
}

BarChart.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

	vis.width = 800 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom + 100)
        .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.1);
    
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);
    
    vis.xAxis = d3.axisBottom(vis.x);
    vis.yAxis = d3.axisLeft(vis.y);
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0, " + vis.height + ")")
        .call(vis.xAxis);
    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .call(vis.yAxis);

    vis.dropdown = d3.select("#" + vis.parentElement)
        .insert("select", "svg")
        .on("change", function() {
            vis.option = d3.select(this).property("value");
        vis.wrangleData();
        });
    vis.dropdown.selectAll("option")
        .data(["Revenue", "Budget", "Runtime", "Rating"])
        .enter().append("option")
        .attr("value", function (d) {return d.toLowerCase()})
        .text(function (d) {return d});
    vis.option = "revenue";
    vis.wrangleData();
}



/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
	var vis = this;

	vis.displayData = vis.filteredData.sort(function(a,b){return b[vis.option] - a[vis.option]}).slice(0,5);
    vis.x.domain(vis.displayData.map(function(d) { return d.title; }));
    vis.y.domain([0, d3.max(vis.displayData, function(d){return d[vis.option]})]);
    
    switch (vis.option) {
        case "revenue":
        case "budget":
            vis.yAxis.tickFormat(function(d) {return d3.format("$.2s")(d).replace(/G/, "B")});
            break;
        case "runtime":
            vis.yAxis.tickFormat(function(d) {return d + " min"});
            break;
        case "rating":
            vis.yAxis.tickFormat(function(d) {return d + " ★"});
            break;
    }
    vis.updateVis();
}

BarChart.prototype.updateVis = function(){
	var vis = this;

	var groups = vis.svg.selectAll(".bar").data(vis.displayData);
	groups.enter().append("g")
		.merge(groups)
		.attr("class", "bar")
		.attr("x", function(d) { return vis.x(d.title); })
		.attr("width", vis.x.bandwidth())
		.transition().duration(500);

    var bars = vis.svg.selectAll(".bar").selectAll("rect").data(function(d) {return d.genres})
    bars.exit().remove()
    bars.enter().append("rect")
        .merge(bars)
        .attr("width", function() {
            parent = d3.select(this.parentNode)
            return parent.attr("width")/parent.selectAll("rect").size();
        })
        .attr("height", function() {return vis.height - vis.y(d3.select(this.parentNode).data()[0][vis.option]);})
        .attr("x", function(d,i) {return parseInt(d3.select(this.parentNode).attr("x")) + i * d3.select(this).attr("width")})
        .attr("y", function() {return vis.y(d3.select(this.parentNode).data()[0][vis.option])})
        .transition().duration(500)
        .attr("fill", function(d) {return vis.colorScale(d);});
    
    vis.svg.select(".x-axis")
		.transition().duration(500)
        .call(vis.xAxis)
        .selectAll(".tick")
        .select("text").attr("y", 140);

    ticks = vis.svg.select(".x-axis")
        .selectAll(".tick")
        .selectAll("image").data(function(d) {return [d]})
    ticks.exit().remove()
    ticks.enter()
        .append('image')
        .attr('x',-46)
        .attr('y', 0)
        .attr('width',92)
        .attr('height',138)
        .merge(ticks)
        .attr('xlink:href', function(d) {
            contains = vis.displayData.filter(function(movie) {return movie.title === d;})
            return contains.length > 0 ? contains[0].poster : null;
        })

	vis.svg.select(".y-axis")
		.transition().duration(500)
        .call(vis.yAxis);
}