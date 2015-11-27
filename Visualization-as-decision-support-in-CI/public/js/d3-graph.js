window.onload = function() {

  var renderer = new dagreD3.render();


  var decorator = new Decorator(); 

  $.ajax({
    url: "data/test.dot"
  }).done(function (data) {
    

    var g = graphlibDot.read(data);

    decorator.decorate(g);

    document.getElementById('graph-text').innerHTML = graphlibDot.write(g).replace(/\n/g, ' ').replace(/]/g, ']<br />');

    g.graph().rankdir = "RL";
    g.graph().ranksep = 15;
    g.graph().nodesep = 15;
    render(g);
  });



  function augmentGraphicalDescription(g){

    g.nodes().forEach(function (id){
      var node = g.node(id);
      
      if(node.passed !== undefined){
        node.style = node.passed === 'true' ? 'fill: #afa;' : 'fill: #faa;';
        console.log(id + ' - ' + node.passed + ' - ' + node.style);
      }

    });
  }

  function render(g) {

    // Render the graphlib object using d3.
    var svg = d3.select("svg"),
        inner = svg.select("g");

    renderer(inner, g);

    // Optional - resize the SVG element based on the contents.
    var svg = document.querySelector('#graphContainer');
    var bbox = svg.getBBox();
    svg.style.width = bbox.width + 40.0 + "px";
    svg.style.height = bbox.height + 40.0 + "px";
  }
 
}