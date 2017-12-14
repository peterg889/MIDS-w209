/*
Custom colors class.
Makes it easier to coordinate color choices between different objects while selecting from 215? colors.
*/
var Colors = function(){

	/*
	https://jnnnnn.blogspot.com.au/2017/02/distinct-colours-2.html
	generator @ http://jnnnnn.github.io/category-colors-constrained.html

	Generator code used:
	function constraint(jab) {
	  return (jab.J > 45 && jab.J < 95) && 30*30 < jab.a*jab.a+jab.b*jab.b;
	}
	*/

	this.colors = ["#3957ff", "#d3fe14", "#c9080a", "#0e7c1b", "#fc90fd", "#0ec9ff", "#ff9506", "#b10698", "#0efcbf", "#0bc811", "#fd7282", "#aa58f9", "#b2aa02", "#7b95fe", "#ff26bd", "#c06007", "#c34367", "#fed134", "#40ff61", "#fe480e", "#e526fe", "#0487d5", "#659b1d", "#7d30fe", "#a10ecf", "#a0d553", "#0ad17f", "#f71f4c", "#c653ab", "#cb80ff", "#fd7e4e", "#cf5440", "#716ede", "#fd76bd", "#07ad55", "#aa3f0f", "#2ca7fc", "#d8068d", "#f24386", "#d18001", "#9f83fa", "#dd6fd9", "#e4ac04", "#be073d", "#b252cb", "#86b90c", "#aefd7d", "#cdcc0e", "#64ed91", "#894ac9", "#96ed01", "#f2f25b", "#af2870", "#e86c04", "#cb0bca", "#036cc7", "#4279fd", "#f00613", "#f55853", "#6cc758", "#0e9628", "#2de50f", "#de055e", "#a13da6", "#fc40e9", "#d33c01", "#ba11fe", "#b63a35", "#e05ea5", "#c85bf8", "#2fad09", "#8c59f9", "#c7e748", "#dc596a", "#8f9d09", "#5e57d7", "#e20abb", "#d6273b", "#1ee064", "#578502", "#c24587", "#5190ec", "#e46841", "#fd74e2", "#a104fe", "#76d129", "#85ea6d", "#cf52d1", "#69b13c", "#f08530", "#c40362", "#abc031", "#807efe", "#fe4e6f", "#f7689a", "#e09711", "#e67dfc", "#ae324f", "#20bf4d", "#4f6cd3", "#be511f", "#e551c3", "#7656cd", "#b24199", "#b81fd8", "#e74230", "#d95815", "#b275f4", "#b1d600", "#55ff07", "#d75583", "#ceb70b", "#05e49b", "#ffb82b", "#9a49c0", "#dc3ea1", "#f25cfd", "#e5e603", "#c916a0", "#c9464e", "#fd54ad", "#fe6528", "#ff7463", "#d83579", "#cf15fd", "#996fe7", "#e53c67", "#ef1e94", "#ed01e4", "#ff5acc", "#78fe8b", "#d2fc69", "#b305b7", "#ce73e8", "#b92f14", "#6061f9", "#b54ab3", "#6780e8", "#2198e1", "#41a438", "#3ab8fd", "#e5d83d", "#8bfe56", "#e4434e", "#cd3c2b", "#985cd3", "#61a0fd", "#05bf6c", "#c5a200", "#d27010", "#7aa704", "#5fb702", "#e6c12d", "#70eb43", "#a8eb5b", "#892bec", "#a63382", "#196cef", "#b062dc", "#fe2f32", "#24fda5", "#ffe00f", "#bb1d25", "#7651fa", "#c92c51", "#3b7bd7", "#0a87f7", "#90c444", "#b4f943", "#1ff479", "#b90587", "#9646f4", "#a544e4", "#d959ef", "#ee637e", "#e86abf", "#9bae1f", "#27cf4c", "#f3a726", "#6dd956", "#932dd2", "#c42b79", "#338811", "#cc36b6", "#8772eb", "#d228e2", "#ea5528", "#fe2e6f", "#f528d1", "#fe6346", "#fe7314", "#57d473", "#97ca15", "#92de30", "#b94528", "#d9230e", "#ea3506", "#c84de4", "#e97438", "#fd75fb", "#5b4aff", "#bf3e04", "#bd23ad", "#7d65fe", "#e4074a", "#e91230", "#499417", "#b946fc", "#189f05", "#eb04a8", "#ee2077", "#de5955", "#fe4052", "#ed6769", "#e47b02"];
// 	console.log("Color count: " + this.colors.length);
	this.colorSearchModes = {};
	return this;
};

Colors.prototype.countColors = function(){
	console.log("Color count: " + this.colors.length);
};

Colors.prototype.addSearchMode = function(colorSearchModeTag, colorSearchModeList){
	this.colorSearchModes[colorSearchModeTag] = colorSearchModeList;
};

Colors.prototype.getColor = function(colorSearchModeTag, tag){
	var colorSearchModes = this.colorSearchModes[colorSearchModeTag];
	var color_idx = colorSearchModes.indexOf(tag);
	return this.colors[color_idx];
};