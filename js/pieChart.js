PieChart = function(_parentElement, _data, colorScale){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = _data;
    this.colorScale = colorScale;

    // No data wrangling, no update sequence
    this.displayData = [];

    this.initVis();
}

PieChart.prototype.initVis = function(){
    var vis = this; // read about the this

    vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

    vis.width = 600 - vis.margin.left - vis.margin.right,
    vis.height = 450 - vis.margin.top - vis.margin.bottom;

    //var width = vis.width + vis.margin.left + vis.margin.right+100;
    //var height = vis.height + vis.margin.top + vis.margin.bottom+400;
    vis.radius = Math.min(vis.width - 200, vis.height) / 2;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.radius) + ", 210)");

    vis.label = vis.g.append('text')
        .attr('class', 'toolCircle')
        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
        //.html(toolTipHTML(data)) // add text to the circle.
        .style('font-size', '.9em')
        .style('text-anchor', 'middle'); // centres text in tooltip

    vis.inner = vis.g.append('circle')
        .attr('class', 'toolCircle')
        .attr('r', vis.radius * 0.7) // radius of tooltip circle
        //.style('fill', colour(data.data[category])) // colour based on category mouse is over
        .style('fill-opacity', 0.35)
        .style("visibility", "hidden")


    //var color = d3.scaleOrdinal(d3.schemeCategory20);

    vis.pie = d3.pie()
        .sort(null)
        .value(function(d,i) { return d.revenue; });

    vis.path = d3.arc()
        .outerRadius(vis.radius - 40)//vis.radius - 40)
        .innerRadius(vis.radius)
        //.cornerRadius(2)
        //.padAngle(0.010)

    // vis.label = d3.arc()
    //     .outerRadius(vis.radius * .9)
    //     .innerRadius(vis.radius * .9);

    // var arc = vis.g.selectAll(".arc")
    //     .data(pie(vis.data))
    //     .enter().append("g")
    //     .attr("class", "arc")
    //     .on("mouseover", function(d) {
    //         var node = d3.select(this);
    //         node.moveToFront();
    //         node.transition()
    //             .attr("stroke","black")
    //             .select("text").style("visibility", "visible")
    //     })
    //     .on("mouseout", function(d){
    //         d3.select(this)
    //             .transition()
    //             .attr("stroke","none")
    //             .select("text").style("visibility","hidden");
    //     });

    // arc.append("path")
    //     .attr("d", path)
    //     .attr("fill", function(d,i) { return vis.colorScale(vis.data[i][0][0]); }) //colored based off revenue looks best

    // arc.append("text")
    //     .attr("class", "pie-text")
    //     .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
    //     .style("visibility", "hidden")
    //     .text(function(d,i) { return vis.data[i][0][0] + " - $" + vis.data[i][0][2] });

    vis.colorScale.domain().forEach(function(genre) {
        vis.displayData.push({"genre": genre})
    })
    vis.wrangleData();
}

PieChart.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData.forEach(function(genre) {
        genre.revenue = 0;
    })

    vis.filteredData.forEach(function(movie) {
        movie.genres.forEach(function(genre) {
            vis.displayData[vis.colorScale.domain().indexOf(genre)].revenue += movie.revenue;
        })
    });

    vis.updateVis();
}

PieChart.prototype.updateVis = function() {
    var vis = this;

    var arc = vis.g.selectAll(".arc")
        .data(vis.pie(vis.displayData))
        
    var entering = arc.enter().append("g")
        .attr("class", "arc")
        .on("mouseover", function(d) {
            //console.log(d)
            var node = d3.select(this);
            node.moveToFront();
            node.transition()
                .attr("stroke","black")
                //.select("text").style("visibility", "visible")
            vis.label
                .style("visibility", "visible")
                .html('<tspan x="0">' + d.data.genre + '</tspan> <tspan x="0" dy="1.2em">' + d3.format("$,")(d.data.revenue) + '</tspan>')
            vis.inner
                .attr("fill", vis.colorScale(d.data.genre))
                .style("visibility", "visible");
        })
        .on("mouseout", function(){
            d3.select(this)
                .transition()
                .attr("stroke","none")
                //.select("text").style("visibility","hidden");
            vis.label.style("visibility","hidden");
            vis.inner.style("visibility","hidden");
        })
        .on("click", function(d) {
            
        });
    entering.append("path")
    entering.append("text")
        .attr("class", "pi-text")
        .style("visibility", "hidden")
    
    var slice = entering.merge(arc)
    
    slice.select("path")
        .attr("d", vis.path)
        .attr("fill", function(d,i) { return vis.colorScale(d.data.genre); }) //colored based off revenue looks best

    slice.select("text")
        //.attr("transform", function(d) { return "translate(" + vis.label.centroid(d) + ")"; })
        .text(function(d,i) { return d.data.genre + "\n" + d3.format("$,")(d.data.revenue) });
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function createLabel(genre) {
    return 
}