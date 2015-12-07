window.onload = function() {

  var renderer = new dagreD3.render();
  var aggregator = new Aggregator();

  var decorator = new AggregatedGraphDecorator();
  var nodeClickHandler = new NodeClickHandler( $('#event-timeline')[0] );
    

  $.ajax({
    url: "data/test1.dot"
    //url: "data/test2.dot"
  }).done(function (data) {
    
    var $graphContainer = $('#graph-container');
    var graphs = graphlibDot.readMany(data);
    
    var minVal = 0;
    var maxVal = graphs.length;

    $("#slider-range").slider({
        range: true,
        min: minVal,
        max: maxVal,
        step: 1,
        values: [minVal, maxVal],
        slide: function (e, ui) {
          $('#timeline1').empty();
          var start = ui.values[0];
          var end = ui.values[1];
          var selectedGraphs = graphs.slice(start, end);

          updateTimeIntervalLabel(selectedGraphs);
          render(selectedGraphs);
        }
    });

    updateTimeIntervalLabel(graphs);
    render(graphs);

  });

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
    decorator.decorate(g);

    g.graph().rankdir = "RL";
    g.graph().ranksep = 30;
    g.graph().nodesep = 15;

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
      nodeClickHandler.handlerFunction(nodeName);
    });
  }
 
}