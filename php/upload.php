<?
   /* error_reporting(E_ALL);
    ini_set("display_errors", "On");*/
    function writePage($target, $data){
        file_put_contents($target, $data);
    }

    function cleanText($text){
        return strip_tags($text, '<br><p><span>'); 
    }

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
                system('unzip '.$target.' -d '.$path.'/'.$folder.' > /dev/null 2>&1');
                system('chmod -R 777 '.$path.'/'.$folder);
                system('rm -f '.$target);
                $result['name'] = $folder;
                // create pages (1848 chars)
                $path .= '/'.$folder.'/';
                system('mkdir '.$path.'pages');            
                $container = simplexml_load_file($path.'META-INF/container.xml');
                $name = (string)$container->rootfiles[0]->rootfile->attributes()['full-path'];
                // read manifest
                $manifest = simplexml_load_file($path.$name);
                $data = [];
                foreach($manifest->manifest[0]->item as $item){
                    $href = (string)$item->attributes()['href'];
                    if((stripos($href, '.html') !== false || stripos($href, '.xhtml') !== false) && stripos($href, 'cover') === false && stripos($href, 'title') === false){   
                            $tmp = explode('</p>', cleanText(file_get_contents(dirname($path.$name).'/'.$href)));                   
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
                system("chmod - R 777 ".$path);
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