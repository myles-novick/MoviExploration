PieChart = function(_parentElement, _data, _colorScale){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = _data;
    this.colorScale = _colorScale;
    this.selected = null;
    // No data wrangling, no update sequence
    this.displayData = [];

    this.initVis();
}

PieChart.prototype.initVis = function(){
    var vis = this; // read about the this

    vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

    vis.width = 600 - vis.margin.left - vis.margin.right,
    vis.height = 450 - vis.margin.top - vis.margin.bottom;

    vis.radius = Math.min(vis.width - 200, vis.height) / 2;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);
    vis.div = vis.svg.append('text')
        .attr("transform", "translate(120, 25)");

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.radius) + ", 210)");

    vis.label = vis.g.append('text')
        .attr('class', 'toolCircle')
        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
        .style('font-size', '.9em')
        .style('text-anchor', 'middle'); // centres text in tooltip

    vis.inner = vis.g.append('circle')
        .attr('class', 'toolCircle')
        .attr('r', vis.radius * 0.7) // radius of tooltip circle
        .style('fill-opacity', 0.35)
        .style("visibility", "hidden");

    vis.pie = d3.pie()
        .sort(null)
        .value(function(d,i) { return d.revenue; });

    vis.path = d3.arc()
        .outerRadius(vis.radius - 40)//vis.radius - 40)
        .innerRadius(vis.radius);

    vis.colorScale.domain().forEach(function(genre) {
        vis.displayData.push({"genre": genre})
    });
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

    var chartDescription = vis.div
        .attr("class", "piechart-label")
        .text("By Genre");

    var arc = vis.g.selectAll(".arc")
        .data(vis.pie(vis.displayData));
        
    var entering = arc.enter().append("g")
        .attr("class", "arc")
        .on("mouseover", function(d) {
            var node = d3.select(this);
            if (vis.selected == null) {
                node.moveToFront()
                    .transition().attr("stroke","black");
            }
            vis.updateLabel(d.data);
        })
        .on("mouseout", function(d){
            var node = d3.select(this)

            if (vis.selected == null) {
                node.transition().attr("stroke","none");
                vis.label.style("visibility","hidden");
                vis.inner.style("visibility","hidden");
            } else {
                vis.updateLabel(vis.selected);
            }
        })
        .on("click", function(d) {
            var node = d3.select(this)
            if (node.classed("selected")) {
                node.classed("selected", false)
                    .attr("stroke","none")
                vis.label.style("visibility","hidden");
                vis.inner.style("visibility","hidden");
                vis.selected = null;
            } else {
                node.moveToFront()
                if (vis.selected != null) {
                    d3.select(this.parentNode).selectAll(".selected")
                    .classed("selected", false)
                    .attr("stroke","none");
                }
                node.classed("selected", true)
                vis.selected = d.data;
                vis.updateLabel(vis.selected)
            }
            filtered(vis.selected)
        });
    entering.append("path")
    entering.append("text")
        .attr("class", "pi-text")
        .style("visibility", "hidden")
    
    var slice = entering.merge(arc)
        .attr("stroke", function(d) {
            node = d3.select(this);
            if (vis.selected == null) {
                node.classed("selected", false);
                return "none";
            }
            if (d.data.genre == vis.selected.genre) {
                if (d.data.revenue == 0) {
                    vis.selected = null;
                    node.classed("selected", false);  
                    vis.label.style("visibility","hidden");
                    vis.inner.style("visibility","hidden");
                    filtered(null);
                    return "none";
                } else {
                    node.classed("selected", true).moveToFront();
                    vis.updateLabel(vis.selected);
                    vis.selected = d.data;
                    return "black";
                }
            }
            node.classed("selected", false);
            return "none";
        })
    
    slice.select("path")
        .attr("d", vis.path)
        .attr("fill", function(d) { return vis.colorScale(d.data.genre); }) //colored based off revenue looks best

}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

PieChart.prototype.updateLabel = function(d) {
    var vis = this;
    vis.label
        .style("visibility", "visible")
        .html('<tspan x="0">' + d.genre + '</tspan> <tspan x="0" dy="1.2em">' + d3.format("$,")(d.revenue) + '</tspan>');
    vis.inner
        .attr("fill", vis.colorScale(d.genre))
        .style("visibility", "visible");
}