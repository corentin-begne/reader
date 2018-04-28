<?
    error_reporting(E_ALL);
    ini_set("display_errors", "On");
    function writePage($target, $data){
        file_put_contents($target, $data);
    }

    function cleanText($text){
        $val =  str_replace(['M ', 'M. ', 'Mrs', ' jean ', ' jean,', ' jean.'], ['Mr ', 'Mr ', 'Mme', ' djine ', ' djine,', ' djine.'],htmlspecialchars_decode(strip_tags($text, '<br><p><span>'))); 
        return str_ireplace(['o.k', 'o.k.', 'ok ', 'hmmm', ' h ', '-t-il', '-t-elle', 't-il', 't-elle', ' etc.', ' etc '], ['okay', 'okay', 'okay ', 'heumm', 'h', ' t\'il', ' t\'elle', 't\'il', 't\'elle', 'et cétéra', 'et cétéra'], $val);
    }
 /*   $container = simplexml_load_file('/var/www/reader/data/Postmortem_Patricia_Cornwell_1990/META-INF/container.xml');
    $name = (string)$container->rootfiles[0]->rootfile->attributes()['full-path'];
    $manifest = simplexml_load_file('/var/www/reader/data/Postmortem_Patricia_Cornwell_1990/'.$name);
    $arr = (array)$manifest->manifest[0];
    $arr = (array)$arr["item"];
 //   var_dump(count($arr), $arr);
    for($i=1; $i<count($arr) ; $i++){
        var_dump(file_get_contents(dirname('/var/www/reader/data/Postmortem_Patricia_Cornwell_1990/'.$name).'/'.((string)$arr[$i]['href']))); 
        die;
    }*/
    $result = ['success'=>false];
    header('Content-Type: application/json');
    try{
        if(isset($_POST['data'])){
            $_POST['name'] = str_replace([' ', '.epub', '\''], ['_', '', '_'], $_POST['name']);
            $_POST['name'] = preg_replace('/[^A-Za-z0-9 \_]/', '', $_POST['name']).'.epub';
            $path = dirname(__FILE__).'/../data';
            $target = $path.'/'.$_POST['name'];
            if(file_exists($target)){
                $result['error'] = 'file already exists '.$_POST['name'];
            } else {
                file_put_contents($target, base64_decode(substr($_POST['data'], strpos($_POST['data'], ',')+1)));
                $folder = basename($_POST['name'], '.epub');
            //    var_dump($result, die;
                exec('unzip '.$target.' -d '.$path.'/'.$folder.' > /dev/null 2>&1');
                exec('chmod -R 777 '.$path.'/'.$folder);
                exec('rm -f '.$target);
                $result['name'] = $folder;
                // create pages (1848 chars)
                $path .= '/'.$folder.'/';
                exec('mkdir '.$path.'pages');            
                $container = simplexml_load_file($path.'META-INF/container.xml');
                $name = (string)$container->rootfiles[0]->rootfile->attributes()['full-path'];
                // read manifest
                $manifest = simplexml_load_file($path.$name);
                $data = [];
                $arr = (array)$manifest->manifest[0];
                $arr = (array)$arr["item"];
                for($j=0; $j<count($arr) ; $j++){
                    $href = (string)$arr[$j]['href'];
                    if(stripos($href, 'htm') !== false){   
                        //var_dump(dirname($path.$name).'/'.$href); die;
                            $tmp = explode('</p>', cleanText(file_get_contents(dirname($path.$name).'/'.$href)));//str_replace(' ', "\\ ", escapeshellcmd($href)))));                   
                            for($i=0; $i<count($tmp); $i++){
                                $data[] = $tmp[$i].((count($tmp) === 1) ? '' : '</p>');
                            }
                    }
                }
                $page = '';            
                $path .= 'pages/';
                $currentPage = 1;
                $max = 1848;
                for($i=0; $i<count($data); $i++){
                    if(strlen(strip_tags($page)) >= $max){
                        writePage($path.$currentPage, $page);
                        $page = '';
                        $currentPage++;
                    }
                    $page .= $data[$i];
                }
                if($page !== ''){
                    writePage($path.$currentPage, $page);
                }
                exec("chmod - R 777 ".$path);
                $result['success']=true;
            }
        } else {
            $result['error'] = 'no data';
        }       
        die(json_encode($result));
    } catch(Exception $e){
        $result['error'] = $e->getMessage();
        die(json_encode($result));
    }
?>