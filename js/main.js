var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var parseYear = d3.timeParse("%Y");

var parseDate = d3.timeParse("%x")

var stackedAreaChart, timeline, barChart, pieChart;

var genreRevenue = [];
//var workableArray = [];

d3.queue()
    .defer(d3.json, "data/movies.json")
    .defer(d3.json, "data/actors.json")
    .defer(d3.json, "data/stacks.json")
    .await(createVis);

function createVis(error, movies, actors, stacks) {
    colorScale.domain(d3.keys(stacks.layers[0]).filter(function(d){ return d != "Year"; }))
    //console.log(movies)
    movies.forEach(function(movie) {
        movie.release_date = parseDate(movie.release_date)
        movie.title = movie.title;
        movie.revenue = +movie.revenue;
        movie.genres = movie.genres;
        genreRevenue.push(([movie.title,movie.genres,movie.revenue]));
    })

    // stacks.years.forEach(function(year) {
    //     year.Year = parseYear(year.Year)
    // })
    // stacks.layers.forEach(function(layer) {
    //     layer.Year = parseYear(layer.Year)
    // })
    // stacks.years.for
    // data = {"years":[], "layers":[]}
    // genres = new Set()
    // movies.forEach(function(movie) {
    //     movie.genres.forEach(function(genre) {
    //         genres.add(genre)
    //     })
    // })
    // genres = Array.from(genres).sort()
    // movies.forEach(function(movie) {
    //     //movie.release_date = parseDate(movie.release_date)
    //     //console.log(movie.release_date)
    //     year = movie.release_date.getFullYear();
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
    barChart = new BarChart("bar-chart", movies, colorScale)
    pieChart = new PieChart("pie-chart", movies, colorScale)
}

function brushed() {
    // TO-DO: React to 'brushed' event
    if (d3.event.selection === null) {
        areachart.x.domain(timeline.x.domain());
        barChart.filteredData = barChart.data;
        pieChart.filteredData = pieChart.data;
    } else {
        limit = timeline.x.invert(d3.event.selection[1]).getFullYear() == 2018 ? new Date(2017, 1, 1) : timeline.x.invert(d3.event.selection[1]);
        areachart.x.domain([timeline.x.invert(d3.event.selection[0]), limit]);
        barChart.filteredData = barChart.data.filter(function(d){
            return d.release_date >= timeline.x.invert(d3.event.selection[0]) && d.release_date <= timeline.x.invert(d3.event.selection[1]);
        });
        pieChart.filteredData = pieChart.data.filter(function(d){
            return d.release_date >= timeline.x.invert(d3.event.selection[0]) && d.release_date <= timeline.x.invert(d3.event.selection[1]);
        });
    }

    areachart.wrangleData();
    barChart.wrangleData();
    pieChart.wrangleData();
}

function filtered(selection) {
    barChart.filterGenre = selection == null ? null : selection.genre;
    barChart.wrangleData();
}