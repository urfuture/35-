//=============================================================================

// MrLiu_MiniMap.js

//=============================================================================

/*:

* @plugindesc ��RMMV��Ϸ�ĵ�ͼ��������ʾС��ͼ

* @author MrLiu-��������

 * @param NotShowMiniMap

 * @desc �����˿�������ʾС��ͼ�������ھ�������ⳡ����

 * @default 49

 *

* @help ��������д�������rpg maker web �ϵ�Hajime Hoshi��MiniMap���㷨

* ʹ�÷������ڵ�ͼ�ı�ע�м���<mini_map> �ͻ��Զ���ʾС��ͼ��������ͨ���򿪿���

* ����NPC�Ի������¼�ҳ���е�ʱ����Զ����ء����������޸ı����78��--110�ж�Ӧ������

* ��ɫ��ʵ������С��ͼ�ϵ��޸ġ��ܹ������ܵĻ����������С��ͼ���뽫minimap.png�ļ�

* ����pictureĿ¼�£�UIͼƬ���������ҵĺ��Ѹ���С�����ڴ˶������Գ�ֿ�ĸ�л��

* Ŀǰ���Ѿ�������ͼ����ɫ��Ӧ���£�1.�߽�[255,255,255,255] 2.ͨ�в���[95, 147, 207, 212] 3����ͨ�в���[128, 128, 128, 192]4.���������[255,256,75,50]

* 5.һ�㽨��[11,43,68,206] 6.�̵�[74,135,65,112]7.ð���߹���[144,9,24,255]8.�̻�[140,90,53,26]9.�ù�[40,32,47,25]

* ���ɽ��������޸ġ�

*/









var parameters = PluginManager.parameters('MrLiu_MiniMap');

var notShowSwitch = Number(parameters['NotShowMiniMap']);





