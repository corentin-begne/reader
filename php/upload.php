<?
    $result = ['success'=>false];
    if(isset($_POST['data'])){
        $_POST['name'] = str_replace([' ', '.epub', '\''], ['_', '', '_'], $_POST['name']);
        $_POST['name'] = preg_replace('/[^A-Za-z0-9 \_]/', '', $_POST['name']).'.epub';
        $path = dirname(__FILE__).'/../data';
        $target = $path.'/'.$_POST['name'];
        if(file_exists($target)){
            $result['error'] = 'file already exists '.$_POST['name'];
        } else {
            file_put_contents($target, base64_decode(str_replace('data:application/epub+zip;base64,', '',$_POST['data'])));
            $folder = basename($_POST['name'], '.epub');
            system('unzip '.$target.' -d '.$path.'/'.$folder.' > /dev/null 2>&1');
            system('chmod -R 777 '.$path.'/'.$folder);
            system('rm -f '.$target);
            $result['name'] = $folder;
            $result['success']=true;
        }
    } else {
        $result['error'] = 'no data';
    }
    header('Content-Type: application/json');
    die(json_encode($result));
?>