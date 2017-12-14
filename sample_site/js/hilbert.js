/*
Initialize our hilbert curve, does not do any heavy lifting.
*/
var Hilbert = function(data, active_ports, active_countries, svg){
	this.svg = svg;

	this.t = data;
	t = data;

	var data_offset = 3;
	var interactive_offset = 3;
	var expansion_factor = 1;
	var tile_size = Math.floor(expansion_factor / 2)
	tile_size = 1;

	max_tile_length = 0;
	length = 0;
	for(var i = 0; i < t.length; i++){
		if(t[i]['coords']['x'] > max_tile_length){
			max_tile_length = t[i]['coords']['x'];
		}
	}

	length = max_tile_length*expansion_factor + 10;
    console.log("length:", length);
	svg = d3.select("#hilbert")
		.append("svg")
		.attr("height", length)
		.attr("width", length)
		.append("g");

	var div = d3.select("#hilbert").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

	var infopaneldiv = d3.select("#infopaneldiv")
                        .attr("class", "infopanel");

	return this;
};


Hilbert.prototype.getSortedListFromDict = function (input_dict){
	var list = [];
	for (var key in input_dict){
		list.push( [ key, input_dict[key] ] );
	}
	return list.sort(function(a,b) {return b[1] - a[1];});
}

/*
Translates an absolute number to octets, for class name generation
*/
Hilbert.prototype.numToOctets = function(num){
	var zl = 1;
	octets = [0, 0, 0, 0];
	var nextval = num;
	for(var i = zl; i >= 0; i--){
		octets[i] = nextval % 256;
		nextval /= 256
		nextval = Math.floor(nextval, 0)
	}
	return octets
};
/*
Generates a class name based on an IP
*/
Hilbert.prototype.octetsToClass = function(octets){
	var max = 3;
	var target_address = ""
	for(var i = 0; i < max; i++){
		target_address += octets[i];
		if(i < max - 2){ target_address += "_"; }
	}
	return "ip_zl" + max + "_" + octets[0]
};
/*
Generates an ID based on an IP
*/
Hilbert.prototype.octetsToId = function(octets){
	var max = 4;
	var target_address = ""
	for(var i = 0; i < max; i++){
		target_address += octets[i] + "_"
	}
	return "ip_" + target_address
};
/*
Gets the opacity of a node for our larger hilbert curve based upon the
category of data sent in. Category must exist.
*/
Hilbert.prototype.getOpacity = function(things){

	if(things == undefined){
		return 0;
	}

	best_thing = 0;
	best_count = 0;
	total_count = 0;
	for (const [thing, count] of Object.entries(things)) {
		if(count > best_count){
			best_count = count;
			best_thing = thing;
		}
		total_count += count;
	}
	return (total_count > 0) ? (best_count / total_count) : 0;
};
/*
Returns all the country data
*/
Hilbert.prototype.getAllCountryData = function(oct_select, t){
	countries = {}
	for(var i = 0; i < 256; i++){
		if(t[oct_select * 256 + i].hasOwnProperty('country')){
			for (const [country, count] of Object.entries(t[oct_select * 256 + i]['country'])) {
				if(!countries.hasOwnProperty('country')){
					countries[country] = 0;
				}
				countries[country] += count
			}
		}
	}
	return countries;
};
/*
Returns all the country data
*/
Hilbert.prototype.getAllPortData = function(oct_select, t){
	ports = {}
	for(var i = 0; i < 256; i++){
		if(t[oct_select * 256 + i].hasOwnProperty('port')){
			for (const [port, count] of Object.entries(t[oct_select * 256 + i]['port'])) {
				if(!ports.hasOwnProperty('port')){
					ports[port] = 0;
				}
				ports[port] += count
			}
		}
	}
	return ports;
};

