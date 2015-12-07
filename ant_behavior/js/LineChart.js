function LineChart(containerId, width, height, bufSize, monitorData){
  this.w = width;
  this.h = height;
  this.margin = {top: 10, right: 10, bottom: 10, left: 10};

  this.bufferPointer = 0;
  this.bufferSize = bufSize || 100;

  this.dataBuffers = {};
  for (var i = 0; i < monitorData.length; i++) {
    this.dataBuffers[monitorData[i].label] = new CircularBuffer(this.bufferSize, 0);
  };

  this.xAxis = 'Time steps';

  this.graph = d3.select('#'+containerId).append("svg:svg").attr("width", "100%").attr("height", "100%");

  this.x = d3.scale.linear().domain([0, 100000]).range([-5, width]); // starting point is -5 so the first value doesn't show and slides off the edge as part of the transition

}



LineChart.prototype.pushData = function(data) {
  this.dataBuffers[data.label].set(this.bufferPointer, data.getValue());
};

LineChart.prototype.redraw = function() {

  var thisLineChart = this;
  var y = d3.scale.linear().domain([0, 1]).range([0, this.h]);
  var xBuffer = thisLineChart.dataBuffers[thisLineChart.xAxis];

  var maxX = xBuffer.asArray().reduce(function(a,b){return Math.max(a,b);}, 0);

  this.graph.selectAll("*").remove();
  for (var property in this.dataBuffers) {
    if (this.dataBuffers.hasOwnProperty(property)) {
      if(property == this.xAxis || property !== 'Colony size'){
        continue;
      }

      var label = property;
      var data = this.dataBuffers[label].asArray();
      //console.log(label, data);

      var maxY = data.reduce(function(a,b){return Math.max(a,b);}, 0);
      var oneOverMaxY = maxY ? 1 / maxY : 0;



      // create a line object that represents the SVN line we're creating
      var line = d3.svg.line()

        // assign the X function to plot our line as we wish
        .x(function(d,i) { 
          // verbose logging to show what's actually being done
          //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + xBuffer.get(thisLineChart.bufferPointer + i) + ' using our xScale.');
          // return the X coordinate where we want to plot this datapoint

          return thisLineChart.x(xBuffer.asArray()[i] - maxX) + thisLineChart.w;
        })
        .y(function(d) { 
          // verbose logging to show what's actually being done
          //console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) * oneOverMaxY + " using our yScale.");
          // return the Y coordinate where we want to plot this datapoint
          return thisLineChart.h - y(d) * oneOverMaxY;
        })
        .interpolate('linear');

      // display the line by appending an svg:path element with the data line we created above

      this.graph.append("svg:path").attr("d", line(data));

      this.graph.selectAll("path")
        .data([data]) // set the new data
        .attr("d", line); // apply the new data values
    }
  }

  this.bufferPointer++;
};