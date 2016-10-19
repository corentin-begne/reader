<?
    $target = dirname(__FILE__).'/../data/'.$_REQUEST['name'].'/'.'page.txt';
    if(file_exists($target)){
        $page = (int)file_get_contents($target);
    } else {
        $page = 1;
    }
    header('Content-Type: application/json');
    die(json_encode(['page'=>$page]));
?>