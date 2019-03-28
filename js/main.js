var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var stackedAreaChart, timeline;

d3.queue()
    .defer(d3.json, "data/movies.json")
    .defer(d3.json, "data/actors.json")
    .await(createVis);

function createVis(error, movies, actors) {
    movies.forEach(function(movie) {
        movie.release_date = new Date(movie.release_date)
    })
    stackedAreaChart = new StackedAreaChart("stacked-area-chart", movies);
    timeline = new Timeline("timeline", )
    
}