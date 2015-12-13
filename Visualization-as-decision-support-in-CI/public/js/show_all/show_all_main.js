
window.onload = function() {

  var $devSelect = $("#select-developer");
  var $methodSelect = $("#select-method");

  var renderer = new dagreD3.render();
  var decorator = new Decorator();
  var devFlowExtractor = new DeveloperFlowExtractor(new Aggregator());
  var graphs = undefined;

  var timeouts = [];

  $.ajax({
    url: "data/test100_M_to_1.dot"
  }).done(function (data) {
    graphs = graphlibDot.readMany(data);

    populateSelectElement(graphs);

    function onSelectUpdate(){
      processAndRender(graphs);
    }

    $methodSelect.change(onSelectUpdate);
    $devSelect.change(onSelectUpdate);

    onSelectUpdate();
  });


  function processAndRender(graphs){
    // Stop any ongoing renderings
    for (var i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    };
    timeouts.splice(0, timeouts.length);


    var $graphContainer = $('#graph-container');
    $graphContainer.empty();


    var developerName = $devSelect.find(":selected").text();
    var method = $methodSelect.find(":selected").text();
    var graphsToRender = devFlowExtractor.getFlow(graphs, developerName, method);

    graphsToRender.forEach(function (g, index){
      function decorateAndRender(){
        //Add graphical properties to graph
        decorator.decorate(g);

        //Create SVG and render in it
        g.id = 'graph' + index;
        $graphContainer.append( '<svg id="'+ g.id +'"><g></svg>' );

        g.graph().rankdir = "RL";
        g.graph().ranksep = 30;
        g.graph().nodesep = 15;

        render(g);
      };

      var t = setTimeout(decorateAndRender, 100*index);
      timeouts.push(t);
    });
  }

  function populateSelectElement(graphs){
    graphs.map(function(graph){
      return graph.getDeveloper();
    })
    .getUnique()
    .forEach(function (uniqueDeveloper){
      $devSelect.append($('<option>', {
        text: uniqueDeveloper
      }));
    });
  }


  function render(g) {

    // Render the graphlib object using d3.
    var svg = d3.select('#' + g.id),
        inner = svg.select("g");

    renderer(inner, g);

    // Optional - resize the SVG element based on the contents.
    var svg = document.querySelector('#' + g.id);
    var bbox = svg.getBBox();
    svg.style.width = bbox.width + 40.0 + "px";
    svg.style.height = bbox.height + 40.0 + "px";
  }
 
}