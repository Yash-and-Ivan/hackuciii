var redirect = "";

$("document").ready(function(){
    console.log("Index.html loaded!");
    $("#enter-button").click(function(){
        $("#titleCard").animate({
            top: "200%",
            left: "50%",
            width: 0,
            height: 0
        }, 1000, function(){
            $("canvas").fadeOut()
        });
        window.setTimeout(function(){
            window.location = "/results/" + redirect
        }, 2500)
        //$("canvas").fadeOut()
    });


    $(".url-input").change(function(){
        $("#video-data").html("Fetching Video Data...");

        var url = $(this).val();
        url = url.split("?v=");
        url = url[url.length - 1].substring(0, 11);

        //get the data
        $.get("/getdata/" + url,{

        }, function(data, status){
            data = JSON.parse(data);
            if(data["error"]){
                $("#video-data").html("<div class='red'>" + data["error"] + "</div>");
                $("#enter-button").hide()
            } else {
                $("#video-data").html("<b> Video found: </b>" + data["title"]);
                $("#enter-button").fadeIn();
                redirect = url;
            }
        })
    });
});
