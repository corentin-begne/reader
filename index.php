<!DOCTYPE html>
<html lang="fr">
    <head>
        <title>Ebook Reader</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="css/main.css?v=<?=time()?>">        
        <link rel="icon" type="image/png" href="img/favicon.png">
        <? if($_SERVER["HTTP_HOST"] === "localhost" || strpos($_SERVER["HTTP_HOST"], '192.168.1.') !== false): ?>
            <script>var requirejs = {config: function (c) {requirejs = c}}</script>
            <script src="confrequire.js"></script>
            <script data-main="main.confrequire.js" src="bower_components/require/index.js"></script>
        <? else: ?>
            <script data-main="main.js?v=<?=time()?>" src="bower_components/require/index.js"></script>
        <? endif; ?>
    </head>
    <body>
       <!-- <img src="img/stars.png" class='stars hide' />
        <div id="fairy"></div>-->
        <input id="fileupload" type="file" name="files[]" data-url="php/upload.php" multiple />
        <div class='bookContainer styled-select'>
            <select class="book">
                <option selected value="">Choisir un livre</option>
                <? foreach(glob('data/*', GLOB_ONLYDIR) as $dir): ?>                    
                    <option value="<?=basename($dir)?>">
                        <?
                            $nb = (int)file_get_contents($dir.'/page.txt');
                            $total = count(glob($dir.'/pages/*'));
                        ?>
                        <?=basename($dir).' ['.$nb.'/'.$total.'] '.round((100*$nb/$total),2).'%'?>
                    </option>
                <? endforeach; ?>
            </select>
        </div>
        <div class='bookControl hide'>
            <img src="img/left.svg" class='prev' />
            <div class='pageControl'>
                <input id='currentPage' type='text' value='1'/>&nbsp;/<label id="maxPage" for='currentPage'>1</label>
            </div>
            <img src="img/right.svg" class='next' />
        </div>
        <div class='themeContainer styled-select'>
            <select class="theme">
                <? foreach([
                    'harry_potter' => [
                        'name'=> 'Soir de pleine lune',
                        'style'=> 'padding-left: 50px;padding-right: 450px;width: calc(100% - 500px);color: antiquewhite;'
                    ],
                    'white' => [
                        'name'=> 'White',
                        'style'=> 'padding-left: 50px;padding-right: 50px;width: calc(100% - 100px);color: black;background-color:white;'
                    ],
                    'black' => [
                        'name'=> 'Black',
                        'style'=> 'padding-left: 50px;padding-right: 50px;width: calc(100% - 100px);color: white;background-color:black;'
                    ],
                    'grass_book' => [
                        'name'=> 'Herbe Nuit',
                        'style'=> 'padding-left: 50px;padding-right: 450px;width: calc(100% - 500px);color: antiquewhite;'
                    ],
                    'grass_book2' => [
                        'name'=> 'Herbe Jour',
                        'style'=> 'padding-left: 50px;padding-right: 450px;width: calc(100% - 500px);color: black;'
                    ],
                    'magic_book' => [
                        'name'=> 'Livre magique droite',
                        'style'=> 'padding-left: 50px;padding-right: 450px;width: calc(100% - 500px);color: antiquewhite;'
                    ],
                    'magic_book2' => [
                        'name'=> 'Livre Magique Gauche',
                        'style'=> 'padding-left: 700px;padding-right: 5px;width: calc(100% - 705px);color: antiquewhite;'
                    ],
                    'panda' => [
                        'name'=> 'Pandi Panda',
                        'style'=> 'padding-left: 50px;padding-right: 450px;width: calc(100% - 500px);color: antiquewhite;'
                    ]
                ] as $img => $theme): ?>
                    <option pos='<?=$theme['style']?>' <?=($img === 'harry_potter') ? 'selected' : ''?> value="<?=$img?>">
                        <?=$theme['name']?>
                    </option>
                <? endforeach; ?>
            </select>
        </div>
        <img src="img/harry_potter.jpg" class='background' />
        <page></page>
        <div class='readContainer hide'>
            <div class='read play' title="Lire"></div>        
            <input id='volumeSpeak' type="range" min='0' max='1' value='1' step='0.01' />
        </div>
    </body>
</html>
