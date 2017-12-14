/*
Initialize the control circle
*/

var tau = 2 * Math.PI;  // http://tauday.com/tau-manifesto
var w = 900;
var h = 900;
var radius = 240;
var circle_width = 20;
var circle_outer_pos = 30;
var port_frequency = 10000;     // only show ports with > this number frequency
var country_frequency = 500000; // only show countries with > this number IP addresses


var ControlCircle = function(data){

  this.data = data;
  this.tau = tau
  var svg = d3.selectAll("#control_circle").append("svg").attr("width", w).attr("height", h),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  this.svg = svg;
  return this;
}
/*
For changing b'United States' to United_States
*/
ControlCircle.prototype.cleanCountryCode = function(country){
  country = country.slice(2, -1);
  country = country.replace(/ /g, '_');
  country = country.replace(/\./g, '');
  return country
};
/*
Gets an entry from a list of format [{'key': key, ...}]
*/
ControlCircle.prototype.getEntryFromList = function(entry, list){
  for(l_idx in list){
    l = list[l_idx];
    if(entry == l['key']){
      return l;
    }
  }
  list.push({'key': entry, 'count': 0});

  //For some reason you can't just return the last item in the list.
  //Not sure why. Hidden JS optimization?
  for(l_idx in list){
    l = list[l_idx];
    if(entry == l['key']){
      return l;
    }
  }
}
/*
Summarizes port and country data for arc generation
*/
ControlCircle.prototype.getPortCountryMappings = function(data){
  var ports = {};
  var port_list = [];
  var port_max = 0;
  var countries = {};
  var country_list = [];
  var country_max = 0;

  console.log("In")

  var i = 0;
  for(d_idx in data){
    d = data[d_idx];
    if(d.hasOwnProperty('port')){
      var coords = d['coords'];

      for (const [port, count] of Object.entries(d['port'])) {
        if(!ports.hasOwnProperty(port)){
          ports[port] = [];
        }
        if(count > 0){
          ports[port].push({'coords': coords, 'value': count});
        }


        port_entry = this.getEntryFromList(port, port_list);
        port_entry['count'] += count;
        port_max += count;
      }
      for (const [country, count] of Object.entries(d['country'])) {
        if(!countries.hasOwnProperty(country)){
          countries[country] = [];
        }
        if(count > 0){
          countries[country].push({'coords': coords, 'value': count});
        }


        country_entry = this.getEntryFromList(country, country_list);
        if(country == 'United_States'){
          console.log("Requested " + country + ", got " + JSON.stringify(country_entry))
          console.log("Adding " + count + " to the US -> " + JSON.stringify(country_entry))
        }
        country_entry['count'] += count;
        country_max += count;
      }
    }
  }

  return [ports, port_list, port_max, countries, country_list, country_max];
};
/*
Draws an arc.
outer refers to if the circle is the inner circle (0) or outer one (1).
We set up our code the way it is current set up because... We originally had
a custom chord graph. Since we've abandoned the chord graph it might
be useful to revise this function.
*/
ControlCircle.prototype.drawArc = function(obj_list, obj_max, outer, type, colors){

  var width = this.svg.attr('width');
  var height = this.svg.attr('height');
  var _this = this;
  var innerRadius = radius + (outer * circle_outer_pos);
  var outerRadius = radius + (outer * circle_outer_pos) + circle_width;
  var arcs = []; //originally used to generate ribbons but if I *recall* still has use in this code
  var cur_angle_start = 0;

  //Generate our centered circle
  g = this.svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr("class", "circle_layer" + outer);


  //Draw our full arc
  var mainarc = g.selectAll('.circle_layer' + outer)
    .data(obj_list) //[{'key': key, 'count': count}]
    .enter()
    .append("path")
    .attr("d", function(d, i){
      //Draw our arc path.
      angle_length = tau * (d['count'] / obj_max);
      var arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(cur_angle_start)
                .endAngle(cur_angle_start + angle_length);
      centroid = arc.centroid();
      //push for later calculations, notably the text calculations
      arcs.push({'key': d['key'], 'startAngle': cur_angle_start, 'endAngle': cur_angle_start + angle_length, 'length': angle_length, 'centroid': centroid});
      cur_angle_start += angle_length;
      return arc();
    })
    .style("fill", function(d, i){
      var tag = d['key'];
      if(type == 'country'){
        tag = _this.cleanCountryCode(tag);
      }
      return colors.getColor(type, tag);
    })
    .attr("focus_color", function(d){
      var tag = d['key'];
      if(type == 'country'){
        tag = _this.cleanCountryCode(tag);
      }
      return colors.getColor(type, tag);
    })
    .attr("entity_type", type)
    .attr("entity_value", function(d){
      var tag = d['key'];
      if(type == 'country'){
        tag = _this.cleanCountryCode(tag);
      }
      return tag;
    })
    .attr('class', function(d) {
      var tag = d['key'];
      if(type == 'country'){
        tag = _this.cleanCountryCode(tag);
      }
      return 'ribbons circle_layer' + outer + ' ' + type + '_' + tag;
    })
    .on("click", function(){
      var active = d3.select(this).attr("active");
      var current_active = d3.select('svg').attr("current_active");

      if(active == "1"){
        //deactivate node
        d3.select(this)
          .style("stroke-opacity", "0")
          .attr("active", "0");

        var enttype = type;
        var value = d3.select(this).attr("entity_value");

        d3.selectAll('.' + type + "_" + value + "_h")
          .style("fill", "black")
          .style("fill-opacity", function(d, i){
            var original_opacity = d3.select(this).attr("normal_opacity");
            return original_opacity;
        });
      } else {
        //activation...
        //deactivate previous content
        d3.select(current_active)
          .style("stroke-opacity", "0")
          .attr("active", "0");
        d3.selectAll(current_active + "_h")
          .style("fill", "black");
        console.log("Deactivated " + current_active + ", " + current_active + "_h")

        //activate node
        var enttype = type;
        var value = d3.select(this).attr("entity_value");
        d3.select('svg').attr("current_active", '.' + type + "_" + value);

        d3.select(this)
          .style("stroke", "#FFED4E")
          .style("stroke-width", "2")
          .style("stroke-opacity", ".9")
          .attr("active", "1");

        var enttype = type;
        var value = d3.select(this).attr("entity_value");
        var focus_color = d3.select(this).attr("focus_color");
        console.log("Focus color: " + focus_color)

        console.log('.' + type + "_" + value)
        d3.selectAll('.' + type + "_" + value + "_h")
          .style("fill", focus_color);
      }
    });

    //Draw the labels...
    g.selectAll('textholder' + type)
      .data(obj_list) //[{'key': key, 'count': count}]
      .enter()
      .append("g")
      .attr("class", "textholder" + type)
      .attr("transform", function(d, i){
        var radians = Math.atan(arcs[i]['centroid'][1] / arcs[i]['centroid'][0])

        if(arcs[i]['centroid'][0] < Math.PI){
          radians += Math.PI;
        }

        var targetRadius = outerRadius + 20;
        if(outer == 0){
          targetRadius = -(innerRadius - 20);
        }

        var extended_x = targetRadius * Math.cos(radians);
        var extended_y = targetRadius * Math.sin(radians);

        var radians = Math.atan(arcs[i]['centroid'][1] / arcs[i]['centroid'][0]);
        var degree_rotation = (radians * (180 / Math.PI));

        if(extended_x < 0){
          //it's 180 +/- magic numbers. The magic numbers are for
          //correcting a rotation offset produced by a rotate-around-the-origin
          //we do on the text element later on. The magic numbers are discovered
          //through trial and error. I know, I know... Does anyone know how to
          //calculate the expected rotation offset required?
          degree_rotation += (outer == 1) ? 177 : 185;
        }

        return "rotate(" + degree_rotation + "),translate(" + targetRadius + "," + 0 + ")";
      })
      .append('text')
      .text(function(d){
        var tag = d['key'];
        if(type == 'country'){
          tag = _this.cleanCountryCode(tag);
          tag = tag.replace(/_/g, ' ');
        }
        return tag;
      })
      .attr("dy", "0.35em")
      .attr("transform", function(d, i){
        var radians = Math.atan(arcs[i]['centroid'][1] / arcs[i]['centroid'][0]);

        if(arcs[i]['centroid'][0] < Math.PI){
          radians += Math.PI;
        }

        var targetRadius = outerRadius + 10;
        if(outer == 0){
          targetRadius = innerRadius - circle_outer_pos;
        }

        var extended_x = targetRadius * Math.cos(radians);
        var extended_y = targetRadius * Math.sin(radians);
        var degree_rotation = 0;
        var extra_rotate = '';
        var layer_1_rotate = (radians > Math.PI / 2 && radians < 3*(Math.PI / 2)) && outer == 1;
        var layer_0_rotate = (radians < Math.PI / 2 || radians > 3*(Math.PI / 2)) && outer == 0;
        if(layer_1_rotate || layer_0_rotate){
          degree_rotation += 180;
          bbox = this.getBBox();
          extra_rotate = "rotate(" + 180 + "," + bbox.width / 2 + "," + bbox.height / 2 + ")";
        }
        return extra_rotate
      })
      .style("fill", "#D6D6D6");

    return arcs;
};
/*
Draws the hilbert curve in our current SVG
*/
ControlCircle.prototype.drawHilbertBig = function(active_ports, active_countries){
  var hilbert = new Hilbert(this.data, active_ports, active_countries, this.svg);
  hilbert.drawHilbertBig();
  hilbert.drawHilbertInteractionLayer();
};
/*
Switch to 256 mode, used for posterized views.
You can likely ignore this.
*/
ControlCircle.prototype.use256 = function(){
  //lifted from our hilbert file, we need to create a data handler .js file
  var t = this.data;
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
  var data_arr = [];
  var datum = {'port': {}, 'country': {}, 'coords': {'x': hilbert_curve_256[0][0] * 16, 'y': hilbert_curve_256[0][1] * 16}};
  var current_octet = 0;

  for(var i = 0; i < t.length; i++){
    datapoint = t[i];
    if(Math.floor(i / 256) > current_octet){
      data_arr.push(datum);
      current_octet = Math.floor(i / 256)
      datum = {'port': {}, 'country': {}, 'coords': {'x': hilbert_curve_256[current_octet][0]*3, 'y': hilbert_curve_256[current_octet][1] * 3}};
    }
    // Counting the number of ports
    if(datapoint.hasOwnProperty('port')){
      for (const [port, count] of Object.entries(datapoint['port'])) {
        if(!datum['port'].hasOwnProperty(port)){
          datum['port'][port] = 0;
        }
        datum['port'][port] += count;
      }
      // Counting the number of countries
      for (const [country, count] of Object.entries(datapoint['country'])) {
        country_temp = _this.cleanCountryCode(country_temp);
        if(!datum['country'].hasOwnProperty(country_temp)){
          datum['country'][country_temp] = 0;
        }
        datum['country'][country_temp] += count;
      }
    }
  }
  data_arr.push(datum);
  this.data = data_arr;
};
/*
Basically a filter.
*/
ControlCircle.prototype.reduceData = function(min_count, obj_list){
  var target_list = []
  var newmax = 0;
  for(d_idx in obj_list){
    var d = obj_list[d_idx];
    if(d['count'] >= min_count){
      target_list.push(d);
      newmax += d['count'];
    }
  }
  return [target_list, newmax];
};
/*
Gets keys from an array of dicts, used for arc labeling.
*/
ControlCircle.prototype.getKeys = function(obj_list, isCountry){
  var keys = [];
  for(d_idx in obj_list){
    var d = obj_list[d_idx];
    key = d['key'];
    if(isCountry){
      key = this.cleanCountryCode(key);
    }
    if(keys.indexOf(key) == -1){
      keys.push(key);
    }
  }
  return keys;
};
/*
Create a full arc, including drawing it.
*/
ControlCircle.prototype.createArc = function(){
  //Set up our colors
  var colors = new Colors();

  //Get our data
  [ports, port_list, port_max, countries, country_list, country_max] = this.getPortCountryMappings(this.data);

  //ports first
  [obj_list, obj_max] = this.reduceData(port_frequency, port_list); //Take countries with more than 10,000 IP entries
  obj_array = ports;
  colors.addSearchMode('port', this.getKeys(port_list, false)); //add the countries to the color list, used for easy mapping
  this.drawArc(obj_list, obj_max, 0, 'port', colors);

  //now for countries
  [obj_list, obj_max] = this.reduceData(country_frequency, country_list);
  obj_array = countries;
  colors.addSearchMode('country', this.getKeys(country_list, true));
  this.drawArc(obj_list, obj_max, 1, 'country', colors);
};