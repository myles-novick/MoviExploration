var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var stackedAreaChart, timeline;

d3.queue()
    .defer(d3.json, "data/movies.json")
    .defer(d3.json, "data/actors.json")
    .defer(d3.json, "data/stacks.json")
    .await(createVis);

function createVis(error, movies, actors, stacks) {
    colorScale.domain(d3.keys(stacks.layers[0]).filter(function(d){ return d != "Year"; }))
    // data = {"years":[], "layers":[]}
    // genres = new Set()
    // movies.forEach(function(movie) {
    //     movie.genres.forEach(function(genre) {
    //         genres.add(genre)
    //     })
    // })
    // genres = Array.from(genres).sort()
    // movies.forEach(function(movie) {
    //     year = new Date(movie.release_date).getFullYear();
    //     check = data.years.filter(function(d){ return d.Year === year })
    //     if (check.length > 0) {
    //         y = check[0]
    //         i = data.years.indexOf(y)
    //         data.years[i].Revenue += movie.revenue
    //         j = data.layers.indexOf(data.layers.filter(function(d){ return d.Year === year })[0])
    //         movie.genres.forEach(function(genre) {
    //         data.layers[j][genre] += movie.revenue
    //         })
    //     } else {
    //         data.years.push({"Year": year, "Revenue":movie.revenue})
    //         layer = {"Year": year}
    //         genres.forEach(function(genre) {
    //             if (movie.genres.includes(genre)) {
    //                 layer[genre] = movie.revenue
    //             } else {
    //                 layer[genre] = 0
    //             }
                
    //         })
    //         data.layers.push(layer)
    //     }
        
        
    // })
    // //console.log(data.years.filter(function(d){ return d.Year !== null }))
    // //data.layers = data.layers.filter(function(d){ return d.Year !== null }))
    // data.years = data.years.filter(function(d){ return !isNaN(d.Year)}).sort(function(a,b) {return a.Year - b.Year})
    // data.layers = data.layers.filter(function(d){ return !isNaN(d.Year)}).sort(function(a,b) {return a.Year - b.Year})
    // let dataStr = JSON.stringify(data);
    // let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    // let exportFileDefaultName = 'stacks.json';
    
    // let linkElement = document.createElement('a');
    // linkElement.setAttribute('href', dataUri);
    // linkElement.setAttribute('download', exportFileDefaultName);
    // linkElement.click();
    areachart = new StackedAreaChart("stacked-area-chart", stacks.layers, colorScale);
    timeline = new Timeline("timeline", stacks.years, colorScale)
    
}

function brushed() {
    // TO-DO: React to 'brushed' event
    areachart.x.domain(
        d3.event.selection === null ? timeline.x.domain() : [timeline.x.invert(d3.event.selection[0]), timeline.x.invert(d3.event.selection[1])]
    );
    areachart.wrangleData();
}
