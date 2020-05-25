/*====================================================================================================
 /*:
 * @plugindesc 船体消耗定制脚本 VER001
 * @author ElaoNesside 上官春运 QQ：53899358
 * 
 * @param MaxFood
 * @desc 食物数量上限的变量ID位置
 * @default 1
 * 
 * @param MaxOil
 * @desc 油数量上限的变量ID位置
 * @default 2
 * 
 * @param Food
 * @desc 食物数量的变量ID位置
 * @default 3
 * 
 * @param Oil
 * @desc 油数量的变量ID位置
 * @default 4
 * 
 * @param Boat
 * @desc 小船油耗的额度
 * @default 1
 * 
 * @param Ship
 * @desc 帆船油耗的额度
 * @default 2
 * 
 * @param AirShip
 * @desc 飞船油耗的额度
 * @default 3
 * @help
 * 
 * @param OilS
 * @desc 食物消耗的额度,会按照队伍人数变化
 * @default 1
 * 
 * @param OilTime
 * @desc 食物消耗时间间隔 1000 = 1秒
 * @default 1000
 * 
 * @param Gameover
 * @desc 食物和油消耗完执行公共事件,可以自己在里面设置游戏结束或其它,默认ID:1
 * @default 1
 * 
 * @param Uishow
 * @desc 船体海上显示UI的图片占用ID,默认ID:98
 * @default 98
 * 
 * @param Hpuishow
 * @desc 船体食物海上显示UI的图片占用ID,默认ID:99
 * @default 99
 * 
 * @param Mpuishow
 * @desc 船体油量海上显示UI的图片占用ID,默认ID:100
 * @default 100
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * @help
 * ===========================================================================
 *  插件会默认占用变量编号0001 - 0004位置，如果有冲突请更改
 *  分别是
 *  MAX油量上限
 *  MAX食物上限
 *  油量上限
 *  食物上限
 *  然后是海上显示的图片变量
 *  默认是,98,99,100
 *  有冲突自行修改
 *  开始游戏之前请设置好以上变量,不然会出错
 *  图片包内的3张图片请放入相对应的文件夹
 * 
 * 
 *  注意要设置好GAMEOVER执行的公共事件ID可自行设置
 *  然后想GAMEOVER后执行什么都可以DIY
 * 
 *
 * 
//===========================================================================*/
ENSHullConsume = {};

ENSHullConsume.HullHave = {
	X: null,
	Y: null,
	Time: null
};

ENSHullConsume.parameters = PluginManager.parameters('ENSHullConsume');
ENSHullConsume.MaxOil = Number(ENSHullConsume.parameters['MaxOil'])
ENSHullConsume.MaxFood = Number(ENSHullConsume.parameters['MaxFood'])
ENSHullConsume.Oil = Number(ENSHullConsume.parameters['Oil'])
ENSHullConsume.Food = Number(ENSHullConsume.parameters['Food'])
ENSHullConsume.Boat = Number(ENSHullConsume.parameters['Boat'])
ENSHullConsume.Ship = Number(ENSHullConsume.parameters['Ship'])
ENSHullConsume.AirShip = Number(ENSHullConsume.parameters['AirShip'])
ENSHullConsume.OilS = Number(ENSHullConsume.parameters['OilS'])
ENSHullConsume.OilTime = Number(ENSHullConsume.parameters['OilTime'])
ENSHullConsume.Gameover = Number(ENSHullConsume.parameters['Gameover'])
ENSHullConsume.Uishow = Number(ENSHullConsume.parameters['Uishow'])
ENSHullConsume.Hpuishow = Number(ENSHullConsume.parameters['Hpuishow'])
ENSHullConsume.Mpuishow = Number(ENSHullConsume.parameters['Mpuishow'])

ENSHullConsume.SailStart = function() {
	if ($gameMap && $gamePlayer.isInVehicle()) {
		if (this.HullHave.Time == null) {
			this.HullHave.Time = Date.now();
		}
		var Player = this.HullHave;
		var Svar = $gameVariables;
		var Sgpl = $gamePlayer;
		var Oil = this.Oil;
		var Food = this.Food;
		if (Player.X != Sgpl.x || Player.Y != Sgpl.y) {
			Player.X = Sgpl.x;
			Player.Y = Sgpl.y;
			switch ($gamePlayer._vehicleType) {
			case 'boat':
				Svar._data[Oil] -= this.Boat;
				break;
			case 'ship':
				Svar._data[Oil] -= this.Ship;
				break;
			case 'airship':
				Svar._data[Oil] -= this.AirShip;
				break;
			}
		}
		var TimeEx = Date.now() - this.HullHave.Time;

		if (TimeEx >= this.OilTime) {
			this.HullHave.Time = null;
			Svar._data[Food] -= (this.OilS * $gameParty._actors.length);
			if (Svar._data[Food] <= 0 || Svar._data[Oil] <= 0) {
				$gameTemp.reserveCommonEvent(this.Gameover);
			}
		}
$gameScreen.showPicture(this.Uishow,'hullui',0, 0, 0,100, 100,255,0);
var RandomX = parseInt(Svar._data[this.Food] * 100 / Svar._data[this.MaxFood]);
$gameScreen.showPicture(this.Hpuishow,'hullhp',0,96,21,RandomX,100,255,0);
var RandomX = parseInt(Svar._data[this.Oil] * 100 / Svar._data[this.MaxOil]);
$gameScreen.showPicture(this.Mpuishow,'hullmp',0,96,60,RandomX,100,255,0);
		//console.log("坐标X=" + Player.X + "坐标Y=" + Player.Y + "剩余汽油" + Svar._data[Oil] + "剩余食物" + Svar._data[Food])
	} else {
		ENSHullConsume.HullHave.Time = null;
		$gameScreen.erasePicture(this.Uishow);
		$gameScreen.erasePicture(this.Hpuishow);
		$gameScreen.erasePicture(this.Mpuishow);
	}

}



ENSHullConsume.update = Game_Screen.prototype.update;
Game_Screen.prototype.update = function() {
	ENSHullConsume.update.call(this)
	ENSHullConsume.SailStart();
};