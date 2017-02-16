$(document).ready(function () {
    'use strict';
    
    var query = "PREFIX acc: <http://polytech_nantes.org/caron_leflohic/accident/> " +
                "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                "SELECT DISTINCT ?region ?departement (COUNT(?Accident) AS ?nbAccidents) " +
                "WHERE { ?Departement a acc:Departement ." +
                  "?Accident a acc:Accident ." +
                  "?Accident acc:departement ?Departement ." +
                  "?Departement acc:region ?region ." +
                  "?Departement rdfs:label ?departement" +
                "}" +
                "GROUP BY ?region ?departement " +
                "ORDER BY ?region DESC (?nbAccidents) ",
        queryURL = "http://localhost:3131/Accident/sparql?query=" + encodeURIComponent(query) + "&format=json";
    
    function calculerSomme(data, nomRegion) {
        var sum = 0,
            dept,
            i = 0;
        
        for (i = 0; i < data[nomRegion].length; i += 1) {
            dept = data[nomRegion];
            sum += parseInt(dept[i].nbAcc.value);
        }
        return sum;
    }
    
    $.ajax({
        dataType: "jsonp",
        url: queryURL,
        success: function (data) {
            var results = data.results.bindings,
                keys = [],
                datas = [],
                i = 0,
                result,
                regionName = "";
            
            //Initialisation de la structure de données
            for (i = 0; i < results.length; i += 1) {
                result = results[i];
                regionName = result.region.value;
                
                datas[regionName] = [];
            }
            for (i = 0; i < results.length; i += 1) {
                result = results[i];
                regionName = result.region.value;
                datas[regionName].push({departement : result.departement, nbAcc: result.nbAccidents});
            }

            console.log(datas);
            
            $('#world-map').vectorMap({
                map: 'fr_regions_2016_merc',
                series: {
                    regions: [{
                        scale: ['#C8EEFF', '#0071A4']
                    }]
                },
                onRegionTipShow: function (e, el, code) {
                    var map = $('#world-map').vectorMap('get', 'mapObject'),
                        regionName = map.getRegionName(code),
                        content = "",
                        i = 0,
                        nbAccRegion = calculerSomme(datas, regionName);
                    el.html(el.html() + ' (Nombre d\'accidents : ' + nbAccRegion + ')');
                    content = "<h2>Nom de la région : " + regionName + "</h2><table id =\"departements\">" +
                        "<p>Nombre d'accidents dans la région : " + nbAccRegion +
                        "<tr><th>Département</th><th>Nombre d'accidents</th></tr>" +
                        "<tbody>";
                    for (i = 0; i < datas[regionName].length; i += 1) {
                        content += "<tr>" +
                            "<td>" + datas[regionName][i].departement.value + "</td>" +
                            "<td>" + datas[regionName][i].nbAcc.value + "</td></tr>";
                    }
                    content += "</tbody></table>";
                    $("#content").html(content);
                }
            });
        }
    });
});