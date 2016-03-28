$(function(){

//////////////////////////////////code pour l'autocomplétion du champ de recherche de la commune//////////////////////////////////

  $('#commune').autocomplete({
    source : function(requete, reponse){ //reponse est la liste retournée par ajax
    $.ajax({
            url : 'commune.php', //on va utilise commune.php qui va chercher les informations dans la base et les renvoyer en JSON
            dataType : 'json', 
            data : {
              commune : $('#commune').val(), //on récupère la valeur du champ de recherche
              maxRows : 10 //nombre maximal de ligne d'auto-complétion affichées
            },
            success : function(donnee){ //fonction de callback    
                //console.log(donnee);
                //on pense à faire un appel à retirerDoublonsTab() qui permet de s'assurer qu'il n'y aura pas de doublons dans les résultats d'autocomplétion
                reponse(retirerDoublonsTab($.map(donnee, function(objet){
                  return objet.Ville;
                })));
            },
            error : function(){
              console.log("error");
            }
        });
    },
    minLength : 3 //nombre minimal de lettre à entrer avant de proposer les résultats d'auto-complétion
  });



//////////////////////////////////Mise en place des jQuery UI utilisées pour le site//////////////////////////////////

  $("#calendrier").datepicker(); //le widget calendrier (UI Datepicker) pour choisir la date minimale de prise des photos
  
  //on crée les onglets (UI Tabs) pour les vues "photo" et "table", respectivement nommées Diaporama et Informations
  $(function() {
    $("#onglets").tabs();
  });

  
  //on crée la table (plugin DataTables) pour l'onglet Informations
  $(function() {
    $("#table_infos").DataTable();
  });

  //on utilise les UI Dialog (fenêtres modales)
  //une fenêtre dans le cas où la recherche ne retourne aucun résultat
  $( "#aucun_resultat" ).dialog({
    autoOpen: false //on l'emêche de s'ouvrir au lancement de la page
  });
  //une fenêtre pour afficher des informations sur une photo
  $("#infos_photo").dialog({
    autoOpen: false,   
    //on utilise le code suivant pour fixer la fenêtre au centre de l'écran (avec toujours la possibilité de la déplacer)
    open: function(event, ui) {
        $(event.target).dialog('widget')
            .css({ position: 'fixed' })
            .position({ my: 'center', at: 'center', of: window });
    }
  });



//////////////////////////////////Récupération des photos et de leurs infos depuis Flickr//////////////////////////////////

  $("#recup_photos").on('click', function(){
    //on s'assure que les fenêtres modales sont bien fermées (permet de ne pas la laisser ouverte lors d'une nouvelle recherche)
    $("#infos_photo").dialog("close");
    $("#aucun_resultat").dialog("close");

    //on récupère l'URL du service web de Flickr pour récupérer en JSON les données des photos
    var flickrSearch = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=3a0a53c4c4a709d402e4b3336d6584fa&format=json&nojsoncallback=1";
    //si l'utilisateur a choisi de spécifier une date minimale de prise des photos, on l'ajoute à l'url Flickr
    if ($("#calendrier").val()) {
      flickrSearch += "&min_upload_date=" + $("#calendrier").val();
    }

    //on récupère ensuite l'URL du service web de Flickr pour récupérer en JSON des informations sur les photos
    var flickrGetInfos = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=3a0a53c4c4a709d402e4b3336d6584fa&format=json&nojsoncallback=1";

    /*
    getJSON est un "raccourci" de la fonction ajax, car équivalent à :
    $.ajax({
      dataType: "json",
      url: url,
      data: data,
      success: success
    });
    */
    $.getJSON(flickrSearch, {
      sort:"relevance", //on pense à trier les résultats obtenus par pertinence
      text: $("#commune").val() //on utilise text plutôt que tags qui donne des résultats bien moins pertinents
      }, 
      function(data) {
        //console.log(data.photos.photo);
        //on "vide" le contenu dans les deux onglets dans le cas ou l'utilisateur fait une nouvelle recherche
        $("#images").html("");
        $("#table_infos tbody").html("");

        //on récupère le nombre de résultats maximal que l'utilisateur souhaite obtenir
        var nbResultats = $("input[name=nbResultats]:checked").val(); 

        $.each(data.photos.photo, function( i, item ) {
          /*
          Les URL des images Flickr sont de la forme : 
          http://farm' item.farm '.staticflickr.com/' item.server '/' item.id '_' item.secret '.jpg
          */
          //on récupère donc les images selon ce format à partir des données JSON récupérées 
          var photo = "https://farm"+ item.farm +".staticflickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +".jpg";


          /////////////////Vue Diaporama (Vue photo)/////////////////
          //on crée ensuite des images HTML
          $("<img>").attr("id", item.id).attr("src", photo).appendTo("#images");
          //on revient à la ligne après chaque image
          $("</br>").appendTo("#images");

          //on ajoute à chaque image créée un listener pour pouvoir cliquer dessus et en récupérer des informations
          $("#"+item.id).on("click", function() {          
            afficherInfos(item.id, flickrGetInfos);
          });
          

          /////////////////Vue Informations (Vue table)/////////////////
          //on ajoute les informations de l'image à la table dans l'onglet "Informations" (la vue table)
          creerVueTable(item.id, photo, flickrGetInfos);
          //un test pour essayer de faire fonctionner la table (datatable) avec ajax... penser alors à commenter l'initialisation vers la ligne 40
          /*$(function() {
            $('#table_infos').DataTable( {
              "ajax": creerVueTable(item.id, photo, flickrGetInfos),
              "bDestroy": true
            });
          });*/




          //on met fin à la récupération des résultats quand on atteint le nombre maximal indiqué par l'utilisateur
          if (i == nbResultats-1) return false;
        });

        //s'il n'y a aucun résultat à la recherche, alors on l'indique par une fenêtre modale
        if($("#images").html().length == 0) $("#aucun_resultat").dialog("open");
      } 
    );
  });

//////////////////////////////////Fermeture de la fonction jQuery principale//////////////////////////////////
});




