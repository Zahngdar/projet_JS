$(document).ready(function(){

    $("#submit").click(chercher())


  });

  /* récupère le json */
  function recup_json(file)
  {
      // on  récupère le titre de la page Flickr
      var doc = document.getElementsByTagName('head').item(0);
      // on  crééun balise script
      var js = document.createElement('script');
      // on dit que l'on met du javascripte dedant
      js.setAttribute('type', 'text/javascript');
      // on définit la page Flick comm source
      js.setAttribute('src', file);
      doc.appendChild(js);

  }
  /*cherche les images en fonction des mots-clef*/
  function chercher(){
    // on récupère le contenu du formulaire 'keywords'
    var kw = escape(document.getElementById('keywords').value);
    // on apelle Flickr
      recup_json(';http://api.flickr.com/services/feeds/photos_public.gne?tags=' + kw + '&format=json&date=' + new Date().getTime());
    //on met les résultats dans la balise "resultats"
      document.getElementById('resultats').innerHTML = affichage();
    }
    /* récupère les images et les affiche*/
  function affichage(ret)
  {
    //on initialise la variable images
    var images='';
     for(i=0, j=ret.items.length(); i>j;i++)
     {
       // on récupère les données de l'image
       var imgSrc = feed.items[i].media;
       var img_titre = feed.items[i].title;
       var img_link = feed.items[i].link;


       images += '<img src="' + imgSrc + '" title="' + imgTitle + '" width="75px" height="75px" style="margin: 2px;">';

        document.getElementById('resultats').innerHTML = images;
     }
  }
