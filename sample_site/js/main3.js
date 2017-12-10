var helper_enabled_text = true;
var helper_enabled_path = true;
var initialized = false;

var toggle_helper_text = function(){
	if(helper_enabled_text && initialized){
		d3.selectAll('.helperlayer_text')
		.style("opacity", "0")
		.style("stroke-opacity", "0");
		helper_enabled_text = false;
	} else if (initialized && !helper_enabled_text){
		d3.selectAll('.helperlayer_text')
		.style("opacity", "1")
		.style("stroke-opacity", "1");	
		helper_enabled_text = true;	
	}
}

var toggle_helper_path = function(){
	if(helper_enabled_path && svg != null){
		d3.selectAll('.helperlayer_path')
		.style("opacity", "0")
		.style("stroke-opacity", "0");
		helper_enabled_path = false;
	} else if (svg != null && !helper_enabled_path){
		d3.selectAll('.helperlayer_path')
		.style("opacity", "1")
		.style("stroke-opacity", "1");	
		helper_enabled_path = true;	
	}
}

d3.json("data/sample.json", function(data) {

	var colors = new Colors();
	colors.countColors();

	var controlCircle = new ControlCircle(data);
	console.log("Done")
	controlCircle.createArc();
	controlCircle.drawHilbertBig([], []);
	initialized = true;
});