/*
Draws the hilbert curve for the already-generated SVG
*/
Hilbert.prototype.drawHilbertBig = function(){

	var data_offset = 3;
	var interactive_offset = 3;
	var expansion_factor = 1;
// 	var tile_size = Math.floor(expansion_factor / 2);
	var tile_size = expansion_factor;
	var _this = this;

	console.log("tile size:", tile_size);

	//draw the squares
	width = this.svg.attr('width');
	height = this.svg.attr('height');

	//a bounding boarder
	var hilbert_border = this.svg;

	hilbert_border.append("rect")
	                .attr("x", 324)
	                .attr("y", 324)
	                .attr("width", 258)
	                .attr("height", 258)
	                .style("stroke", "#FFED4E")
	                .style("fill", "none")
	                .style("stroke-width", "1px");


	var g = this.svg.append('g').attr('class', 'hilbertG').attr('transform', "translate(" + ((width/2) - (128 * expansion_factor)) + "," + ((height/2) - (128 * expansion_factor)) + ")");

	g.selectAll(".hilbertG")
		.data(_this.t)
		.enter()
		.append("rect")
		.attr("x", function(d, i){ return d['coords']['x']*expansion_factor + data_offset; })
		.attr("y", function(d, i){ return d['coords']['y']*expansion_factor + data_offset; })
		.attr("width", tile_size)
		.attr("height", tile_size)
		.attr("class", function(d, i){
			var extra_classes_array = [];
			if(d.hasOwnProperty('port')){
				for (const [port, count] of Object.entries(d['port'])) {
					if(extra_classes_array.indexOf(port) == -1){
						extra_classes_array.push("port_" + port + "_h");
					}
				}
				for (const [country, count] of Object.entries(d['country'])) {
					var country_temp = country.slice(2, -1);
			        country_temp = country_temp.replace(' ', '_');
			        country_temp = country_temp.replace('.', '');
					if(extra_classes_array.indexOf(country_temp) == -1){
						extra_classes_array.push("country_" + country_temp + "_h");
					}
				}
			}
			var extra_classes = extra_classes_array.join(" ");
			return _this.octetsToClass(_this.numToOctets(i)) + extra_classes;
		})
		.attr("id", function(d, i){
			return _this.octetsToId(_this.numToOctets(i));
		})
		.style("fill", function(d, i){ return 'black'; })
		.style("fill-opacity", function(d, i){
		    return _this.getOpacity(d['port']);
        })
		.attr("normal_opacity", function(d, i){
		    return _this.getOpacity(d['port']);
        });
};
/*
Populates the infopanel with data.
*/
Hilbert.prototype.updateInfoPanel = function(currentObj, oct_select) {
    var _this = currentObj;
    var infopaneldiv = d3.select("#infopaneldiv")
	    .attr("class", "infopanel");
    var country_data = _this.getAllCountryData(oct_select, t);
    var port_data = _this.getAllPortData(oct_select, t);
    var country_data_string = "";
    var country_data_list = _this.getSortedListFromDict(country_data);
    for (var index in country_data_list) {
        // console.log("country: ", country);
        country_name = country_data_list[index][0];
        country_count = country_data_list[index][1];
        var country_string = "";
        //console.log(country_name, country_count);
        if (country_name == "b\'\'" || country_name.length == 0) {
            country_name_string = "Unknown"
        } else {
            country_name_string = country_name.slice(2, country_name.length - 1);
        }
        country_data_string += (country_name_string + " : " + country_count + "<br>");
    }

    var port_data_string = "";
    var port_data_list = _this.getSortedListFromDict(port_data);
    for (var index in port_data_list) {
        port_data_string += (port_data_list[index][0] + " : " + port_data_list[index][1] + "<br>");
    }
    infopaneldiv.html(
        "<h2>IPv4 Network Block Information:</h2>" +
        "<h2 id='network'>" + oct_select + ".0.0.0/8" + "</h2>" +
        "<svg class='hilbertDetail'></svg>" +
        "<h4>Country info:</h4>" +
        "<p>" + country_data_string + "</p>" +
        "<h4>Port Info:</h4>" +
        "<p>" + port_data_string + "</p>"
        );

    _this.drawHilbertGrid(this, oct_select);

};
/*
Draws the interaction/label layer for the large curve
*/
Hilbert.prototype.drawHilbertInteractionLayer = function(){

	var data_offset = 3;
	var interactive_offset = 3;
	var expansion_factor = 1;
// 	var tile_size = Math.floor(expansion_factor / 2)
	var tile_size = expansion_factor;

	var div = d3.select("#hilbert").append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0);

	var infopaneldiv = d3.select("#infopaneldiv")
	    .attr("class", "infopanel");


	var hilbert_curve_256 = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [0, 3], [1, 3], [1, 2], [2, 2], [2, 3], [3, 3], [3, 2], [3, 1],
	[2, 1], [2, 0], [3, 0], [4, 0], [4, 1], [5, 1], [5, 0], [6, 0], [7, 0], [7, 1], [6, 1], [6, 2], [7, 2], [7, 3], [6, 3], [5, 3],
	[5, 2], [4, 2], [4, 3], [4, 4], [4, 5], [5, 5], [5, 4], [6, 4], [7, 4], [7, 5], [6, 5], [6, 6], [7, 6], [7, 7], [6, 7], [5, 7],
	[5, 6], [4, 6], [4, 7], [3, 7], [2, 7], [2, 6], [3, 6], [3, 5], [3, 4], [2, 4], [2, 5], [1, 5], [1, 4], [0, 4], [0, 5], [0, 6],
	[1, 6], [1, 7], [0, 7], [0, 8], [0, 9], [1, 9], [1, 8], [2, 8], [3, 8], [3, 9], [2, 9], [2, 10], [3, 10], [3, 11], [2, 11], [1, 11],
	[1, 10], [0, 10], [0, 11], [0, 12], [1, 12], [1, 13], [0, 13], [0, 14], [0, 15], [1, 15], [1, 14], [2, 14], [2, 15], [3, 15],
	[3, 14], [3, 13], [2, 13], [2, 12], [3, 12], [4, 12], [5, 12], [5, 13], [4, 13], [4, 14], [4, 15], [5, 15], [5, 14], [6, 14],
	[6, 15], [7, 15], [7, 14], [7, 13], [6, 13], [6, 12], [7, 12], [7, 11], [7, 10], [6, 10], [6, 11], [5, 11], [4, 11], [4, 10], [5, 10],
	[5, 9], [4, 9], [4, 8], [5, 8], [6, 8], [6, 9], [7, 9], [7, 8], [8, 8], [8, 9], [9, 9], [9, 8], [10, 8], [11, 8], [11, 9], [10, 9],
	[10, 10], [11, 10], [11, 11], [10, 11], [9, 11], [9, 10], [8, 10], [8, 11], [8, 12], [9, 12], [9, 13], [8, 13], [8, 14], [8, 15],
	[9, 15], [9, 14], [10, 14], [10, 15], [11, 15], [11, 14], [11, 13], [10, 13], [10, 12], [11, 12], [12, 12], [13, 12], [13, 13],
	[12, 13], [12, 14], [12, 15], [13, 15], [13, 14], [14, 14], [14, 15], [15, 15], [15, 14], [15, 13], [14, 13], [14, 12], [15, 12],
	[15, 11], [15, 10], [14, 10], [14, 11], [13, 11], [12, 11], [12, 10], [13, 10], [13, 9], [12, 9], [12, 8], [13, 8], [14, 8], [14, 9],
	[15, 9], [15, 8], [15, 7], [14, 7], [14, 6], [15, 6], [15, 5], [15, 4], [14, 4], [14, 5], [13, 5], [13, 4], [12, 4], [12, 5], [12, 6],
	[13, 6], [13, 7], [12, 7], [11, 7], [11, 6], [10, 6], [10, 7], [9, 7], [8, 7], [8, 6], [9, 6], [9, 5], [8, 5], [8, 4], [9, 4], [10, 4],
	[10, 5], [11, 5], [11, 4], [11, 3], [11, 2], [10, 2], [10, 3], [9, 3], [8, 3], [8, 2], [9, 2], [9, 1], [8, 1], [8, 0], [9, 0], [10, 0],
	[10, 1], [11, 1], [11, 0], [12, 0], [13, 0], [13, 1], [12, 1], [12, 2], [12, 3], [13, 3], [13, 2], [14, 2], [14, 3], [15, 3], [15, 2],
	[15, 1], [14, 1], [14, 0], [15, 0]];

	var _this = this;
	var width = this.svg.attr('width');
	var height = this.svg.attr('height');
	var width_offset = ((width/2) - (128 * expansion_factor));
	var height_offset = ((height/2) - (128 * expansion_factor));

	var g = this.svg.append('g').attr('class', 'hilbertGInteract').attr('transform', "translate(" + width_offset + "," + height_offset + ")");

	g.selectAll('.hilbertGInteract')
		.data(hilbert_curve_256)
		.enter()
		.append("rect")
		.attr("class", "helperlayer_text")
		.attr("x", function(d, i){ return d[0] * expansion_factor * 16 + interactive_offset + 8 * expansion_factor - 7; })
		.attr("y", function(d, i){ return d[1] * expansion_factor * 16 + interactive_offset + 8 * expansion_factor - 4; })
		.attr('width', function(d, i){
			return 15;
		})
		.attr('height', function(d, i){
			return 8;
		})
		.attr('fill', function(){
			return 'white';
		})
		.style("opacity", 0)
		.style("stroke-opacity", 0);

	 g.selectAll(".hilbertGInteract")
		.data(hilbert_curve_256)
		.enter()
		.append("text")
		.text(function(d, i){ return i; })
		.attr("class", "helperlayer_text")
		.attr("font-size", "7px")
		.style("fill", "#150045")
		.style("opacity", 0)
		.attr("x", function(d, i){ return d[0] * expansion_factor * 16 + interactive_offset + 8 * expansion_factor; })
		.attr("y", function(d, i){ return d[1] * expansion_factor * 16 + interactive_offset + 8 * expansion_factor; })
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "center")
		.attr("dy", "0.35em");


	g.selectAll(".hilbertGInteract")
		.data(hilbert_curve_256)
		.enter()
		.append("rect")
		.attr("x", function(d, i){ return d[0] * expansion_factor * 16 + interactive_offset; })
		.attr("y", function(d, i){ return d[1] * expansion_factor * 16 + interactive_offset; })
		.attr("height", function(d, i){
			return 16*expansion_factor;
		})
		.attr("width", function(d, i){
			return 16*expansion_factor;
		})
		.attr("class", function(d, i){
			return _this.octetsToClass(_this.numToOctets(i*256));
		})
		.attr("oct_select", function(d, i){
			return i;
		})
		.style("fill-opacity", "0")
		.style("stroke", "#ffed4e")
		.style("stroke-width", "1")
		.style("stroke-opacity", "0")
		.on("mouseover", function(){
			var active = d3.select(this).attr("active");
			var has_focus_item = d3.select("#infopaneldiv").attr("active");
			var oct_select = d3.select(this).attr("oct_select");

			if(has_focus_item != '1'){
				//nothing has focus, update display with current moused over
				//tile. Do nothing, otherwise.
				d3.select(this)
					.style("fill-opacity", "0.5")
					.style("stroke-opacity", "1");
				var class_ip = d3.select(this).attr("class");
				var oct_select = d3.select(this).attr("oct_select");

				_this.updateInfoPanel(_this, oct_select);

			}
			var coordinates = [0, 0];
			coordinates = d3.mouse(this)
			var x = coordinates[0];
			var y = coordinates[1];
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Network: " + oct_select + ".0.0.0/8")
                .style("left", x +(20 + width_offset) + "px")
                .style("top", y + (713 + height_offset) + "px")
                ;
		})
		.on("mouseout", function(){
			var has_focus_item = d3.select("#infopaneldiv").attr("active");
			if(has_focus_item != "1"){
			    // if nothing has focus, 'release' this tile
				d3.select(this)
					.style("fill-opacity", "0")
					.style("stroke-opacity", "0");
			}
			div.transition()
                .duration(500)
                .style("opacity", 0);
		})
		.on("click", function(){
            // if nothing is selected: highlight that square and show infopanel
            // if something is already selected, release the current thing and
            // select the new thing
            // if you click on the same square again, release the highlight and return to onhover behavior
			var active = d3.select(this).attr("active");
			var has_focus_item = d3.select("#infopaneldiv").attr("active");
			var oct_select = d3.select(this).attr("oct_select");

            console.log("active status:", active);
            console.log("this:", this);
			if(active == '1'){
			    // release current selected tile
				d3.select(this)
					.style("fill-opacity", "0")
					.style("stroke-opacity", "0");
				d3.select("#infopaneldiv").attr("active", "0");
				d3.select(this).attr("active", "0");

				// set the new tile to active and update info panel
				d3.select(this)
					.style("fill-opacity", "0.5")
					.style("stroke-opacity", "1");
				var class_ip = d3.select(this).attr("class");
				var oct_select = d3.select(this).attr("oct_select");

				_this.updateInfoPanel(_this, oct_select);

			} else {
			    // object is inactive.
			    // turn off the current objects
			    var active_objects = d3.selectAll("rect").filter("[active='1']");

			    active_objects.attr("active", "0")
			                    .style("fill-opacity", "0")
					            .style("stroke-opacity", "0");

                // set the current rect to active
 				d3.select(this)
					.style("fill-opacity", "0.5")
					.style("stroke-opacity", "1");
				var class_ip = d3.select(this).attr("class");
				var oct_select = d3.select(this).attr("oct_select");

                _this.updateInfoPanel(_this, oct_select);

                d3.select("#infopaneldiv").attr("active", "1");
 				d3.select(this).attr("active", "1");
			}
		});
};

