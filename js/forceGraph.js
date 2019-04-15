function ForceGraph(_parentElement, _actors, _colorScale){
    this.parentElement = _parentElement;
    this.actors = _actors;
    this.colorScale = _colorScale;
    this.init();
  };
  
ForceGraph.prototype.init = function(){
    var vis = this;

    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = 1000 - vis.margin.left - vis.margin.right,
    vis.height = 500 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (vis.margin.left) + "," + vis.margin.top + ")");

    vis.defs = vis.svg.append("defs")
    vis.svg.append("text")
        .attr("class", "title");
};
  
ForceGraph.prototype.tooltip_render = function (tooltip_data, node) {
    var vis = this;
    if (node) {
        return '<h4>' + tooltip_data.name + ' as ' + tooltip_data.character + '</h4>';
    } else {
        var text = '<h4>' + tooltip_data.actor1 + ' / ' + tooltip_data.actor2 + '</h4>';
        text += '<p>Other movies appeared in together:</p><ul>';
        tooltip_data.movies.forEach(function(movie) {
            if (movie !== vis.title) {
                text += '<li>' + movie + '</li>'
            }
        });
        text += '</ul>';
        return text
    }
}

ForceGraph.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = {"nodes":[], "edges":[]};
    var limit = d3.min([vis.filteredData.length, 25])
    //console.log(vis.filteredData)
    for (var i = 0; i < limit; i++) {
        var element = vis.filteredData[i];
        var node = {"id": element.id, "name": element.name, "character": element.character, "image": element.image}
        //console.log(element)
        vis.displayData.nodes.push(node)
    }
    for (var i = 0; i < limit; i++) {
        var actor1 = vis.actors.filter(function(v) {return v.id == vis.displayData.nodes[i].id})[0]
        for (var j = i + 1; j < limit; j++) {
            var actor2 = vis.actors.filter(function(v) {return v.id == vis.displayData.nodes[j].id})[0]
            var movies1 = actor1.movies.map(function(m) {return m.title});
            var movies2 = actor2.movies.map(function(m) {return m.title});
            var same = movies1.filter(function(v) {return movies2.includes(v)});
            var numSame = same.length - 1;
            if (numSame > 0) {
                var link = {"source": actor1.name, "target": actor2.name, "value": numSame, "movies": same};
                vis.displayData.edges.push(link);
            }
        }
    }
    //console.log(vis.displayData);
    vis.updateVis();
}
  
ForceGraph.prototype.updateVis = function() {
    var vis = this;
    //var keys = Object.keys(data)

    vis.svg.selectAll("text")
        .text(vis.title)

    var patterns = vis.defs.selectAll("pattern")
        .data(vis.displayData.nodes.filter(function(d) {
            return d.image != null;
        }))
    patterns.enter().append("pattern")
        .attr("width", 1)
        .attr("height", 1)
        .append("image")
        .attr("width", 44)
        .attr("height", 68)
        .attr("x", 0)
        .attr("y", -5)
    vis.defs.selectAll("pattern")
        .attr("id", function(d){return "img_" + d.id})
        .select("image")
        .attr("xlink:href", function(d){return d.image});
    
    vis.simulation = d3.forceSimulation(vis.displayData.nodes)
        .force('link', d3.forceLink(vis.displayData.edges)
        .distance(190)
        .id(function(d) { return d.name; }))
        .force("center", d3.forceCenter().x(vis.width/2).y(vis.height/2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('charge', d3.forceManyBody().strength(-200))
  
    var nodeTip = d3.tip().attr('class', 'd3-tip')
      .direction('ne')
      .offset(function() {
          return [0,0];
      })
      .html(function(d) {
        /* populate data in the following format */
        tooltip_data = {
          "name": d.name,
          "character": d.character,
        };
        /* pass this as an argument to the tooltip_render function then,
        * return the HTML content returned from that method.
        * */
        return vis.tooltip_render(tooltip_data, true);
      });
    vis.svg.call(nodeTip)

    var edgeTip = d3.tip().attr('class', 'd3-tip')
      .direction('ne')
      .offset(function() {
          return [0,0];
      })
      .html(function(d) {
        /* populate data in the following format */
        //console.log(d)
        tooltip_data = {
          "actor1": d.source.name,
          "actor2": d.target.name,
          "movies": d.movies
        };
        /* pass this as an argument to the tooltip_render function then,
        * return the HTML content returned from that method.
        * */
        return vis.tooltip_render(tooltip_data, false);
      });
    vis.svg.call(edgeTip)
  
    var edge = vis.svg.selectAll(".edge")
        .data(vis.displayData.edges);
    edge
        .enter()
        .insert("line", "circle")
        .attr("class", "edge")
        .style("stroke", "#ccc")
        .on('mouseover', edgeTip.show)
        .on('mouseout', edgeTip.hide)
        .merge(edge)
        .style("stroke-width", function(d) {return d.value});
    edge.exit().remove();
  
    var node = vis.svg.selectAll(".node")
        .data(vis.displayData.nodes);
    node
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 22)
        .attr("stroke", "black")
        .call(d3.drag()
        .on("start", dragstart)
        .on("drag", drag)
        .on("end", dragend))
        .on('mouseover', nodeTip.show)
        .on('mouseout', nodeTip.hide)
        .merge(node)
        .attr("fill", function(d) {return d.image == null ? "red" : "url(#img_" + d.id + ")"})
    node.exit().remove();
  
    vis.simulation.on("tick", function() {
      // Update node coordinates
        vis.svg.selectAll(".node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
  
      // Update edge coordinates
        vis.svg.selectAll(".edge")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    });
  
    function lock(x, max) {
        if (x < 0) return 0;
        if (x > max) return max;
        return x;
    }
  
    function dragstart(d) {
        if (!d3.event.active) vis.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
  
    function drag(d) {
        d.fx = lock(d3.event.x, vis.svgWidth);
        d.fy = lock(d3.event.y, vis.svgHeight);
    }
  
    function dragend(d) {
        if (!d3.event.active) vis.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
};