(function() {

    var miniMapBitmaps = {};



    var MINI_MAP_MARGIN = 50;

    var MINI_MAP_SIZE = 150;//184;

    var POSITION_RADIUS = 4;

    var COLORS = {

        'walk':     [95, 147, 207, 212],

        'mountain': [255, 255, 255, 0],//224

        'other':    [128, 128, 128, 0],//192

    };

    Bitmap.prototype.replacePixels = function(pixels) {

        var imageData = this._context.createImageData(this.width, this.height);

        imageData.data.set(pixels);

        this._context.putImageData(imageData, 0, 0);

        this._setDirty();

    };



    function isWater(gameMap, x, y) {

        if (gameMap.isOverworld()) {

            var tileId = gameMap.autotileType(x, y, 0);//regionId

            if ([0, 1, 2, 3, 7].some(function(id) {

                return id === tileId;

            })) {

                return true;

            }

        }

        return gameMap.isShipPassable(x, y);

    }



    var Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;

    Scene_Map.prototype.onMapLoaded = function() {

        Scene_Map_onMapLoaded.call(this);

        if (!$dataMap.meta.mini_map) {

            return;

        }

        if ($gameMap.mapId() in miniMapBitmaps) {

            return;

        }

        var pixels = new Uint8Array(4 * $dataMap.width * $dataMap.height);

        var p = 0;

        for (var j = 0; j < $dataMap.height; j++) {

            for (var i = 0; i < $dataMap.width; i++) {

                var color = null;

                if ($gameMap.checkPassage(i, j, 0x0f)) {

                    color = COLORS['walk'];

                } else if (!isWater($gameMap, i, j)) {

                    color = COLORS['mountain'];

}else {

                    color = COLORS['other'];

                }

/*1.�߽�[255,255,255,255] 2.ͨ�в���[95, 147, 207, 212] 3����ͨ�в���[128, 128, 128, 192]4.���������[255,256,75,50]

5.һ�㽨��[11,43,68,206] 6.�̵�[74,135,65,112]7.ð���߹���[144,9,24,255]8.�̻�[140,90,53,26]9.�ù�[40,32,47,255]

*/

switch($gameMap.regionId(i, j)) {

case 0:

break;

case 1:

color = [255,255,255,212];

break;

case 2:

color = [95, 147, 207, 212];

break;

case 3:

color = [128, 128, 128, 212];

break;

case 4:

color = [125,256,75,212];

break;

case 5:

color = [11,43,68,212];

break;

case 6:

color = [74,135,65,212];

break;

case 7:

color = [144,9,24,212];

break;

case 8:

color = [140,90,53,212];

break;

case 9:

color = [40,32,47,212];

break;

case 10:

color = [74,135,65,212];

break;

};

//console.log($gameMap.regionId(i, j));

                pixels[p]   = color[0];

                pixels[p+1] = color[1];

                pixels[p+2] = color[2];

                pixels[p+3] = color[3];

                p += 4;

            }

        }

        var bitmap = new Bitmap($dataMap.width, $dataMap.height);

        bitmap.replacePixels(pixels);

        miniMapBitmaps[$gameMap.mapId()] = bitmap;

    };



    var Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;

    Spriteset_Map.prototype.createUpperLayer = function() {

        Spriteset_Map_createUpperLayer.call(this);

        this.createMiniMap();

    };



    Spriteset_Map.prototype.createMiniMap = function() {

this._miniMapUI = new Sprite();

this._miniMapUI.bitmap = ImageManager.loadPicture('minimap');

        this.addChild(this._miniMapUI);

this._miniMapSprite = new Sprite();

this.addChild(this._miniMapUI);

this._miniMapSprite = new Sprite();

        this._miniMapCurrentPositionSprite = new Sprite();

        var positionBitmap = new Bitmap(POSITION_RADIUS * 2, POSITION_RADIUS * 2);

        positionBitmap.drawCircle(POSITION_RADIUS, POSITION_RADIUS, POSITION_RADIUS, '#ff0000');

        this._miniMapCurrentPositionSprite.bitmap = positionBitmap;

        this.addChild(this._miniMapSprite);

        this.addChild(this._miniMapCurrentPositionSprite);

    };



    var Spriteset_Map_update = Spriteset_Map.prototype.update;

    Spriteset_Map.prototype.update = function() {

        Spriteset_Map_update.call(this);

        this.updateMiniMap();

    };



    Spriteset_Map.prototype.updateMiniMap = function() {

        var miniMapBitmap = miniMapBitmaps[$gameMap.mapId()];

        if (!miniMapBitmap ||($gameMap._interpreter.isRunning()) || ($gameSwitches.value(notShowSwitch) == true)) {

            this._miniMapSprite.visible = false;

            this._miniMapCurrentPositionSprite.visible = false;

this._miniMapUI.visible = false;

            return;

        }

        var size = Math.max(miniMapBitmap.width, miniMapBitmap.height);

        var miniMapScale = MINI_MAP_SIZE / size;

        var miniMapX = Graphics.width - miniMapBitmap.width * miniMapScale - MINI_MAP_MARGIN;

        var miniMapY = MINI_MAP_MARGIN;;//Graphics.height - miniMapBitmap.height * miniMapScale - MINI_MAP_MARGIN;

        this._miniMapSprite.bitmap = miniMapBitmap;

        this._miniMapSprite.x = miniMapX;

        this._miniMapSprite.y = miniMapY;

        this._miniMapSprite.scale.x = miniMapScale;

        this._miniMapSprite.scale.y = miniMapScale;

        this._miniMapCurrentPositionSprite.x = miniMapX + ($gamePlayer.x * miniMapScale) - POSITION_RADIUS;

        this._miniMapCurrentPositionSprite.y = miniMapY + ($gamePlayer.y * miniMapScale) - POSITION_RADIUS;

this._miniMapUI.visible = true;

        this._miniMapSprite.visible = true;

        this._miniMapCurrentPositionSprite.visible = true;

    };



})();