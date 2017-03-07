<?
    if(isset($_POST['name'])){
        exec('rm -rf '.dirname(__FILE__).'/../data/'.$_POST['name'].'*');
        echo 'rm -rf '.dirname(__FILE__).'/../data/'.$_POST['name'].'*';
    }
?>