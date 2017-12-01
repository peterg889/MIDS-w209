d3.json("sample.json", function(data) {

	var incrementOctets = function(octets){
		var max = 1;
		var inc_next = true;
		for(var i = max; i >= 0; i--){
			if(inc_next){
				octets[i]++;
				if(octet[i] > 255){
					octets[i] = 0;
					inc_next = true;
				} else{
					inc_next = false;
				}
			}
		}
		return octet;
	};

	var numToOctets = function(num){
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

	var octetsToClass = function(octets){
		var max = 3;
		var target_address = ""
		for(var i = 0; i < max; i++){
			target_address += octets[i];
			if(i < max - 2){ target_address += "_"; }
		}
		return "ip_zl" + max + "_" + octets[0]
	};

	var octetsToId = function(octets){
		var max = 4;
		var target_address = ""
		for(var i = 0; i < max; i++){
			target_address += octets[i] + "_"
		}
		return "ip_" + target_address
	};

	var getRandomColor = function() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	var getOpacity = function(ports){

		if(ports == undefined){
			return 0;
		}

		best_port = 0;
		best_count = 0;
		total_count = 0;
		for (const [port, count] of Object.entries(ports)) {
			if(count > best_count){
				best_count = count;
				best_port = port;
			}
			total_count += count;
		}
		return best_count / total_count;
	};

	var selectColor = function(ports, colors){
		var ports_mapped = ['80', '443', '7547', '8080', '22', '143', '53', '993', '23', '21', '445'];

		if(ports == undefined){
			return "white";
		}

		best_port = 0;
		best_count = 0;
		for (const [port, count] of Object.entries(ports)) {
			if(count > best_count){
				best_count = count;
				best_port = port;
			}
		}
		//var port_idx = ports_mapped.indexOf(parseInt(best_port,10))
		var port_idx = ports_mapped.indexOf(best_port)
		if(port_idx == -1){ port_idx = colors.length - 1; }
		//return colors[port_idx];
		return colors[port_idx];
	};

	var getAllCountryData = function(oct_select, t){
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

	var getAllPortData = function(oct_select, t){
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

	
	var colors = [
	'#cab2d6',
	'#a6cee3',
	'#33a02c',
	'#1f78b4',
	'#b2df8a',
	'#fb9a99',
	'#e31a1c',
	'#fdbf6f',
	'#ff7f00',
	'#6a3d9a',
	'#ffff99',
	'#b15928'
	];
	
	/*
	var colors = [
		'#e41a1c',
		'#377eb8',
		'#4daf4a',
		'#984ea3',
		'#ff7f00',
		'#ffff33',
		'#a65628'
	]
	*/



	t = data;

	var expansion_factor = 3;
	var data_offset = 3;
	var interactive_offset = 2;

	max_tile_length = 0;
	length = 0;
	for(var i = 0; i < t.length; i++){
		if(t[i]['coords']['x'] > max_tile_length){
			max_tile_length = t[i]['coords']['x'];
		}
	}

	length = max_tile_length*expansion_factor + 10;

	var svg = d3.select("#hilbert")
		.append("svg")
		.attr("height", length)
		.attr("width", length)
		.append("g");

	var tile_size = Math.floor(expansion_factor / 2)
	tile_size = 3

	var div = d3.select("#hilbert").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

	var infopaneldiv = d3.select("#infopaneldiv")
    .attr("class", "infopanel")				
    .style("opacity", 0.9)
    .style("left", 850 + "px")
    .style("top", 0 + "px");

	//draw the squares
	svg.selectAll("g")
		.data(t)
		.enter()
		.append("rect")
		.attr("x", function(d, i){ return d['coords']['x']*expansion_factor + data_offset; })
		.attr("y", function(d, i){ return d['coords']['y']*expansion_factor + data_offset; })
		.attr("width", tile_size)
		.attr("height", tile_size)
		.attr("class", function(d, i){ 
			return octetsToClass(numToOctets(i)); 
		})
		.attr("id", function(d, i){
			return octetsToId(numToOctets(i));
		})
		.style("fill", function(d, i){ return selectColor(d['port'], colors); })
		.style("fill-opacity", function(d, i){ return getOpacity(d['port']); });
	

	//this will draw the actual hilbert curve
	/*
	svg.selectAll("g")
		.data(t)
		.enter()
		.append("line")
		.attr("x1", function(d, i){ return d['coords']['x']*expansion_factor + data_offset; })
		.attr("y1", function(d, i){ return d['coords']['y']*expansion_factor + data_offset; })
		.attr("x2", function(d, i){ 
			var target_idx = i + 1; 
			if(target_idx > t.length - 1){ target_idx = i; } ; 
			return t[target_idx]['coords']['x']*expansion_factor + data_offset; 
		})
		.attr("y2", function(d, i){ 
			var target_idx = i + 1; 
			if(target_idx > t.length - 1){ target_idx = i; } ; 
			return t[target_idx]['coords']['y']*expansion_factor + data_offset; 
		})
		.attr("class", function(d, i){ 
			return octetToClass(numToOctet(i)); 
		})
		.style("stroke", "rgb(30,30,30)")
		.style("stroke-width", "1");
	*/
	
	//draw debug grid + interaction layer (debug grid is the interaction layer for now)

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

	subsect = []
	for(var i = 0; i < 16; i++){
		for(var j = 0; j < 16; j++){
			subsect.push([i * expansion_factor * 16, j * expansion_factor * 16])
		}
	}

	// console.log(subsect)
	var getXCoord = function (d, i){
		return d[0] * expansion_factor * 16 + interactive_offset; 
	}
	var getYCoord = function (d, i){
		return d[1] * expansion_factor * 16 + interactive_offset; 
	}

	svg.selectAll("g")
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
			return octetsToClass(numToOctets(i*256)); 
		})
		.attr("oct_select", function(d, i){ 
			return i; 
		})
		.style("fill-opacity", "0")
		.style("stroke", "red")
		.style("stroke-width", "1")
		.style("stroke-opacity", "0")
		.on("mouseover", function(){
			d3.select(this)
				.style("fill-opacity", "0.5")
				.style("stroke-opacity", "1");
			var class_ip = d3.select(this).attr("class");
			var oct_select = d3.select(this).attr("oct_select");
			//$("#ip_info").text("Current class: " + class_ip);
			var country_data = getAllCountryData(oct_select, t);
			var port_data = getAllPortData(oct_select, t);
			var coordinates = [0, 0];
			coordinates = d3.mouse(this)
			var x = coordinates[0];
			var y = coordinates[1];
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html("Octet block: " + oct_select)	
                .style("left", x +20 + "px")		
                .style("top", y + 20 + "px");		
                // .style("left", (this.x) + "px");	
                // .style("top", (this.y) + "px");	
            var country_data_list = "";
            for (var country in country_data) {
            	var country_length = country.length;
            	var country_string = "";
            	console.log(country)
            	if (country == "b\'\'" || country_length == 0) {
            		country_string = "Unknown"
            	} else {
            		country_string = country.slice(2,country_length - 1);
            	}
            	// country_data_list += (country + " : " + country_data[country] + "<br>");
            	country_data_list += (country_string + " : " + country_data[country] + "<br>");
            }

            var port_data_list = "";
            for (var port in port_data) {
            	port_data_list += (port + " : " + port_data[port] + "<br>");
            }
            infopaneldiv.html("<b>Octet Block:</b> " + oct_select +
            	"<br><br><b>Country info:</b> <br>" + 
            	// JSON.stringify(country_data) + 
            	country_data_list + 
            	"<br><br><b>IP Info:</b> <br>" + 
            	port_data_list);
			$("#ip_info_country").text(JSON.stringify(country_data));
			$("#ip_info_port").text(JSON.stringify(port_data));
		})
		.on("mouseout", function(){
			d3.select(this)
				.style("fill-opacity", "0")
				.style("stroke-opacity", "0");
			div.transition()		
                .duration(500)		
                .style("opacity", 0);	
		});
});