/*
Posterized view of our hilbert curve, wasn't the winning color
solution.
Deprecated.
*/
Hilbert.prototype.drawHilbertGrid = function(currentObj, octet){

	var _this = currentObj;

	var hilbert_curve_256 = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [0, 3], [1, 3], [1, 2], [2, 2], [2, 3], [3, 3], [3, 2], [3, 1],
	[2, 1], [2, 0], [3, 0], [4, 0], [4, 1], [5, 1], [5, 0], [6, 0], [7, 0], [7, 1], [6, 1], [6, 2], [7, 2], [7, 3], [6, 3], [5, 3],
	[5, 2], [4, 2], [4, 3], [4, 4], [4, 5], [5, 5], [5, 4], [6, 4], [7, 4], [7, 5], [6, 5], [6, 6], [7, 6], [7, 7], [6, 7], [5, 7],
	[5, 6], [4, 6], [4, 7], [3, 7], [2, 7], [2, 6], [3, 6], [3, 5], [3, 4], [2, 4], [2, 5], [1, 5], [1, 4], [0, 4], [0, 5], [0, 6],
	[1, 6], [1, 7], [0, 7], [0, 8], [0, 9], [1, 9], [1, 8], [2, 8], [3, 8], [3, 9], [2, 9], [2, 10], [3, 10], [3, 11], [2, 11], [1, 11],
	[1, 10], [0, 10], [0, 11], [0, 12], [1, 12], [1, 13], [0, 13], [0, 14], [0, 15], [1, 15], [1, 14], [2, 14], [2, 15], [3, 15],
	[3, 14], [3, 13], [2, 13], [2, 12], [3, 12], [4, 12], [5, 12], [5, 13], [4, 13], [4, 14], [4, 15], [5, 15], [5, 14], [6, 14],
	[6, 15], [7, 15], [7, 14], [7, 13], [6, 13], [6, 12], [7, 12], [7, 11], [7, 10], [6, 10], [6, 11], [5, 11], [4, 11], [4, 10], [5, 10],
	[5, 9], [4, 9], [4, 8], [5, 8], [6, 8], [6, 9], [7, 9], [7, 8], [8, 8], [8, 9], [9, 9], [9, 8], [10, 8], [11, 8], [11, 9], [10, 9],
	[10, 10], [11, 10], [11, 11], [10, 11], [9, 11], [9, 10], [8, 10], [8, 11], [8, 12], [9, 12], [9, 13], [8, 13], [8, 14], [8, 15],
	[9, 15], [9, 14], [10, 14], [10, 15], [11, 15], [11, 14], [11, 13], [10, 13], [10, 12], [11, 12], [12, 12], [13, 12], [13, 13],
	[12, 13], [12, 14], [12, 15], [13, 15], [13, 14], [14, 14], [14, 15], [15, 15], [15, 14], [15, 13], [14, 13], [14, 12], [15, 12],
	[15, 11], [15, 10], [14, 10], [14, 11], [13, 11], [12, 11], [12, 10], [13, 10], [13, 9], [12, 9], [12, 8], [13, 8], [14, 8], [14, 9],
	[15, 9], [15, 8], [15, 7], [14, 7], [14, 6], [15, 6], [15, 5], [15, 4], [14, 4], [14, 5], [13, 5], [13, 4], [12, 4], [12, 5], [12, 6],
	[13, 6], [13, 7], [12, 7], [11, 7], [11, 6], [10, 6], [10, 7], [9, 7], [8, 7], [8, 6], [9, 6], [9, 5], [8, 5], [8, 4], [9, 4], [10, 4],
	[10, 5], [11, 5], [11, 4], [11, 3], [11, 2], [10, 2], [10, 3], [9, 3], [8, 3], [8, 2], [9, 2], [9, 1], [8, 1], [8, 0], [9, 0], [10, 0],
	[10, 1], [11, 1], [11, 0], [12, 0], [13, 0], [13, 1], [12, 1], [12, 2], [12, 3], [13, 3], [13, 2], [14, 2], [14, 3], [15, 3], [15, 2],
	[15, 1], [14, 1], [14, 0], [15, 0]]

