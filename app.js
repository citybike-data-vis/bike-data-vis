function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight, dataLabel) {
  var legendWidth  = 200,
      legendHeight = 50;

  var legendVisible = false
  // clipping to make sure nothing appears behind legend

  if (legendVisible) {
    svg.append('clipPath')
    .attr('id', 'axes-clip')
    .append('polygon')
      .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                      (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                      (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                      (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                      (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                      (-margin.left)                 + ',' + (chartHeight + margin.bottom));
  }

  var axes = svg.append('g')
    .attr('clip-path', 'url(#axes-clip)');

  axes.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(xAxis);

  axes.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text(dataLabel);

  if (legendVisible) {
    var legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');

    legend.append('rect')
      .attr('class', 'legend-bg')
      .attr('width',  legendWidth)
      .attr('height', legendHeight);

    legend.append('path')
      .attr('class', 'median-line')
      .attr('d', 'M10,25L85,25');

    legend.append('text')
      .attr('x', 115)
      .attr('y', 25)
      .text('Hourly avg');
  }
}

function startAnimation (chartWidth, rectClip) {
  var animationDuration = 2000

  rectClip.transition()
    .duration(animationDuration)
    .attr('width', chartWidth);
}

function drawLine (graphArea, data, x, y) {
  var line = d3.svg.line()
    .interpolate('basis')
    .x(function (d) { return x(d.time); })
    .y(function (d) { return y(d.avlbikes); });
  
  graphArea.datum(data);

  graphArea.append('path')
    .attr('class', 'normal-line red')
    .attr('d', line)
    .attr('clip-path', 'url(#rect-clip)');
  
}

function drawChart (data, areaWidth, areaHeight, y_heigth, plotHeader, dataLabel) {
  var animate = false;
  var max_of_array = Math.max.apply(Math, data.map(item => item.avlbikes));

  y_heigth = Math.max(max_of_array, 30)

  var svgWidth  = areaWidth,
      svgHeight = areaHeight,
      margin = { top: 20, right: 20, bottom: 40, left: 40 },
      chartWidth  = svgWidth  - margin.left - margin.right,
      chartHeight = svgHeight - margin.top  - margin.bottom

  var x = d3.time.scale().range([0, chartWidth])
            .domain(d3.extent(data, function (d) { return d.time; })),
      y = d3.scale.linear().range([chartHeight, 0])
            .domain([0, d3.max(data, function (d) { return y_heigth; })]);
  
  var xAxis = d3.svg.axis().scale(x).orient('bottom')
            .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
      yAxis = d3.svg.axis().scale(y).orient('left')
            .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);
  console.log(data[0])
  var area = d3.select('#plots').insert('div', ':first-child').attr('id', 'plot' + data[0].stationId)
  console.log("hello")
  var button = area.append('button')
    .on('click', deletePlot(data[0].stationId))
    .append('text')
      .text('delete')
  
  area.append('p').append('text').text(plotHeader)


  function _initDrawingArea() {
    return area.append('svg')
    .attr('width',  svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  function deletePlot(stationid) {
    return function(){d3.select('#plot' + stationid).remove()}
  }

  var graphArea = _initDrawingArea()

  addAxesAndLegend(graphArea, xAxis, yAxis, margin, chartWidth, chartHeight, dataLabel);

  if (animate) {
    //add mask to hide graphs temporarily
    var rectClip = graphArea.append('clipPath')
    .attr('id', 'rect-clip')
    .append('rect')
      .attr('width', 0)
      .attr('height', chartHeight);
  }
  
  drawLine(graphArea, data, x, y);
  
  if (animate) {
    //hide mask to show graphs
    startAnimation(chartWidth, rectClip);
  }
}


function createPlot(stationId, chosenDate) {
  var parseDate  = d3.time.format('%Y-%m-%d %H:%M:%S').parse;
  
  d3.json(DATAFOLDER+'data.json', function (error, rawData) {
    if (error) {
      console.error(error);
      return;
    }
    
    console.log('Now filtering station', stationId, 'data..')

    var data = rawData.map(function (d) {
      return {
        time: d.time,
        stationId: parseInt(d.stationid),
        avlbikes: d.avlbikes
      };
    });

    var filteredData = data
      .filter( dataItem => dataItem.stationId === parseInt(stationId))
      .filter( dataItem => moment(dataItem.time).add(3, 'hours').format('YYYY-MM-DD') === chosenDate )

    filteredData = filteredData.map(function (d) {
      return {
        time: parseDate(moment(d.time).add(3, 'hours').format('YYYY-MM-DD HH:mm:ss')),
        stationId: parseInt(d.stationId),
        avlbikes: d.avlbikes
      }
    })

    var areaWidth = 500;
    var areaHeight = 300;
    var options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'}
    var plotHeader = 'Station: ' + filteredData[0].stationId + ', date: ' + filteredData[0].time.toLocaleDateString('fi-FI', options)
    //console.log(filteredData.time.getDate)
    var dataLabel = "Bikes"
    drawChart(filteredData, areaWidth, areaHeight, 30, plotHeader, dataLabel);
  });
}

/*
* param chosenDate: 'YYYY-MM-HH'
*/
function createSystemPlotWeek(chosenDate) {
  var parseDate  = d3.time.format('%Y-%m-%d %H:%M:%S').parse;


  d3.json(DATAFOLDER + 'hourly-avg-sum-all-stations.csv.json', function (error, rawData) {

    if (error) {
      console.error(error);
      return;
    }
    
    var data = rawData.map(function (d) {
      return {
        time:  parseDate(d.timehour),
        avlbikes: d.sumofhourlyavg/3000*100,
        stationId: 1
      };
    });

    console.log(moment.utc(chosenDate))

    var beginDateUTC = moment.utc(chosenDate).add(-3, 'hours'); //3 hours between UTC and EET
    var endDateUTC = moment(beginDateUTC).add(7, 'days')

    var filteredData = data
      .filter( dataItem => 
        moment(dataItem.time).isSameOrAfter(beginDateUTC) && 
        moment(dataItem.time).isSameOrBefore(endDateUTC))

    console.log(filteredData)

    var areaWidth = 1400;
    var areaHeight = 300;
    var options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'}
    var plotHeader = 'Availability on ' + filteredData[0].time.toLocaleDateString('fi-FI', options)

    var dataLabel = "Bikes %"
    drawChart(filteredData, areaWidth, areaHeight, 100, plotHeader, dataLabel);
  });

}

function createSystemPlotOneDay(chosenDate) {
  var parseDate  = d3.time.format('%Y-%m-%d %H:%M:%S').parse;


  d3.json(DATAFOLDER + 'hourly-avg-sum-all-stations.csv.json', function (error, rawData) {

    if (error) {
      console.error(error);
      return;
    }
    
    var data = rawData.map(function (d) {
      return {
        time:  parseDate(d.timehour),
        avlbikes: d.sumofhourlyavg/3000*100,
        stationId: 1
      };
    });

    var filteredData = data
      .filter( dataItem => dataItem.time.toISOString().substring(0,10) === chosenDate )

    console.log(filteredData)

    var areaWidth = 1400;
    var areaHeight = 300;
    var options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'}
    var plotHeader = 'Availability on ' + filteredData[0].time.toLocaleDateString('fi-FI', options)
    var dataLabel = "Bikes %"
    drawChart(filteredData, areaWidth, areaHeight, 100, plotHeader, dataLabel);
  });

}


//createPlot(032, '2017-06-01');