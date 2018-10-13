var state = 0;

$(document).ready(function(){
    //moveCorner();
    $.get("/getinfo/" + url, {

    }, function(data, status){
       data = JSON.parse(data);

       var transcript = data["timestamped"];
       for(var i = 0; i < transcript.length; i++){
           var navtime = parseInt(transcript[i][0].split(",")[0].split(":")[1])*60 +
               parseInt(transcript[i][0].split(",")[0].split(":")[2]) +
               parseInt(transcript[i][0].split(",")[1])/1000;
           $(".interactive-transcript").append(
               "<span class='interactive-text' navtime='"+ navtime + "'id='abc-" + i + "'>" +
               transcript[i][2] +
               " </span>"
           );
           $("#abc-" + i).click(function(){
               callPlayer("yt-video", "seekTo", [$(this).attr("navtime")]);
               console.log($(this).attr("navtime"));
           })
       }
        console.log(data);
       var summary = data["summary_variable"];
       for(i = 0; i < Math.floor(summary.length/10) + 1; i++){
           $(".summary").append(
               summary[i] + " "
           )
       }
       if(summary.length == 0){
           $(".summary").html("<div class='text-center'> (Summary unavaliable due to uncompatability of captions) </div>")
       }
       $(".summary").append("<hr><div class='text-center'>Overall Sentiment: <code>" + Math.floor(100*data["sentiment"])/100 + "</code></div>");

       //make the chart
       var ctx = document.getElementById('analysis-chart').getContext('2d');
       new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: ["Conservative", "Green", "Liberal", "Libertarian",
            "Agreeableness", "Conscientiousness", "Extraversion", "Openness", "Anger", "Fear", "Joy", "Sadness", "Surprise"
          ],
          datasets: [{
            data: [
                data["political"]["Conservative"],
                data["political"]["Green"],
                data["political"]["Liberal"],
                data["political"]["Libertarian"],
                data["personality"]["agreeableness"],
                data["personality"]["conscientiousness"],
                data["personality"]["extraversion"],
                data["personality"]["openness"],
                data["emotion"]["anger"],
                data["emotion"]["fear"],
                data["emotion"]["joy"],
                data["emotion"]["sadness"],
                data["emotion"]["surprise"]
            ],
            backgroundColor: "rgba(128, 128, 10, 1)"
          }]
        },
        options: {
          responsive: false,
          legend: {
            display: false
          },
            scales: {
          xAxes: [{
            ticks: {
            min: 0,
            max: 1,
            stepSize: 0.2
          }
         }]},
          tooltips: {
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.yLabel;
              }
            }
          }
        }
      });

       window.setTimeout(function(){
           $("#loading").fadeOut();
           $("#cover").fadeOut();
           $("html").css({
               "overflow": "scroll"
           })
       }, 1000)

    })
});


$(window).scroll(function(){
   if($(window).scrollTop() !== 0 && state === 0){
       moveCorner()
   }
});

moveCorner = function(){
    state = 1;
    $("#yt-video").clearQueue().stop().animate({
        top: "30%",
        left: "63%",
        width: "32%",
        height: "40%"
    });
    $(".card-container").clearQueue().stop().animate({
        width: "60%",
        left: "0%",
        top: "20%"
    });
};
moveBack = function(){
    state = 0;
    $("#yt-video").clearQueue().stop().animate({
        top: "15%",
        left: "30%",
        width: "40%",
        height: "50%"
    });
    $(".card-container").clearQueue().stop().animate({
        width: "60%",
        left: "20%",
        top: "70%"
    });
};

function callPlayer(frame_id, func, args) {
    if (window.jQuery && frame_id instanceof jQuery) frame_id = frame_id.get(0).id;
    var iframe = document.getElementById(frame_id);
    if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
        iframe = iframe.getElementsByTagName('iframe')[0];
    }

    // When the player is not ready yet, add the event to a queue
    // Each frame_id is associated with an own queue.
    // Each queue has three possible states:
    //  undefined = uninitialised / array = queue / 0 = ready
    if (!callPlayer.queue) callPlayer.queue = {};
    var queue = callPlayer.queue[frame_id],
        domReady = document.readyState == 'complete';

    if (domReady && !iframe) {
        // DOM is ready and iframe does not exist. Log a message
        window.console && console.log('callPlayer: Frame not found; id=' + frame_id);
        if (queue) clearInterval(queue.poller);
    } else if (func === 'listening') {
        // Sending the "listener" message to the frame, to request status updates
        if (iframe && iframe.contentWindow) {
            func = '{"event":"listening","id":' + JSON.stringify(''+frame_id) + '}';
            iframe.contentWindow.postMessage(func, '*');
        }
    } else if (!domReady ||
               iframe && (!iframe.contentWindow || queue && !queue.ready) ||
               (!queue || !queue.ready) && typeof func === 'function') {
        if (!queue) queue = callPlayer.queue[frame_id] = [];
        queue.push([func, args]);
        if (!('poller' in queue)) {
            // keep polling until the document and frame is ready
            queue.poller = setInterval(function() {
                callPlayer(frame_id, 'listening');
            }, 250);
            // Add a global "message" event listener, to catch status updates:
            messageEvent(1, function runOnceReady(e) {
                if (!iframe) {
                    iframe = document.getElementById(frame_id);
                    if (!iframe) return;
                    if (iframe.tagName.toUpperCase() != 'IFRAME') {
                        iframe = iframe.getElementsByTagName('iframe')[0];
                        if (!iframe) return;
                    }
                }
                if (e.source === iframe.contentWindow) {
                    // Assume that the player is ready if we receive a
                    // message from the iframe
                    clearInterval(queue.poller);
                    queue.ready = true;
                    messageEvent(0, runOnceReady);
                    // .. and release the queue:
                    while (tmp = queue.shift()) {
                        callPlayer(frame_id, tmp[0], tmp[1]);
                    }
                }
            }, false);
        }
    } else if (iframe && iframe.contentWindow) {
        // When a function is supplied, just call it (like "onYouTubePlayerReady")
        if (func.call) return func();
        // Frame exists, send message
        iframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": func,
            "args": args || [],
            "id": frame_id
        }), "*");
    }
    /* IE8 does not support addEventListener... */
    function messageEvent(add, listener) {
        var w3 = add ? window.addEventListener : window.removeEventListener;
        w3 ?
            w3('message', listener, !1)
        :
            (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
    }
}