// 	data2 = this.summarizeTopLevel(data);
// 	this.data2 = data2;


	var expansion_factor = 15;
// 	var tile_size = Math.floor(expansion_factor / 2)
	var tile_size = expansion_factor;
	var data_offset = 2;
	var interactive_offset = 0;

// 	console.log(data2)

// 	ports =["2323", "8080", "143", "22", "23", "443", "53", "465", "445", "8888", "80", "7547", "1900", "21", "25", "110", "995", "993", "502", "1911", "47808", "102", "20000"]

   //  var hilbert_border = this.svg;
//
// 	hilbert_border.;

    var _svg = d3.selectAll(".hilbertDetail")
	    .attr("height", 265)
        .attr("width", 265)
        .append("rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", 242)
        .attr("height", 242)
        .style("stroke", "#FFED4E")
        .style("fill", "none")
        .style("stroke-width", "1px")

	//draw the squares
	var _svg = d3.selectAll(".hilbertDetail")
	    .attr("height", 260)
        .attr("width", 260)
        // .append("rect")
//         .attr("x", 1043)
//         .attr("y", 1043)
//         .attr("width", 128)
//         .attr("height", 128)
//         .style("stroke", "#FFED4E")
//         .style("fill", "none")
//         .style("stroke-width", "1px")
        .append("g");

    var dat = _this.t.slice(Number(octet)*256, (Number(octet)+1)*256);
