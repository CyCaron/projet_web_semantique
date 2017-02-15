$(document).ready(function() {
    
    var query = "PREFIX n1: <http://polytech_nantes.org/caron_leflohic/accident/> \
                SELECT DISTINCT ?region (COUNT(DISTINCT ?Accident) AS ?number_of_Accident) \
                WHERE { ?Departement a n1:Departement . \
                ?Accident a n1:Accident . \
                ?Accident n1:departement ?Departement . \
                ?Departement n1:region ?region . } \
                GROUP BY ?region \
                ORDER BY DESC(?number_of_Accident)";
    
    var queryURL = "http://localhost:3131/Accident/sparql?query=" + encodeURIComponent(query) + "&format=json";

    
    $.ajax({
        dataType: "jsonp",
        url: queryURL,
        success: function(data) {
            var table = $("#test");

            // get the sparql variables from the 'head' of the data.
            var headerVars = data.head.vars;
            console.log(headerVars);

            // using the vars, make some table headers and add them to the table;
            var trHeaders = getTableHeaders(headerVars);
            table.append(trHeaders);

            // grab the actual results from the data.
            var bindings = data.results.bindings;
            console.log(bindings)
        }
    });
});