resize_canvas = document.createElement('canvas');
function readURL(input) {
        if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                        $("#header").text('Results');
                        $("#results tr").remove();
                        $("#results").append('<tr><td>Classifying ...</td></tr>');
                        var image = new Image();
                        image.onload = function (imageEvent) {

                                // Resize the image
                                var canvas = document.createElement('canvas'),
                                max_size = 1280,
                                width = image.width,
                                height = image.height;
                                if (width > height) {
                                        if (width > max_size) {
                                                height *= max_size / width;
                                                width = max_size;
                                        }
                                } else {
                                        if (height > max_size) {
                                                width *= max_size / height;
                                                height = max_size;
                                        }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                                var dataUrl = canvas.toDataURL('image/jpeg', 1.0);

                                $.ajax({
                                        url: "FUNCTIONENDPOINT",
                                        type: "POST",
                                        data: { "bytes" : dataUrl },
                                        dataType: "json",
                                        crossDomain: true,
                                 	tryCount: 0,
					retryLimit: 1,
					retryInterval: 30000, 
                                        success: function (response) {
                                                $("#results tr").remove();

                                                for (var i = 0; i < Math.min(5, response.length); i++) {
                                                  	score = Math.round(100*response[i].score);
                                                        if ( score > 0) {
                                                  		aircraft = response[i].aircraft.replace(/_/g, ' ')
                                                  		$("#results").append('<tr><td>' + aircraft + '</td><td>'  + score + '%</td></tr>');
							}
                                                }
                                                if (response.length == 0) {
                        				$("#results").append('<tr><td>No recognizable aircraft found</td></tr>');
                                                }
                                                retries = 0;
                                        },
                                        error: function (xhr, textStatus, errorThrown) {
						this.tryCount++;
						if (this.tryCount <= this.retryLimit) {
					                //try again
                                                	$("#results tr").remove();
                        				$("#results").append('<tr><td>Classifying ... wait for it ...</td></tr>');
     							setTimeout(() => { $.ajax(this) }, this.retryInterval || 30000)
                                                } else {
                                                  	$("#results tr").remove();
                        				$("#results").append('<tr><td>Classifying ... failed. Please try again later</td></tr>');
                                                }
					        return;
                                        }
                                });
                        }
                        image.src = e.target.result;
                        $('#image-display').attr('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);


        }
}

$("#fileButton").change(function(){
    readURL(this);
});
