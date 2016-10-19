/* globals VrWorld, requestAnimationFrame */
var APP3D;
(function(){
    "use strict";
    $(document).ready(init);

    /**
     * @event main#init
     * @description on dom ready
     */
    function init(){
        var currentPage = 1;
        var inProgress = false;
        $("input[type=file]").bind("drop", dropEbook);
        $("input[type=file]").bind("dragover", dragOver);
        $("input[type=file]").change(setEbook);
        $(".theme").change(changeBackground);
        $(".book").change(changeBook);
        $("page").mousedown(preventDefault);
        $(".next").mousedown(next);
        $(".prev").mousedown(prev);
        $("#currentPage").keydown(checkInput);
        $("#currentPage").keyup(changeInput);
        $(".read").mousedown(togglePlay);
        $("page").scroll(checkScroll);
        $("#volumeSpeak").change(changeVolumeSpeak);
        var timer;
        var speech = new SpeechSynthesisUtterance();
        var currentLine = 0;

        function resume(){
            window.speechSynthesis.resume();
        }

        function pause(){
            window.speechSynthesis.pause();
        }

        function changeVolumeSpeak(){
            speech.volume = $(this).val();
        }

        function checkScroll(){
            if($(this).scrollTop() === ($("page").get(0).scrollHeight - $("page").height())){
                next();
            }
        }

        function togglePlay(event){
            event.preventDefault();
            event.stopPropagation();
            if($(this).hasClass("play")){
                if($(this).hasClass("paused")){
                    resume();   
                    $(this).removeClass("paused");
                } else {                    
                    play();                    
                }
                $(this).removeClass("play").addClass("pause");
            } else {
                $(this).removeClass("pause").addClass("play");
                pause();
                $(this).addClass("paused");
            }


            function play(){
                var lines = $("page > *");
                if(lines.length === 0){
                    if(Number($("#currentPage").val()) < Number($("#maxPage").text())){
                        next();
                        timer = setInterval(check, 250);
                    }
                    return false;
                }                              
                speak();
                
                function speak(){
                    speech.onend = nextLine; 
                    speech.onresume = resume;
                    speech.onpause = pause;
                    var element = $(lines).filter(":eq("+(currentLine)+")");
                    $("page").scrollTop(element.offset().top);
                    $("page > *").css("background-color", "transparent");
                    element.css("background-color", "gray");
                    speech.text = element.text().trim()+" ";
                    window.speechSynthesis.speak(speech);
                }

                function nextLine(){
                    currentLine++;
                    if(currentLine === lines.length){
                        $("page").scrollTop($("page").get(0).scrollHeight - $("page").height());
                        timer = setInterval(check, 250);     
                        return false;                  
                    }
                    speak();

                    function check(){
                        if(inProgress){
                            return false;
                        }
                        clearInterval(timer);
                        lines = $("page > *");
                        if(currentLine === lines.length){
                            if(Number($("#currentPage").val()) < Number($("#maxPage").text())){
                                next();
                                timer = setInterval(check, 250);
                            } 
                            return false;
                        }
                        speak();
                    }
                }
            }
        }


   /*     window.startSpeak = function(){
            window.speechSynthesis.speak(speech);
            isSpeaking = true;
        }

        window.stopSpeak = function(){
            window.speechSynthesis.pause();
            isSpeaking = false;
        }*/

        function changeInput(){           
            var nb = Number($(this).val());
            var max = Number($("#maxPage").text());
            if(nb > max){
                nb = max;  
                $(this).val(nb);              
            } else if(nb <= 0) {
                nb = 1;
                $(this).val(nb);
            }                   
            if(nb !== currentPage){   
                inProgress = true; 
                currentPage = nb;
                $("page").empty();
                currentLine = 0;
                window.speechSynthesis.cancel(); 
                $(".read").removeClass("paused");
                getPage($(".book :selected").val());
            }
        }

        function checkInput(event){
            if(event.keyCode < 96 || event.keyCode > 105 || inProgress){
                if(event.keyCode !== 37 && event.keyCode !== 39 && event.keyCode !== 8 && event.keyCode !== 46){
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                
            }       
        }

        function next(){
            if(currentPage === Number($("#maxPage").text()) || inProgress){
                return false;
            }
            inProgress = true;
            currentPage++;
            getPage($(".book :selected").val());
        }

        function prev(){
            if(currentPage === 1 || inProgress){
                return false;
            }
            inProgress = true;
            $("page").empty();
            window.speechSynthesis.cancel(); 
            $(".read").removeClass("paused");
            currentLine = 0;
            currentPage--;
            getPage($(".book :selected").val());
        }

        function changeBook(){
            var name = $(this).find(":selected").val();            
            if(name !== ""){
                inProgress = true;                 
                currentLine = 0;   
                $("page").empty(); 
                window.speechSynthesis.cancel(); 
                $(".read").removeClass("paused");        
                getCurrentPage();
                $(".bookControl").removeClass("hide");
                $(".readContainer").removeClass("hide");
                
            } else {
                $(".bookControl").addClass("hide");
                $(".readContainer").addClass("hide");
                $("page").html("");
            }           

            function getCurrentPage(){
                $.post("php/getCurrentPage.php", {name:name}, ready, "json");

                function ready(data){
                    currentPage = data.page;
                    getPage(name, finish);

                    function finish(){
                        $.post("php/getLang.php", {q:$("page").text()}, complete, "json");

                        function complete(data){
                            speech.lang = data.data.detections[0].language+"-"+data.data.detections[0].language.toUpperCase();
                        }
                    }
                }
            }    
        }

        function getPage(name, cb){            
            $.post("php/getPage.php", {
                page:currentPage,
                name:name
            }, ready, "json");

            function ready(result){
                $("page").html($("page").html()+"<br />"+result.data);                
                $("#currentPage").val(currentPage);
                if(result.nbPage){
                    $("#maxPage").text(result.nbPage);
                }                
                inProgress = false; 
                if(cb){
                    cb();
                }
            }
        }

        function preventDefault(event){
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        function changeBackground(){
            $(".background").attr("src", "img/"+$(this).val()+".jpg");
            $("page").attr("style", $(".theme :selected").attr("pos"));
        }

        function setEbook(event){
            addEbook(event.target.files);
        }

        function dropEbook(event){
            event.preventDefault();
            event.stopPropagation();
            addEbook(event.originalEvent.dataTransfer.files);
        }

        function dragOver(event){
            event.preventDefault();
            event.stopPropagation();
            event.originalEvent.dataTransfer.dropEffect = "copy";
        }

        function addEbook(files){
            var reader = new FileReader();
            reader.onload = sendEbook;
            reader.readAsDataURL(files[0]);

            function sendEbook(file){
                $.post("php/upload.php", {
                    data:file.target.result, 
                    name:files[0].name
                }, check, "json");

                function check(data){
                    if(data.success){
                        var option = $("<option></option>");
                        option.text(data.name);
                        option.val(data.name)
                        $(".book").append(option);
                    } else {
                        console.error(data.error);
                    }
                }
            }
        }
    }
})();
