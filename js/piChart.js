PiChart = function(_parentElement, _data, colorScale){
    this.parentElement = _parentElement;
    this.data = _data;

    // No data wrangling, no update sequence
    this.displayData = this.data;

    this.initVis();
}
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};
PiChart.prototype.initVis = function(){
    var vis = this; // read about the this

    vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 100 - vis.margin.top - vis.margin.bottom;

    var width = vis.width + vis.margin.left + vis.margin.right+100;
    var height = vis.height + vis.margin.top + vis.margin.bottom+400;
    vis.radius = Math.min(width, height) / 2;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", width)
        .attr("height", height);

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(400,250)");

    console.log(vis.data);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var pie = d3.pie()
        .sort(null)
        .value(function(d,i) { return vis.data[i][0][2]; });

    var path = d3.arc()
        .outerRadius(vis.radius)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(vis.radius-40)
        .innerRadius(vis.radius-40);

    var arc = vis.g.selectAll(".arc")
        .data(pie(vis.data))
        .enter().append("g")
        .attr("class", "arc")
        .on("mouseover", function(d) {
            var node = d3.select(this);
            node.moveToFront();
            node   .transition()
                .attr("stroke","black")
                .select("text").style("visibility", "visible")
        })
        .on("mouseout", function(d){
            d3.select(this)
                .transition()
                .attr("stroke","none")
                .select("text").style("visibility","hidden");
        });

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d,i) { return color(vis.data[i][0][0]); }) //colored based off revenue looks best

    arc.append("text")
        .attr("class", "pi-text")
        .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
        .style("visibility", "hidden")
        .text(function(d,i) { return vis.data[i][0][0] + " - $" + vis.data[i][0][2] });
}