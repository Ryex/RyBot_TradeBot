// Create a function that returns a particular property of its parameter.
// If that property is a function, invoke it (and pass optional params).
function ƒ(name){ 
  var v,params=Array.prototype.slice.call(arguments,1);
  return function(o){
    return (typeof (v=o[name])==='function' ? v.apply(o,params) : v );
  };
}
 
// Return the first argument passed in
function I(d){ return d}

d3.candlestickHTML = function (height, id, data) {
    var COL = {date:0, open:1, high:2, low:3, close:4, volume:5};
    var min = Math.min.apply(Math, data.map(ƒ(COL.low))),
        max = Math.max.apply(Math, data.map(ƒ(COL.high))),
        vscale = (height - 20) / (max - min);

    var vol     = data.map(ƒ(COL.volume)),
        volMin  = Math.min.apply(Math,vol),
        volDiff = Math.max.apply(Math,vol)-volMin;

    var boxes = d3.select("#" + id).selectAll("div.box").data(data); 

    boxes.enter() 
        .append('div').attr('class','box')
        .append('div').attr('class','range');

    boxes
        .sort(function(a,b){ return a[0]<b[0]?-1:a[0]>b[0]?1:0 })
        .attr('title',function(d){ return d[COL.date]+" open:"+d[COL.open]+", close:"+d[COL.close]+" ("+d[COL.low]+"–"+d[COL.high]+")" })
        .style('height',function(d){ return (d[COL.high]-d[COL.low])*vscale+'px' })
        .style('margin-bottom',function(d){ return (d[COL.low]-min)*vscale+'px'})
        .select('.range')
            .classed('fall',function(d){ return d[COL.open]>d[COL.close] })
            .style('height',function(d){ return Math.abs(d[COL.open]-d[COL.close])*vscale+'px' })
            .style('bottom',function(d){ return (Math.min(d[COL.close],d[COL.open])-d[COL.low])*vscale+'px'})
            .style('opacity',function(d){ return ((d[COL.volume]-volMin)/volDiff) * 3 });

    boxes.exit().remove();
}

d3.candlestickSVG = function (width, height, id, data, points) {
    var margin = {top: 20, right: 34, bottom: 60, left: 40};

    width -= margin.left + margin.right
    height -= margin.top + margin.bottom

    var COL = {date:0, open:1, high:2, low:3, close:4, volume:5};
    var min = Math.min.apply(Math, data.map(ƒ(COL.low))),
        max = Math.max.apply(Math, data.map(ƒ(COL.high))),
        vscale = (height - 20) / (max - min),
        boxWidth = width / points;

    var vol     = data.map(ƒ(COL.volume)),
        volMin  = Math.min.apply(Math,vol),
        volDiff = Math.max.apply(Math,vol)-volMin;

    var chart = d3.select("#" + id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var boxes = chart.selectAll("g").data(data); 

    var x = d3.scale.ordinal()
        .rangeBands([0, boxWidth * data.length]);

    var y = d3.scale.linear()
        .range([height, 0])

    x.domain(data.map(function(d, i) { 
        var s = d[COL.date];
        return s.substring(11, s.length); 
    }));
    y.domain([d3.min(data, function(d) { return d[COL.low]; }), d3.max(data, function(d) { return d[COL.high]; })]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    boxes.enter() 
        .append('g').attr("transform", function(d, i) { return "translate(" + i * boxWidth +",0)"; })
        .sort(function(a,b){ return a[0]<b[0]?-1:a[0]>b[0]?1:0 })
        .append('title')
        .text(function(d){ return d[COL.date] + " open:" + d[COL.open] + ", close:" + d[COL.close] + " (" + d[COL.low] + "–" + d[COL.high] + ")" });

    boxes.append('rect')
        .attr("width", 1)
        .attr("height", function(d){ return (d[COL.high] - d[COL.low]) * vscale})
        .attr("transform", function(d) { return "translate(" + (boxWidth) / 2 + "," + (max - d[COL.high]) * vscale +")"; });

    boxes.append('rect')
        .attr("class", "range")
        .attr("width", boxWidth - 4)
        .attr("height", function(d){ return Math.abs(d[COL.open] - d[COL.close]) * vscale})
        .attr("transform", function(d) { return "translate(2," + (max - Math.max(d[COL.close], d[COL.open]) ) * vscale +")"; })
        .classed('fall',function(d){ return d[COL.open] > d[COL.close] })
        .attr('fill-opacity',function(d){ return ((d[COL.volume]-volMin)/volDiff)});
/*        .style('margin-bottom',function(d){ return (d[COL.low]-min)*vscale+'px'})
        .select('.range')
            .classed('fall',function(d){ return d[COL.open]>d[COL.close] })
            .style('height',function(d){ return Math.abs(d[COL.open]-d[COL.close])*vscale+'px' })
            .style('bottom',function(d){ return (Math.min(d[COL.close],d[COL.open])-d[COL.low])*vscale+'px'})
            .style('opacity',function(d){ return ((d[COL.volume]-volMin)/volDiff) * 3 });*/

    boxes.exit().remove();
}