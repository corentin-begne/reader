<?
    $k = "1ae69bf5db8e7c997e77ea04b5446153";
    $postdata = http_build_query(
        [
            'key' => $k,
            'q' => $_POST['q']
        ]
    );
    $opts = array('http' =>
        [
            'method'  => 'POST',
            'header'  => 'Content-type: application/x-www-form-urlencoded',
            'content' => $postdata
        ]
    );
    $context  = stream_context_create($opts);
    header('Content-Type: application/json');
    die(file_get_contents("http://ws.detectlanguage.com/0.2/detect", false, $context));
?>