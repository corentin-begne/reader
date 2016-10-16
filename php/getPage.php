<?
    if(is_null($_REQUEST['page']) || is_null($_REQUEST['name'])){
        die;
    }    
    libxml_use_internal_errors(true);
    $path = dirname(__FILE__).'/../data/'.$_REQUEST['name'].'/';
    // read container to get manifest name
    $container = simplexml_load_file($path.'META-INF/container.xml');
    $name = (string)$container->rootfiles[0]->rootfile->attributes()['full-path'];
    // read manifest
    $manifest = simplexml_load_file($path.$name);
    $i = 1;
    $result = [];
    header('Content-Type: application/json');
    foreach($manifest->manifest[0]->item as $item){
        $href = (string)$item->attributes()['href'];
        if((stripos($href, '.html') !== false || stripos($href, '.xhtml') !== false) && stripos($href, 'cover') === false && stripos($href, 'title') === false){
            if($i === (int)$_REQUEST['page']){    
                $result['data'] = strip_tags(file_get_contents(str_replace('/OEBPS/OEBPS/', '/OEBPS/', '../data/'.$_REQUEST['name'].'/OEBPS/'.$href)), '<br><p>');            
                if((int)$_REQUEST['page'] !== 1){
                    die(json_encode($result));
                }
            }
            $i++;
        }
    }
    $result['nbPage'] = $i-1;
    die(json_encode($result));
?>