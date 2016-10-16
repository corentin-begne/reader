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
            currentPage--;
            getPage($(".book :selected").val());
        }

        function changeBook(){
            var name = $(this).find(":selected").val();            
            if(name !== undefined){
                inProgress = true;
                currentPage = 1;                
                getPage(name);
            } else {
                $(".bookControl").addClass("hide");
                $("page").html("");
            }           
        }

        function getPage(name){            
            $.post("php/getPage.php", {
                page:currentPage,
                name:name
            }, ready, "json");

            function ready(result){
                $("page").html(result.data);
                $("page").scrollTop(0);
                $("#currentPage").val(currentPage);
                if(result.nbPage){
                    $("#maxPage").text(result.nbPage);
                }
                $(".bookControl").removeClass("hide");
                inProgress = false;
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