//     console.log("tile:", [Number(octet), Number(octet)+1] , "data:", dat);
//     console.log("length", dat.length);

    var min_x = 10000000;
    var min_y = 10000000;
    for(var i = 0; i < dat.length; i++) {
        if (dat[i]['coords']['x'] < min_x) {
            min_x = dat[i]['coords']['x'];
        }
        if (dat[i]['coords']['y'] < min_y) {
            min_y = dat[i]['coords']['y'];
        }
    }

//     console.log("min_x:", min_x, "min_y", min_y);

    first_pos_x = dat[0]['coords']['x'];
    first_pos_y = dat[0]['coords']['y'];
//     console.log("x", first_pos_x, "y", first_pos_y);

    _svg.selectAll("g")
        .data(dat)
        .enter()
        .append("rect")
        .attr("x", function(d, i){
            value = (d['coords']['x'] - min_x) * expansion_factor + data_offset;
            console.log("x:", d['coords']['x'],
                "capped:", d['coords']['x'] - min_x,
                "value:", value);
            return value;
            })
		.attr("y", function(d, i){
		    value = (d['coords']['y'] - min_y) * expansion_factor + data_offset;
            console.log("y:", d['coords']['y'],
                "capped:", d['coords']['y'] - min_y,
                "value:", value);
		    return value;
		    })
