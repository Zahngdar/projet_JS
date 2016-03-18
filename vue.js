$(document).ready(function(){
/*
  var tab;
  $.ajax({
    url='https://www.flickr.com/',
    type:'GET',
    dataType:'json',
    data:'commune='+$('#text').val(),

    success: function(data){
        $(data).each(function(i,val){
          $(tab).append(val);
        })
      }
    })
  if($(url).param() != null && $(tab).contains($(url.param())))
  {
    alert("Aucune photo pour "+$(url).param()+" trouvée")
  }
  else {
  {
     $(.each($(tab),function(i){
       $('body').html('
       <img>')
     })
  }
}*/

 $getJSON('https://www.flickr.com/',
   tag: commune,
   format: 'json',
   funtion(){
     each.

   }

})
