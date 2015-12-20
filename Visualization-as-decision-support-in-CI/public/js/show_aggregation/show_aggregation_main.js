window.onload = function() {

  var renderer = new dagreD3.render();
  var aggregator = new Aggregator();

  var decorator = new AggregatedGraphDecorator();
  var nodeClickHandler = new TimeLineHandler();
  var selectedNode;

  $.ajax({
    //url: "data/test100_M_to_1.dot"
    url: "data/test100templated.dot"
  }).done(function (data) {
    
    var $graphContainer = $('#graph-container');
    var graphs = graphlibDot.readMany(data);
    
    var minVal = 0;
    var maxVal = graphs.length;

    var mid = Math.ceil(maxVal/2);
    var windowSize = maxVal;

    $("#slider-time-window").slider({
      value: mid,
      min: minVal,
      max: maxVal,
      step: 1,
      slide: function (e, ui) {
          $('#timeline1').empty();
          var mid = ui.value;
          var values = $("#slider-time-range").slider('values');
          var halfWidth = Math.ceil((values[1]-values[0])/2);
          var start = Math.max(mid - halfWidth, minVal);
          var end = Math.min(mid + halfWidth, maxVal);
          $("#slider-time-range").slider('values', [start, end]);

          var selectedGraphs = graphs.slice(start, end);
          update(selectedGraphs);
        },
    });


    $("#slider-time-range").slider({
        range: true,
        min: minVal,
        max: maxVal,
        step: 1,
        values: [minVal, maxVal],
        slide: function (e, ui) {
          $('#timeline1').empty();
          var start = ui.values[0];
          var end = ui.values[1];
          var width = end - start;
          var mid = start + Math.ceil(width / 2);
          $("#slider-time-window").slider('value', mid);

          var selectedGraphs = graphs.slice(start, end);
          update(selectedGraphs);
        },
    });

    update(graphs);

  });

  function update(selectedGraphs){
    updateTimeIntervalLabel(selectedGraphs);
    render(selectedGraphs);
    nodeClickHandler.handlerFunction(selectedNode);
  }

  function updateTimeIntervalLabel(selectedGraphs){
    var firstGraph = selectedGraphs[0];
    var lastGraph = selectedGraphs[selectedGraphs.length-1];
    var startDate = getStartTime(firstGraph);
    var endDate = getStartTime(lastGraph);
    var startDateStr = startDate.toDateAndTimeStr();
    var endDateStr = endDate.toDateAndTimeStr();
    $('.slider-time').html(startDateStr);
    $('.slider-time2').html(endDateStr);
  }

  function getStartTime(g){
    var codeChangeName = g.nodes()[0];
    var codeChangeData = g.node(codeChangeName);
    return new Date(Number(codeChangeData.time));
  }


  function render(graphs) {
    var g = aggregator.unionOf(graphs);
    selectedNode = selectedNode || Graph.prototype.getFirstWith.apply(g, ['passed']);
    decorator.decorate(g, selectedNode);

    // Render the graphlib object using d3.
    var svg = d3.select('#graph-svg'),
        inner = svg.select("g");

    renderer(inner, g);

    // Resize the SVG element based on the contents.
    var svg = document.querySelector('#graph-svg');
    var bbox = svg.getBBox();
    svg.style.width = bbox.width + 40.0 + "px";
    svg.style.height = bbox.height + 40.0 + "px";

    //Add click listener
    nodeClickHandler.setGraphs(graphs);
    inner.selectAll('g.node').on('click', function (nodeName){
      selectedNode = nodeName;
      decorator.decorate(g, selectedNode);
      renderer(inner, g);
      nodeClickHandler.handlerFunction(nodeName);
    });
  }
 
}