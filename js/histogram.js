$(document).ready(function() {
    
    function Histogram(id, width, height, abscisse) {  
        var that = this;
        
        this.abscisse = abscisse;
        
        this.margin = { top: 60, bottom: 150, left: 70, right: 100 };
        this.width = width - this.margin.left + this.margin.right;
        this.height = height - this.margin.top + this.margin.bottom;
        
        // x variables
        this.x = d3.scale.ordinal()
            .rangeRoundBands([0, this.width], 0.1);
        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient("bottom");
        
        // y variables
        this.y = d3.scale.linear()
            .range([this.height, 0]);
        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient("left");
        
        // svg        
        this.svg = d3.select("#" + id).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        
        
        
        // *************************
        //          AXIS
        // *************************
        this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.height + ")")
                .call(this.xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");
        
        this.svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(0, 0)")
                .call(this.yAxis);
        
        this.svg.append("text")
            .attr("class", "text-axis")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + 0 + "," + (-this.margin.top / 2 + 10) + ")")
            .text("Nombre d'accidents");

        this.xLabel = this.svg.append("text")
            .attr("class", "text-axis")
            .attr("text-anchor", "middle")
            .attr("transform", "translate("+ (this.width + this.margin.left - 20) + ", " + (this.height) + ")")
            .text(abscisse);
        
        // *************************
        //          TOOLTIP
        // *************************
        this.tooltip = d3.select("#" + id).append("div")
            .attr("id", "histogram_tooltip");
        
        this.mouseover = function(d) {
            that.tooltip.html("<div><strong>" + d.x + "</strong></div><div>" + d.y + "</div>")
                .style("display", "block");
        }
        
        this.mouseout = function(d) {
            that.tooltip.style("display", "none");
        }
        
        this.mousemove = function(d) {
            that.tooltip.style("left", d3.event.layerX + 20 + "px")
                .style("top", d3.event.layerY -30  + "px");
        }
        
        // *************************
        //          UPDATE
        // *************************
        this.update = function(datas) {
            var that = this;
            
            this.svg.selectAll(".bar")
                .remove();
            
            // Update x variables
            this.x.domain(datas.map(function(d) { return d.x; }));
            
            // Update y variables
            this.y.domain([0, d3.max(datas, function(d) { return d.y; })]);
            
            var bar = this.svg.selectAll(".bar")
                .data(datas)
                .enter()
                .append("g")
                    .attr("class", "bar");

            bar.append("rect")
                .attr("x", function(d) { return that.x(d.x); })
                .attr("y", function(d) { return that.y(d.y); })
                .attr("width", this.x.rangeBand())
                .attr("height", function(d) { return that.height - that.y(d.y); })
                .on("mouseover", this.mouseover)
                .on("mouseout", this.mouseout)
                .on("mousemove", this.mousemove);
            
            bar.append("text")
                .attr("dy", ".75em")
                .attr("x", function(d) { return that.x(d.x) + that.x.rangeBand() / 2; })
                .attr("y", function(d) { return that.y(d.y) - 15; })
                .attr("text-anchor", "middle")
                .text(function(d) { return d.y; });
            
            this.svg.select(".x")
                .transition()
                .duration(1000)
                .ease("linear")
                .call(this.xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");
            
            this.svg.select(".y")
                .transition()
                .duration(1000)
                .ease("linear")
                .call(this.yAxis);
            
            this.xLabel
                .text(histogram.abscisse);
        }
    };
    
    $("#select_abscisses").on("change", function() {
        var choix = $("#select_abscisses").val();
        if (choix == "geo") {
            $("#select_carac").hide();
            $("#select_geo").show();
        } else if (choix == "carac") {
            $("#select_geo").hide();
            $("#select_carac").show();
        } else {
            console.log("Erreur ! Valeur de la variable \"choix\" : " + choix);
        }
    });
    
    $("#request").click(function() {
        var value = "";
        var type = "";
        if ($("#select_geo").is(":visible")) {
            value = $("#select_geo").val();
            type = "geo";
            histogram.abscisse = $("#select_geo option:selected" ).text();
        } else if ($("#select_carac").is(":visible")) {
            value = $("#select_carac").val();
            type = "carac";
            histogram.abscisse = $("#select_carac option:selected" ).text();
        } else {
            console.log("Erreur ! Valeur de la variable \"value\" : " + value);
        }
        
        var variable = value.split(":")[1];
        
        // Generate query
        var query = "";
        if (type == "geo") {
            query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                    PREFIX acc: <http://polytech_nantes.org/caron_leflohic/accident/>\
                    SELECT DISTINCT ?" + variable + " (COUNT(DISTINCT ?Accident) AS ?number_of_Accident)\
                    WHERE {\
                        ?departement a acc:Departement .\
                        ?Accident a acc:Accident .\
                        ?Accident acc:departement ?departement .\
                        ?departement " + value + " ?" + variable + " .\
                    }\
                    GROUP BY ?" + variable + "\
                    ORDER BY DESC(?number_of_Accident)";
        } else if (type == "carac") {
            query = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                    PREFIX acc: <http://polytech_nantes.org/caron_leflohic/accident/>\
                    SELECT DISTINCT ?" + variable + " (COUNT(DISTINCT ?Accident) AS ?number_of_Accident)\
                    WHERE {\
                        ?departement a acc:Departement .\
                        ?Accident a acc:Accident .\
                        ?Accident " + value + " ?" + variable + " .\
                    }\
                    GROUP BY ?" + variable + "\
                    ORDER BY DESC(?number_of_Accident)";
        } else {
            console.log("Erreur ! Valeur de la variable \"type\" : " + type);
        }
        
        // Generate query url
        var queryURL = "http://localhost:3131/Accident/sparql?query=" + encodeURIComponent(query) + "&format=json";
        
        // Request server
        sendRequest(queryURL);
        
    });
    
    var histogram = new Histogram("histogram", 800, 300, $("#select_geo option:selected").text());
    $("#request").trigger("click");
    
    function sendRequest(queryURL) {
        $.ajax({
            dataType: "jsonp",
            url: queryURL,
            beforeSend: function() {
                // Show loading spinner
                $("#histogram_loader").show();
            },
            complete: function() {
                // Hide loading spinner;
                $("#histogram_loader").hide();
            },
            success: function(data) {            
                // Grab the actual results from the data.
                var results = data.results.bindings;
                
                // Transform data in a usable structure for our histogram
                var datas = [];
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    var keys = [];
                    for (var key in result) {
                        keys.push(key);
                    }
                    datas.push({x: result[keys[0]].value, y: parseInt(result[keys[1]].value)});
                }
                
                histogram.update(datas);
            },
            error: function() {
                $("#histogram_loader").hide();
            }
        });
    }
});