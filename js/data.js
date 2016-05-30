var plan = data.filter(function(d) { return d.status == "П" && d.function_title == "Всего расходов" ; });
var ispolneno = data.filter(function(d) { return d.status == "О" && d.function_title == "Всего расходов"; });

var years = plan.map(function(d) { return d.year; });


function get_data_by_year(year) {
	var data_for_year = data.filter(function(d) { return d.year == year; });
	var response = [];
	var poplanu = data_for_year.filter(function(d) { return d.status == "П"; });
	var pofaktu = data_for_year.filter(function(d) { return d.status == "О"; });

	

	for (var a = 0; a < poplanu.length; a++) {
		for (var b = 0; b < pofaktu.length; b++) {
			if (poplanu[a].function_title == pofaktu[b].function_title) {
				response[a] = [];
				var percentage = (pofaktu[b].amount - poplanu[a].amount) / poplanu[a].amount * 100;
				var f_title = poplanu[a].function_title;
				response[a].push(f_title, poplanu[a].amount, pofaktu[b].amount, percentage)
			} else {
				continue;
			}
		}
	}
	return response;
}

var formatter = d3.format(",.1f");

var show_years = ispolneno.map(function(d) { return d.year; });

var show_year = show_years[show_years.length - 1];
console.log(show_year);

var year_selection = get_data_by_year(show_year);

var table = d3.select("#table")
				.append("table");

table.append("thead")
	.append("tr")
	.selectAll("td")
	.data(["Статья расходов", "По плану", "Исполнено", "%"])
	.enter()
	.append("td");

table.selectAll("td")
	.append("text")
	.text(function(d) { return d; });

var tbody = table.append("tbody");

var trs = tbody.selectAll("tr")
	.data(year_selection)
	.enter()
	.append("tr");

trs.selectAll("td")
	.data(function(d) { return get_values(d); })
	.enter()
	.append("td")
	.append("text")
	.text(function(d) { return (typeof(d) == "number") ? formatter(d) : d; });

function get_values(d) {
	var alist = [];
	for(key in d) {
    if(d.hasOwnProperty(key)) {
        alist.push(d[key]);
    }
}
return alist;
}



var target = d3.select("#graph")
				.append("svg")
                .attr({
                   width: 800,
                   height: 250 
                });
var legend_data = ["По плану", "По факту"];

var color = d3.scale.ordinal()
			.domain(legend_data)
			.range(["#EB6A65", "#2A2F4E"])

var legend = target.append("g")
				.attr("transform", "translate(120, 10)");
	legend.selectAll("circle")
				.data(legend_data)
				.enter()
				.append("circle")
				.attr({
					cx: 10,
					cy: function(d, i) { return i * 15; },
					r: 4,
					class: "legend",
					fill: function(d) { return color(d); }
				});
	legend.selectAll("text")
		.data(legend_data)
		.enter()
		.append("text")
		.attr({
			x: 20,
			y: function(d, i) { return i * 15 + 3; },
			"font-size": "10px"
		})
		.text(function(d) { return d; });


var x_scale = d3.scale.ordinal()
                .domain(years)
                .rangeRoundBands([0, 700]);
var y_scale = d3.scale.linear()
				.domain([0, d3.max(plan, function(d) { return d.amount; })])
				.range([240, 10]);

var formatter = d3.format("g");

var x_axis = d3.svg.axis()
				.scale(x_scale)
				.orient("bottom");
var y_axis = d3.svg.axis()
				.scale(y_scale)
				.orient("left")
				.ticks(5)
				.tickFormat(function(d) { return formatter(d); });


var line = d3.svg.line()
			.x(function(d) { return x_scale(d.year) + 80 + x_scale.rangeBand() / 2; })
			.y(function(d) { return y_scale(d.amount); });

var area = d3.svg.area()
    .x(function(d) { return x_scale(d.year) + 80 + x_scale.rangeBand() / 2; })
    .y0(230)
    .y1(function(d) { return y_scale(d.amount); });

d3.select("svg")
	.append("path")
	.attr("d", line(plan))
	.attr("class", "plan");

d3.select("svg")
	.append("path")
	.attr("d", line(ispolneno))
	.attr("class", "fact");

  target.append("path")
      .datum(plan)
      .attr("class", "area poplanu")
      .attr("d", area);
  target.append("path")
      .datum(ispolneno)
      .attr("class", "area ispolneno")
      .attr("d", area);

target.selectAll("circle.fact")
	.data(ispolneno)
	.enter()
	.append("circle")
	.attr({
		cy: function(d) { return y_scale(d.amount); },
		cx: function(d, i) { return i * x_scale.rangeBand() + x_scale.rangeBand() / 2 + 80; },
		r: 3,
		class: "fact",
		fill: "#2A2F4E",
		title: function(d) { return d.amount; }
	});


target.selectAll("circle.plan")
	.data(plan)
	.enter()
	.append("circle")
	.attr({
		cy: function(d) { return y_scale(d.amount); },
		cx: function(d, i) { return i * x_scale.rangeBand() + x_scale.rangeBand() / 2 + 80; },
		r: 3,
		class: "plan",
		fill: "#EB6A65",
		title: function(d) { return d.amount; }
	});   




target.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(80, 230)")
	.call(x_axis);

target.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(80, -10)")
	.call(y_axis);
