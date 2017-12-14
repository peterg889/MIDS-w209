/*
This javascript file adds buttons, the control circles, and the Hilbert curve graphic to the webpage.
*/
var helper_enabled_text = true;
var helper_enabled_path = true;
var initialized = false;

// Used with the "Toggle Helper Text" button
var toggle_helper_text = function(){
	if(helper_enabled_text && initialized){
	    console.log("helper text disabled");
		d3.selectAll('.helperlayer_text')
            .style("opacity", "0")
            .style("stroke-opacity", "0");
		helper_enabled_text = false;
	} else if (initialized && !helper_enabled_text){
        console.log("helper text enabled");
		d3.selectAll('.helperlayer_text')
            .style("opacity", "1")
            .style("stroke-opacity", "1");
		helper_enabled_text = true;
	}
}

// Used with the "Toggle Helper Path" button
// var toggle_helper_path = function(){
// 	if(helper_enabled_path && svg != null){
// 		d3.selectAll('.helperlayer_path')
//             .style("opacity", "0")
//             .style("stroke-opacity", "0");
// 		helper_enabled_path = false;
// 	} else if (svg != null && !helper_enabled_path){
// 		d3.selectAll('.helperlayer_path')
//             .style("opacity", "1")
//             .style("stroke-opacity", "1");
// 		helper_enabled_path = true;
// 	}
// }

d3.json("https://s3.amazonaws.com/mids-w209/censys_sample.json", function(data) {
	var colors = new Colors();
	colors.countColors();

	var controlCircle = new ControlCircle(data);
	controlCircle.createArc();
	controlCircle.drawHilbertBig([], []);
	initialized = true;
});