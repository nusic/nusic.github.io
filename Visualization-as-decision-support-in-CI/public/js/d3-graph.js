window.onload = function() {

  var renderer = new dagreD3.render();


  var decorator = new Decorator(); 

  $.ajax({
    url: "data/test_multi.dot"
  }).done(function (data) {
    
    var $graphContainer = $('#graph-container');
    var graphs = graphlibDot.readMany(data);
    graphs.forEach(function (g, index){

      //Add graphical properties to graph
      decorator.decorate(g);


      //Create SVG and render in it
      g.id = 'graph' + index;
      $graphContainer.append( '<svg id="'+ g.id +'"><g></svg>' );

      g.graph().rankdir = "RL";
      g.graph().ranksep = 30;
      g.graph().nodesep = 15;

      render(g);

      //Print out the text representation of the graph for debugging
      document.getElementById('graph-text').innerHTML += graphlibDot.write(g).replace(/\n/g, ' ').replace(/]/g, ']<br />') + '<br />';
    });
    
  });


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