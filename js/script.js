$(document).ready(function () {
    'use strict';
    
	var query = "PREFIX n1: <http://polytech_nantes.org/caron_leflohic/accident/> \
            SELECT DISTINCT ?region (COUNT(DISTINCT ?Accident) AS ?number_of_Accident) \
            WHERE { ?Departement a n1:Departement . \
            ?Accident a n1:Accident . \
            ?Accident n1:departement ?Departement . \
            ?Departement n1:region ?region . } \
            GROUP BY ?region \
            ORDER BY DESC(?number_of_Accident)",
    
        queryURL = "http://localhost:3131/Accident/sparql?query=" + encodeURIComponent(query) + "&format=json";
    
	function getTableHeaders(headerVars) {
        var trHeaders = $(""),
            i;
        for (i in headerVars) {
            trHeaders.append($("" + headerVars[i] + ""));
        }
        return trHeaders;
    }	

	function getTableCell(fieldName, rowData) {
  	var td = $("");
  	var fieldData = rowData[fieldName];
  	td.html(fieldData["value"]);
  	return td;
	}
    
    function getTableRow(headerVars, rowData) {
        var tr = $(""),
            i;
        for (i in headerVars) {
            tr.append(getTableCell(headerVars[i], rowData));
        }
        return tr;
	}
    
    $.ajax({
        dataType: "jsonp",
        url: queryURL,
        success: function (data) {
            var table = $("#test"),

            // get the sparql variables from the 'head' of the data.
                headerVars = data.head.vars,

            // using the vars, make some table headers and add them to the table;
                trHeaders = getTableHeaders(headerVars);
            table.append(trHeaders);

            // grab the actual results from the data.                                     	 
            var bindings = data.results.bindings;

            // for each result, make a table row and add it to the table.
            for (rowIdx in bindings){
                table.append(getTableRow(headerVars, bindings[rowIdx]));
            }

            console.log(data.results.bindings);
        }
	});
});