//////////////////////////////////fonctions JavaScript (non jQuery)//////////////////////////////////

//fonction pour afficher des informations sur une image dans une fenêtre modale
function afficherInfos(id, urlInfos) {
  $.getJSON(urlInfos, {
      photo_id : id
  }, function(data) {
      //on met en forme les informations sur l'image dans la fenêtre modale
      $("#infos_photo").html("Nom de la photographie : " + data.photo.title._content + "</br>" + "Date : " + data.photo.dates.taken + "</br>" + "Auteur : " + data.photo.owner.realname + "</br>" + "Description : " + descTropLongueDiaporama(data.photo.description._content));
      //on ouvre la fenêtre modale
      $("#infos_photo").dialog("open");
  });
}

//fonction pour créer la table dans l'onglet "Informations" (la vue table)
function creerVueTable(id, img, urlInfos) {
  $.getJSON(urlInfos, {
      photo_id : id
  }, function(data) {
      $("#table_infos tbody").append("<tr><td><img src="+img+"></img></td>" + "<td>"+data.photo.title._content+"</td>" + "<td>"+data.photo.dates.taken+"</td>" + "<td>"+data.photo.owner.realname+"</td>" + "<td>"+descTropLongueInformations(data.photo.description._content)+"</td></tr>");
  });
}


//fonction pour retirer les doublons dans un tableau (permettra de supprimer les doublons de l'auto-complétion)
function retirerDoublonsTab(array) {
  var i, j, len = array.length, out = [], obj = {};
  for (i = 0; i < len; i++) {
    obj[array[i]] = 0;
  }
  for (j in obj) {
    out.push(j);
  }
  return out;
}

//deux fonctions pour rétirer les descriptions trop longues respectivement dans l'onglet Diaporama et l'onglet Informations 
function descTropLongueDiaporama(desc) {
  if(desc.length > 400) {
    return "La description est trop longue pour être affichée";
  }
  return desc;
}
function descTropLongueInformations(desc) {
  if(desc.length > 1300) {
    return "La description est trop longue pour être affichée";
  }
  return desc;
}