//         .attr("x", function(d, i){ return d[0]*expansion_factor + data_offset; })
//         .attr("y", function(d, i){ return d[1]*expansion_factor + data_offset; })
        .attr("width", tile_size)
        .attr("height", tile_size)
        .attr("class", function(d, i){
            return _this.octetsToClass(_this.numToOctets(i));
        })
        .attr("id", function(d, i){
            return _this.octetsToId(_this.numToOctets(i));
        })
        .style("fill", function(d, i){ return 'black'; })
        .style("fill-opacity", function(d, i){
            return _this.getOpacity(d['port']);
        });


//     var _svg = d3.select("#port_" + port)
//         .append("svg")
//         .attr("height", expansion_factor * 20)
//         .attr("width", expansion_factor * 20)
//         .append("g");
//     _svg.selectAll("g")
//         .data(hilbert_curve_256)
//         .enter()
//         .append("rect")
//         .attr("x", function(d, i){ return d[0]*expansion_factor + data_offset; })
//         .attr("y", function(d, i){ return d[1]*expansion_factor + data_offset; })
//         .attr("width", tile_size)
//         .attr("height", tile_size)
//         .attr("class", function(d, i){
//             return _this.octetsToClass(_this.numToOctets(i));
//         })
//         .attr("id", function(d, i){
//             return _this.octetsToId(_this.numToOctets(i));
//         })
//         .style("fill", function(d, i){ return 'black'; })
//         .style("fill-opacity", function(d, i){
//             return _this.get256opacity(port, null, data2[i], max);
//             //return get256opacity(port, null, data2[i]);
//         });

};

