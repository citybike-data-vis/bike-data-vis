function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
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
      .text('Time (s)');

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

function drawChart (data, areaWidth, areaHeight) {
  var animate = true;
  
  var svgWidth  = areaWidth,
      svgHeight = areaHeight,
      margin = { top: 20, right: 20, bottom: 40, left: 40 },
      chartWidth  = svgWidth  - margin.left - margin.right,
      chartHeight = svgHeight - margin.top  - margin.bottom,
      y_heigth = 30;

  var x = d3.time.scale().range([0, chartWidth])
            .domain(d3.extent(data, function (d) { return d.time; })),
      y = d3.scale.linear().range([chartHeight, 0])
            .domain([0, d3.max(data, function (d) { return y_heigth; })]);
  
  var xAxis = d3.svg.axis().scale(x).orient('bottom')
            .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
      yAxis = d3.svg.axis().scale(y).orient('left')
            .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

  function _initDrawingArea() {
    return d3.select('#plots').append('svg')
    .attr('width',  svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  var graphArea = _initDrawingArea()

  addAxesAndLegend(graphArea, xAxis, yAxis, margin, chartWidth, chartHeight);

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

function createPlot(stationId) {
  var parseDate  = d3.time.format('%Y-%m-%d %H:%M:%S').parse;

  d3.json('data.json', function (error, rawData) {
    if (error) {
      console.error(error);
      return;
    }
    
    console.log('Now filtering station', stationId, 'data..')
    console.log('ERROR! filtering not implemented, showing all data!')

    var data = rawData.map(function (d) {
      return {
        time:  parseDate(d.time),
        avlbikes: d.avlbikes
      };
    });
    var areaWidth = 500;
    var areaHeight = 300;
  
    drawChart(data, areaWidth, areaHeight);
  });
}

createPlot(001);