/* globals VrWorld, requestAnimationFrame */
var APP3D;
(function(){
    "use strict";
    $(document).ready(init);

    /**
     * @event main#init
     * @description on dom ready
     */
    function init(event){
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
        $(".theme").change();
    //    $(".soundContainer select").change(selectSound);
        $("#volumeSound").change(changeVolumeSound);
        $(".sound").mousedown(togglePlaySound);
        $(document).mousemove(moveFairy);
        var soundPlayer = new Audio();
        var voices = window.speechSynthesis.getVoices();        
        var timer;
        var speech = new SpeechSynthesisUtterance();
      //  speech.voice = "none";
        var currentLine = 0;
        var cuted = [];
        var voices;
        var lastX = 0;
        var turning = false;
        var direction = "idle";
        var anims = {
            idle : [
                {
                    height:31,
                    width:22,
                    top:0,
                    left:0
                },
                {
                    height:31,
                    width:22,
                    top:0,
                    left:-25
                },
                {
                    height:31,
                    width:23,
                    top:0,
                    left:-50
                }
            ],
            move: [
                {
                    height:31,
                    width:22,
                    top:-34,
                    left:0
                },
                {
                    height:31,
                    width:22,
                    top:-34,
                    left:-22
                }
            ]
        }
        var currentAnim = 0;
        var timerAnim;
        var eventMove = event;
        var maxP = 100;

        timerAnim = setInterval(animate, 125);

        function spawnParticles(event){
            if($(".stars").length >=maxP){
                return false;
            }
            if(event === undefined){
                event = eventMove;
            }        
            var diff = Math.random() * 3.5;    
            if(Math.round(Math.random() * 1)===1){
                diff = -diff;
            }
            var x = event.clientX+$("#fairy").width()/2-7+diff;
            var y = event.clientY+$("#fairy").height();
            var particle = $(".stars").clone().removeClass("hide");
            particle.css({
                top:y+"px",
                left:x+"px",
                transform:"rotateY("+((Math.round(Math.random() * 1)===1) ? "180" : "0")+"deg)"
            });
            $("body").append(particle);
            particle.animate({
                top:"+="+Math.random() * 25,
                opacity:"0"
            }, Math.random() * 500 + 250, removeParticle);

            function removeParticle(){
                $(this).remove();
            }
        }

        function animate(){
            $("#fairy").css({
                width:anims[direction][currentAnim].width+"px",
                height:anims[direction][currentAnim].height+"px",
                backgroundPosition: anims[direction][currentAnim].left+"px "+anims[direction][currentAnim].top+"px"
            });
            currentAnim++;
            spawnParticles();
            if(currentAnim === anims[direction].length){
                currentAnim = 0;
                if(direction === "move"){
                    direction = "idle";
                }
            }
        }

        function moveFairy(event){
            eventMove = event;
            var css = {
                top:event.clientY+"px",
                left:event.clientX+"px"
            };
            if((event.clientX-lastX)<0){
                css.transform = "none";
            } else if((event.clientX-lastX)>0){
                css.transform = "rotateY(180deg)";
            }    
            if(event.clientX === lastX){
                direction = "idle";
            } else {
                if(direction === "idle"){
                    currentAnim = 0;
                }
                direction = "move";
            }
            $("#fairy").css(css);            
            lastX = event.clientX;            
        }

        function selectSound(){
            var sound = $(this).find(":selected").val();
            $(".sound").removeClass("pause").addClass("play");
            soundPlayer.pause();
            if(sound === ""){                
                return false;
            }
            soundPlayer.src = sound;
        }

        function togglePlaySound(){
            if($(".soundContainer select :selected").val() === ""){
                return false;
            }
            if($(this).hasClass("play")){
                $(this).removeClass("play").addClass("pause");
                soundPlayer.play();
            } else {
                $(this).removeClass("pause").addClass("play");
                soundPlayer.pause();
            }
        }

        function changeVolumeSound(){
            soundPlayer.volume = $(this).val();
        }

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
                var lines = $("page > p");
                var element;
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
                    if(cuted.length === 0){ 
                        element = $(lines).filter(":eq("+(currentLine)+")");
                        $("page").scrollTop(element.offset().top+$("page").scrollTop()-element.outerHeight());
                        $("page > *").css("background-color", "transparent");
                        element.css("background-color", "gray");
                        cuted = element.text().trim().split(".");
                        for(var i=0; i<cuted.length; i++){
                            cuted[i] = cuted[i];
                        }
                        currentLine++;
                    }
                    var tmp = cuted.shift();
                    if(tmp.length > 250){
                        tmp = tmp.split(",");
                        for(var i=(tmp.length-1); i>=0; i--){
                            tmp[i] = tmp[i]+",";
                            cuted.unshift(tmp[i]);
                        }
                    } else {
                        cuted.unshift(tmp);
                    }
                    speech.text = cuted.shift();
                    window.speechSynthesis.speak(speech);
                }

                function nextLine(){                    
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
                        lines = $("page > p");                        
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
                            voices = window.speechSynthesis.getVoices();
                            for(var i=0; i<voices.length; i++){
                                if(voices[i].lang === speech.lang){
                                    speech.voice = voices[i];
                                    break;
                                }
                            }
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
                $("page").html($("page").html()+((($("page").html() !== "") ? "<hr>" : "")+result.data));                
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
            var total = files.length;
            var i = 0;
            getEbook();

            function getEbook(){            
                var reader = new FileReader();
                reader.onload = sendEbook;
                reader.readAsDataURL(files[i]);
            }

            function sendEbook(file){
                $.post("php/upload.php", {
                    data:file.target.result, 
                    name:files[0].name
                }, check, "json");

                function check(data){
                    if(data.success){
                        var option = $("<option></option>");
                        option.text(data.name);
                        option.val(data.name);
                        $(".book").append(option);
                    } else {
                        console.error(data.error);
                    }
                    i++;
                    if(i<total){
                        getEbook();
                    }
                }
            }
        }

        function strSplit (string, splitLength) {
          var chunks = []
          var pos = 0
          var len = string.length

          while (pos < len) {
            chunks.push(string.slice(pos, pos += splitLength))
          }
          return chunks
        }
    }
})();
