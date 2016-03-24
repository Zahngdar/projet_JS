$(document).ready(function(){



  $('#text').focus(function()
  {
    $.ajax({
      url='https://www.flickr.com/',
      type:'GET',
      dataType:'json',
      data:'commune='+$('#text').val(),

      success: function()
      })
    $("#text").autocomplete(
      {
        source :
      }
    )

      )
    $()

  })

})
