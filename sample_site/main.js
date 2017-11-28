d3.json("/home/rani/Downloads/viz/site/sample.json", function(data) {

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
	subsect = []
	for(var i = 0; i < 16; i++){
		for(var j = 0; j < 16; j++){
			subsect.push([i * expansion_factor * 16, j * expansion_factor * 16])
		}
	}

	console.log(subsect)

	svg.selectAll("g")
		.data(subsect)
		.enter()
		.append("rect")
		.attr("x", function(d, i){ return d[0] + interactive_offset; })
		.attr("y", function(d, i){ return d[1] + interactive_offset; })
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
			$("#ip_info_country").text(JSON.stringify(country_data));
			$("#ip_info_port").text(JSON.stringify(port_data));
		})
		.on("mouseout", function(){
			d3.select(this)
				.style("fill-opacity", "0")
				.style("stroke-opacity", "0");
		});
	

});