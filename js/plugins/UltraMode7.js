/*:
@plugindesc Renders the tilemap in 3D. Supports various parameters such as yaw rotation,
pitch, field of view, etc.
@author Blizzard

@help Version: 1.3.7

--Introduction--

Ultra Mode 7 simulates the Mode 7 rendering mode from the SNES by using 3D
rendering. Sprites are scaled appropriately and use additional code to
determine whether they are visible, because of cut-off distance. The view
of a Mode 7 map is defined by the following parameters:

- camera distance
- field of view
- pitch rotation angle
- yaw rotation angle
- maximum Z coordinate

--Changelog--

v1.3.7:
- added experimental compatibility for BattleLighting plugin

v1.3.6:
- added experimental compatibility for BattleLighting plugin

v1.3.5:
- corrected some minor positioning and scaling calculation errors
- improved compatibility code for KhasUltraLighting

v1.3.4:
- added compatibility code for KhasUltraLighting
- added compatibility instructions for Terrax Plugins - Lighting system

v1.3.3:
- fixed issue with event visibility on map borders when using looping maps

v1.3.2:
- added coordinate rounding for X and Y coordinates
- improved code that handles sprite visibility when outside of the view frustum
- removed some leftover debug prints

v1.3.1:
- fixed a crash with event testing

v1.3.0:
- implemented map looping functionality
- added workaround for PIXI bug where a lag spike would occur about every 10 seconds
- fixed issue where sprite direction didn't display properly at certain yaw angles
- fixed issue where movement controls didn't adjust to yaw angle
- added CHARACTERS_ADJUST_SPRITE_DIRECTION option
- fixed coordinate offset when using yaw angle

v1.2.4:
- fixed accidental removal of animateCameraDistance function

v1.2.3:
- added parallax distance parameter in maps for parallax movement with yaw and pitch
- renamed "Camera" functions to "CameraDistance"
- fixed bug with parallax scrolling on non-Mode 7 maps
- fixed bug with shaking the screen
- removed FOV limit and implemented orthogonal projection with FOV of 0°

v1.2.2:
- fixed a syntax error that was caused by code cleanup

v1.2.1:
- fixed save data issue

v1.2.0:
- fixed FPS drop problem while moving

v1.1.0:
- added animation function for parameters
- renamed RENDER_PIXELATED option to TILEMAP_PIXELATED
- added CHARACTERS_PIXELATED option
- fixed issue with floating characters
- fixed issue with normal maps not working anymore
- added some code to prevent compatibility issues with some map scripts

--How to use--

Separate maps can control and even dynamically change most paramaters. In
order to turn a normal map into a Mode 7 map, custom parameters need to be
defined in the "Note" section of the map. To use the default values for a
map, simply add the following entry to the map "note":

<UltraMode7>

If any other parameter is defined, this is not necessary. The following
parameters can be defined:

- UltraMode7_FOV
- UltraMode7_Pitch
- UltraMode7_Yaw
- UltraMode7_CameraDistance
- UltraMode7_ParallaxDistance

Example:

<UltraMode7_FOV:50>

When multiple parameters are defined, simply add them one after another.
Example:

<UltraMode7_Pitch:50>
<UltraMode7_CameraDistance:400>
<UltraMode7_Yaw:45>
<UltraMode7_ParallaxDistance:800>

--How to change parameters dynamically--

The 4 parameters that can be defined in the note section of a map can also
be changed at any time during the map. Following calls are available:

UltraMode7.setFov(DEGREES)
UltraMode7.setPitch(DEGREES)
UltraMode7.setYaw(DEGREES)
UltraMode7.setCameraDistance(Z_DISTANCE)
UltraMode7.setParallaxDistance(DISTANCE)

You can also obtain the current values with these calls:

UltraMode7.getFov()
UltraMode7.getPitch()
UltraMode7.getYaw()
UltraMode7.getCameraDistance()
UltraMode7.getParallaxDistance()

You can also change the values in an animated manner:

UltraMode7.animateFov(TARGET_VALUE, FRAMES_DURATION)
UltraMode7.animatePitch(TARGET_VALUE, FRAMES_DURATION)
UltraMode7.animateYaw(TARGET_VALUE, FRAMES_DURATION)
UltraMode7.animateCameraDistance(TARGET_VALUE, FRAMES_DURATION)

Parallax distance cannot be animated due to its internal implementation relying
on fixed values.

--Additional Notes--

- When using parallax backgrounds due to how rendering is done, it's useful
  to have a custom parallax that fades into white and creates a seamless
  transition into the faded tiles. Make sure to adjust for changes in the
  pitch angle as well.
- Smaller values of FAR_CLIP_Z will cause characters and the tilemap
  to be cut off earlier. Effectively it moves the cut-off horizon closer.
- If you don't want white fade-out, set both FADE_Z values to a larger value
  than FAR_CLIP_Z.
- When the yaw value is changed, characters are turned around accordingly, but
  controls aren't changed.
- Consider using the same values for BASE_SCALE_Z and DEFAULT_CAMERA_DISTANCE.
- If you use a FOV of 0, the display mode will switch to orthogonal projection.
- When using looping maps, the change of FOV, camera distance and far-clip
  Z-plane might require recalculation of the entire tilemap and can cause
  momentary performance drops so it should be used sparingly. If you absolutely
  require dynamic changes of these parameters by large values, you can increase
  the option LOOP_MAPS_EXTEND_TILES to decrease the likelyhood of the
  recalculation to happen.

--Technical details, limitations and compatibility--

- Requires WebGL. Does not work with canvas and due to how canvas works, it
  can never support canvas.
- Due to sprite scaling, how character sprite sheets are organized and how
  pixel interpolation is done when scaling is applied, there can be artifacts
  during rendering of characters. Manipulating the FAR_CLIP_Z value can
  help remove these artifacts to some degree.
- The tilemap is rendered in its entirety and the projection matrix is used
  to limit visibility. The hardware should take care of optimizing rendering.
- Due to a hard limit of 65536 vertices being rendered at once in WebGL, the
  code has been adjusted to render the tilemap in as many passes as necessary.
  Since some people reported issues even with 65536 vertices, a soft limit of
  65532 is being used within the script.
- Because the tilemap is rendered entirely flat, tile priority isn't used.
- Scaling has been optimized for usage of an FOV of 60°. Using different
  values will cause some weird scales being used for characters.
- Using low values for FOV will likely cause display issues (except for 0°
  which will activate orthogonal projection).
- Due to yaw rotation requiring turning of characters, 8-directional
  characters sprites might have only limited support.
- When using looping maps, don't make them too small. Event positioning on the
  map border could cause issues otherwise.
- Possibly not compatible with scripts that manipulate tilemap data too much
  or too deeply.
- Compatible with KhasUltraLighting. Put this script below KhasUltraLighting.
- Possibly not compatible with custom character objects that don't derive
  from Game_Event.
  
--Custom compatibility code

- This script can be made compatible with the script
  "Terrax Plugins - Lighting system", but due to the way it's
  written, the compatibility needs to be done manually. Find this segment of
  code:

if (flashlight == true) {
	this._maskBitmap.radialgradientFillRect2(lx1, ly1, 0, light_radius, colorvalue, '#000000', ldir, flashlength, flashwidth);
} else {
	this._maskBitmap.radialgradientFillRect(lx1, ly1, 0, light_radius, colorvalue, '#000000', objectflicker, brightness, direction);
}

  Replace it with this:
  
var visible = true;
if ($gameMap.useUltraMode7)
{
	var position = UltraMode7.mapToScreen(lx1, ly1 + ph / 2);
	if ($gameMap.ultraMode7Fov > 0)
	{
		var z = position.z;
		if (z <= UltraMode7.NEAR_CLIP_Z && z >= UltraMode7.FAR_CLIP_Z)
		{
			visible = false;
		}
	}
	if (visible)
	{
		var scale = UltraMode7.mapToScreenScale(lx1, ly1);
		lx1 = position.x;
		ly1 = position.y -= ph / 2 * scale;
		light_radius *= scale;
	}
}
if (visible)
{
	if (flashlight == true) {
		this._maskBitmap.radialgradientFillRect2(lx1, ly1, 0, light_radius, colorvalue, '#000000', ldir, flashlength, flashwidth);
	} else {
		this._maskBitmap.radialgradientFillRect(lx1, ly1, 0, light_radius, colorvalue, '#000000', objectflicker, brightness, direction);
	}
}
  
  This will make "Terrax Plugins - Lighting system" work with Ultra Mode 7.

@param FAR_CLIP_Z
@desc Defines the maximum Z-coordinate for visibility of tiles and characters.
@default 1200

@param FADE_Z_BEGIN
@desc Defines the Z-coordinate at which white fading will start on the tilemap.
@default 500

@param FADE_Z_END
@desc Defines the Z-coordinate at which white fading will be at full on the tilemap.
@default 1150

@param BASE_SCALE_Z
@desc Defines the Z-coordinate at which character scaling is 1.0.
@default 450

@param PARALLAX_SCROLL_X_MULTIPLIER
@desc Defines the multiplier for parallax X-scrolling.
@default 0.5

@param PARALLAX_SCROLL_Y_MULTIPLIER
@desc Defines the multiplier for parallax Y-scrolling.
@default 1.0

@param TILEMAP_PIXELATED
@desc Whether the tilemap should be rendered pixelated.
ON = true, OFF = false
@default true

@param CHARACTERS_PIXELATED
@desc Whether the characters should be rendered pixelated.
ON = true, OFF = false
@default true

@param CHARACTERS_ADJUST_SPRITE_DIRECTION
@desc Whether characters should have their sprite direction adjusted to yaw angle.
ON = true, OFF = false
@default true

@param PLAYER_ADJUST_MOVE_DIRECTION
@desc Whether player directional input should be adjusted to yaw angle.
ON = true, OFF = false
@default true

@param LOOP_MAPS_EXTEND_TILES
@desc The additional tiles that are rendered in looping maps.
@default 3

@param DEFAULT_FOV
@desc Defines the default value for the field-of-view parameter (in degrees).
@default 60

@param DEFAULT_PITCH
@desc Defines the default value for the pitch rotation angle parameter (in degrees).
@default 45

@param DEFAULT_YAW
@desc Defines the default value for the yaw rotation angle parameter (in degrees).
@default 0

@param DEFAULT_CAMERA_DISTANCE
@desc Defines the default distance of the camera from the tilemap in screen space. 
@default 450

@param DEFAULT_PARALLAX_DISTANCE
@desc Defines the distance of the parallax from the center position of the camera.
@default 550

*/

//=============================================================================
// Vector3
//=============================================================================

function Vector3()
{
	this.initialize.apply(this, arguments);
}

Vector3.prototype.initialize = function(x, y, z)
{
	this.x = (x || 0);
	this.y = (y || 0);
	this.z = (z || 0);
};

Vector3.prototype.set = function(x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
};

Vector3.prototype.length = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

Vector3.prototype.normalize = function()
{
	var length = this.length();
	if (length !== 0)
	{
		length = 1 / length;
		this.x *= length;
		this.y *= length;
		this.z *= length;
	}
};

Vector3.prototype.negative = function()
{
	this.x = -this.x;
	this.y = -this.y;
	this.z = -this.z;
};

Vector3.prototype.multiply = function(factor)
{
	this.x *= factor;
	this.y *= factor;
	this.z *= factor;
};

Vector3.prototype.plused = function(other)
{
	return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
};

Vector3.prototype.minused = function(other)
{
	return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
};

Vector3.prototype.averaged = function(other)
{
	return new Vector3((this.x + other.x) / 2, (this.y + other.y) / 2, (this.z + other.z) / 2);
};

Vector3.prototype.dotted = function(other)
{
	return (this.x * other.x + this.y * other.y + this.z * other.z);
};

Vector3.prototype.crossed = function(other)
{
	return new Vector3(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x);
};

//=============================================================================
// Matrix4
//=============================================================================

function Matrix4()
{
	this.initialize.apply(this, arguments);
}

Matrix4.prototype.initialize = function(data)
{
	if (data)
	{
		this.data = data.slice();
	}
	else
	{
		this.data = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	}
};
	
Matrix4.prototype.setIdentity = function()
{
	this.setZero();
	this.data[0] = this.data[5] = this.data[10] = this.data[15] = 1;
};

Matrix4.prototype.setZero = function()
{
	for (var i = 0; i < 16; ++i)
	{
		this.data[i] = 0;
	}
};

Matrix4.prototype.set = function(data)
{
	this.data = data.slice();
};

Matrix4.prototype.setTranslation = function(vector)
{
	this.setIdentity();
	this.data[12] = vector.x;
	this.data[13] = vector.y;
	this.data[14] = vector.z;
};

Matrix4.prototype.translate = function(x, y, z)
{
	var matrix = new Matrix4();
	matrix.setTranslation(new Vector3(x, y, z));
	this.multiply(matrix);
};

Matrix4.prototype.rotateX = function(angle)
{
	var matrix = new Matrix4();
	matrix.setRotationX(angle);
	this.multiply(matrix);
};

Matrix4.prototype.rotateY = function(angle)
{
	var matrix = new Matrix4();
	matrix.setRotationY(angle);
	this.multiply(matrix);
};

Matrix4.prototype.rotateZ = function(angle)
{
	var matrix = new Matrix4();
	matrix.setRotationZ(angle);
	this.multiply(matrix);
};

Matrix4.prototype.setRotationX = function(angle)
{
	this.setZero();
	var rad = BlizzardUtility.degreesToRadians(angle);
	this.data[0] = this.data[15] = 1;
	this.data[5] = this.data[10] = Math.cos(rad);
	this.data[6] = Math.sin(rad);
	this.data[9] = -this.data[6];
};

Matrix4.prototype.setRotationY = function(angle)
{
	this.setZero();
	var rad = BlizzardUtility.degreesToRadians(angle);
	this.data[5] = this.data[15] = 1;
	this.data[0] = this.data[10] = Math.cos(rad);
	this.data[8] = Math.sin(rad);
	this.data[2] = -this.data[8];
};

Matrix4.prototype.setRotationZ = function(angle)
{
	this.setZero();
	var rad = BlizzardUtility.degreesToRadians(angle);
	this.data[10] = this.data[15] = 1;
	this.data[0] = this.data[5] = Math.cos(rad);
	this.data[1] = Math.sin(rad);
	this.data[4] = -this.data[1];
};

Matrix4.prototype.multiply = function(other)
{
	this.set([this.data[0] * other.data[0] + this.data[4] * other.data[1] + this.data[8] * other.data[2] + this.data[12] * other.data[3],
		this.data[1] * other.data[0] + this.data[5] * other.data[1] + this.data[9] * other.data[2] + this.data[13] * other.data[3],
		this.data[2] * other.data[0] + this.data[6] * other.data[1] + this.data[10] * other.data[2] + this.data[14] * other.data[3],
		this.data[3] * other.data[0] + this.data[7] * other.data[1] + this.data[11] * other.data[2] + this.data[15] * other.data[3],
		this.data[0] * other.data[4] + this.data[4] * other.data[5] + this.data[8] * other.data[6] + this.data[12] * other.data[7],
		this.data[1] * other.data[4] + this.data[5] * other.data[5] + this.data[9] * other.data[6] + this.data[13] * other.data[7],
		this.data[2] * other.data[4] + this.data[6] * other.data[5] + this.data[10] * other.data[6] + this.data[14] * other.data[7],
		this.data[3] * other.data[4] + this.data[7] * other.data[5] + this.data[11] * other.data[6] + this.data[15] * other.data[7],
		this.data[0] * other.data[8] + this.data[4] * other.data[9] + this.data[8] * other.data[10] + this.data[12] * other.data[11],
		this.data[1] * other.data[8] + this.data[5] * other.data[9] + this.data[9] * other.data[10] + this.data[13] * other.data[11],
		this.data[2] * other.data[8] + this.data[6] * other.data[9] + this.data[10] * other.data[10] + this.data[14] * other.data[11],
		this.data[3] * other.data[8] + this.data[7] * other.data[9] + this.data[11] * other.data[10] + this.data[15] * other.data[11],
		this.data[0] * other.data[12] + this.data[4] * other.data[13] + this.data[8] * other.data[14] + this.data[12] * other.data[15],
		this.data[1] * other.data[12] + this.data[5] * other.data[13] + this.data[9] * other.data[14] + this.data[13] * other.data[15],
		this.data[2] * other.data[12] + this.data[6] * other.data[13] + this.data[10] * other.data[14] + this.data[14] * other.data[15],
		this.data[3] * other.data[12] + this.data[7] * other.data[13] + this.data[11] * other.data[14] + this.data[15] * other.data[15]]);
};

Matrix4.prototype.multiplied = function(vector)
{
	return new Vector3(this.data[0] * vector.x + this.data[4] * vector.y + this.data[8] * vector.z + this.data[12],
		this.data[1] * vector.x + this.data[5] * vector.y + this.data[9] * vector.z + this.data[13],
		this.data[2] * vector.x + this.data[6] * vector.y + this.data[10] * vector.z + this.data[14]);
};

Matrix4.prototype.lookAt = function(eye, target, up)
{
	this.setZero();
	var bz = eye.minused(target);
	bz.normalize();
	var bx = up.crossed(bz);
	bx.normalize();
	var by = bz.crossed(bx);
	by.normalize();
	this.data[0] = bx.x;	this.data[1] = by.x;	this.data[2] = bz.x;
	this.data[4] = bx.y;	this.data[5] = by.y;	this.data[6] = bz.y;
	this.data[8] = bx.z;	this.data[9] = by.z;	this.data[10] = bz.z;	this.data[15] = 1;
	eye.negative();
	var b = new Matrix4();
	b.setTranslation(eye);
	this.multiply(b);
};

Matrix4.prototype.setPerspective = function(fov, width, height, nearZ, farZ)
{
	this.setZero();
	var iy = 1 / Math.tan(BlizzardUtility.degreesToRadians(fov * 0.5));
	var zDiff = farZ - nearZ;
	this.data[0] = iy * height / width;
	this.data[5] = iy;
	this.data[10] = -(farZ + nearZ) / zDiff;
	this.data[11] = -1;
	this.data[14] = -2 * farZ * nearZ / zDiff;
};

Matrix4.prototype.setOrthoProjection = function(x, y, width, height)
{
	this.setZero();
	this.data[0] = 2 / width;
	this.data[5] = 2 / height;
	this.data[12] = x * 2 / width;
	this.data[13] = y * 2 / height;
	this.data[15] = 1;
};

Matrix4.prototype.inversed = function()
{
	var invDet = 1 / this.determinant();
	m = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
	m[0] = (this.data[5] * this.data[10] - this.data[9] * this.data[6]) * invDet;
	m[1] = -(this.data[1] * this.data[10] - this.data[9] * this.data[2]) * invDet;
	m[2] = (this.data[1] * this.data[6] - this.data[5] * this.data[2]) * invDet;
	m[4] = -(this.data[4] * this.data[10] - this.data[8] * this.data[6]) * invDet;
	m[5] = (this.data[0] * this.data[10] - this.data[8] * this.data[2]) * invDet;
	m[6] = -(this.data[0] * this.data[6] - this.data[4] * this.data[2]) * invDet;
	m[8] = (this.data[4] * this.data[9] - this.data[8] * this.data[5]) * invDet;
	m[9] = -(this.data[0] * this.data[9] - this.data[8] * this.data[1]) * invDet;
	m[10] = (this.data[0] * this.data[5] - this.data[4] * this.data[1]) * invDet;
	m[12] = -(this.data[12] * m[0] + this.data[13] * m[4] + this.data[14] * m[8]);
	m[13] = -(this.data[12] * m[1] + this.data[13] * m[5] + this.data[14] * m[9]);
	m[14] = -(this.data[12] * m[2] + this.data[13] * m[6] + this.data[14] * m[10]);
	return new Matrix4(m);
};

Matrix4.prototype.determinant = function()
{
	return (this.data[0] * this.data[5] * this.data[10] +
		this.data[4] * this.data[9] * this.data[2] +
		this.data[8] * this.data[1] * this.data[6] -
		this.data[8] * this.data[5] * this.data[2] -
		this.data[4] * this.data[1] * this.data[10] -
		this.data[0] * this.data[9] * this.data[6]);
};

Matrix4.prototype.transpose = function()
{
	this.set([this.data[0], this.data[4], this.data[8], this.data[12],
		this.data[1], this.data[5], this.data[9], this.data[13],
		this.data[2], this.data[6], this.data[10], this.data[14],
		this.data[3], this.data[7], this.data[11], this.data[15]]);
};

//=============================================================================
// Ultra Mode 7
//=============================================================================

(function() {

if (!Graphics.hasWebGL())
{
	console.error("Ultra Mode 7 requires WebGL support!");
	return;
}

//=============================================================================
// BlizzardUtility
//=============================================================================

if (typeof(BlizzardUtility) === "undefined")
{
	BlizzardUtility = function()
	{
		throw new Error("This is a static class");
	};
}

BlizzardUtility.degreesToRadians = function(degrees)
{
	return (degrees * 0.01745329251994329576923690768489);
};

BlizzardUtility.radiansToDegrees = function(radians)
{
	return (radians * 57.295779513082320876798154814105);
};

BlizzardUtility.hypot = function(x, y)
{
	return Math.sqrt(x * x + y * y);
};

BlizzardUtility.Numeric = function(value, defaultValue)
{
	var result = Number(value);
	if (result || result === 0)
	{
		return result;
	}
	return defaultValue;
};

//=============================================================================
// UltraMode7
//=============================================================================

UltraMode7 = {};
UltraMode7.VERSION = 137

// constants
// NOTE: Don't change these unless you know what you are doing!

UltraMode7.WEBGL_MAX_VERTICES = 65532; // stay under the WebGL limit of 65536, some have reported bugs
UltraMode7.NEAR_CLIP_Z = 10;
UltraMode7.MIN_FOV = 0;
UltraMode7.MIN_PITCH = 0;
UltraMode7.MAX_PITCH = 90;

// configuration parameters

var _parameters = PluginManager.parameters("UltraMode7");
UltraMode7.FAR_CLIP_Z = Math.max(BlizzardUtility.Numeric(_parameters["FAR_CLIP_Z"], 1200), UltraMode7.NEAR_CLIP_Z + 1);
UltraMode7.FADE_Z_BEGIN = BlizzardUtility.Numeric(_parameters["FADE_Z_BEGIN"], 500);
UltraMode7.FADE_Z_END = BlizzardUtility.Numeric(_parameters["FADE_Z_END"], 1150);
UltraMode7.BASE_SCALE_Z = BlizzardUtility.Numeric(_parameters["BASE_SCALE_Z"], 450);
UltraMode7.PARALLAX_SCROLL_X_MULTIPLIER = BlizzardUtility.Numeric(_parameters["PARALLAX_SCROLL_X_MULTIPLIER"], 0.5);
UltraMode7.PARALLAX_SCROLL_Y_MULTIPLIER = BlizzardUtility.Numeric(_parameters["PARALLAX_SCROLL_Y_MULTIPLIER"], 1.0);
UltraMode7.TILEMAP_PIXELATED = JSON.parse(_parameters["TILEMAP_PIXELATED"]);
UltraMode7.CHARACTERS_PIXELATED = JSON.parse(_parameters["CHARACTERS_PIXELATED"]);
UltraMode7.CHARACTERS_ADJUST_SPRITE_DIRECTION = JSON.parse(_parameters["CHARACTERS_ADJUST_SPRITE_DIRECTION"]);
UltraMode7.PLAYER_ADJUST_MOVE_DIRECTION = JSON.parse(_parameters["PLAYER_ADJUST_MOVE_DIRECTION"]);
UltraMode7.LOOP_MAPS_EXTEND_TILES = Math.max(BlizzardUtility.Numeric(_parameters["LOOP_MAPS_EXTEND_TILES"], 3), 0);
UltraMode7.DEFAULT_FOV = BlizzardUtility.Numeric(_parameters["DEFAULT_FOV"], 60);
UltraMode7.DEFAULT_PITCH = BlizzardUtility.Numeric(_parameters["DEFAULT_PITCH"], 45);
UltraMode7.DEFAULT_YAW = BlizzardUtility.Numeric(_parameters["DEFAULT_YAW"], 0);
UltraMode7.DEFAULT_CAMERA_DISTANCE = Math.max(BlizzardUtility.Numeric(_parameters["DEFAULT_CAMERA_DISTANCE"], 450), 0);
UltraMode7.DEFAULT_PARALLAX_DISTANCE = Math.max(BlizzardUtility.Numeric(_parameters["DEFAULT_PARALLAX_DISTANCE"], 550), 1);

// interface functions for script calls

UltraMode7.getFov = function()
{
	return $gameMap.ultraMode7Fov;
};

UltraMode7.setFov = function(value)
{
	$gameMap.setUltraMode7Fov(value);
};

UltraMode7.getPitch = function()
{
	return $gameMap.ultraMode7Pitch;
};

UltraMode7.setPitch = function(value)
{
	$gameMap.setUltraMode7Pitch(value);
};

UltraMode7.getYaw = function()
{
	return $gameMap.ultraMode7Yaw;
};

UltraMode7.setYaw = function(value)
{
	$gameMap.setUltraMode7Yaw(value);
};

UltraMode7.getCameraDistance = function()
{
	return $gameMap.ultraMode7CameraDistance;
};

UltraMode7.setCameraDistance = function(value)
{
	$gameMap.setUltraMode7CameraDistance(value);
};

UltraMode7.getParallaxDistance = function()
{
	return $gameMap.ultraMode7ParallaxDistance;
};

UltraMode7.setParallaxDistance = function(value)
{
	$gameMap.setUltraMode7ParallaxDistance(value);
};

UltraMode7.animateFov = function(target, frameDuration)
{
	$gameMap.animateUltraMode7Fov(target, frameDuration);
};

UltraMode7.animatePitch = function(target, frameDuration)
{
	$gameMap.animateUltraMode7Pitch(target, frameDuration);
};

UltraMode7.animateYaw = function(target, frameDuration)
{
	$gameMap.animateUltraMode7Yaw(target, frameDuration);
};

UltraMode7.animateCameraDistance = function(target, frameDuration)
{
	$gameMap.animateUltraMode7CameraDistance(target, frameDuration);
};

// functions

UltraMode7.screenToMap = function(x, y)
{
	// transform 2 point ray from projection into world
	var projectionMatrix = $gameMap.ultraMode7ProjectionMatrix;
	var halfWidth = Graphics.boxWidth / 2;
	var halfHeight = Graphics.boxHeight / 2;
	var origin = new Vector3(x - halfWidth, y - halfHeight, -1);
	var target = new Vector3(x - halfWidth, y - halfHeight, 1);
	if ($gameMap.ultraMode7Fov > 0)
	{
		var scaleZ = projectionMatrix.data[10];
		var offsetZ = projectionMatrix.data[14];
		origin.x = origin.x * (offsetZ - origin.z) / scaleZ / halfWidth;
		origin.y = origin.y * (offsetZ - origin.z) / scaleZ / halfHeight;
		target.x = target.x * (offsetZ - target.z) / scaleZ / halfWidth;
		target.y = target.y * (offsetZ - target.z) / scaleZ / halfHeight;
	}
	else
	{
		target = origin.plused(target);
	}
	projectionMatrix = projectionMatrix.inversed();
	origin = projectionMatrix.multiplied(origin);
	target = projectionMatrix.multiplied(target);
	var mapWidth = $gameMap.width() * $gameMap.tileWidth();
	var mapHeight = $gameMap.height() * $gameMap.tileHeight();
	// first transform 4 points from model into world space
	var modelviewMatrix = $gameMap.ultraMode7ModelviewMatrix;
	var topLeft = modelviewMatrix.multiplied(new Vector3(0, 0, 0));
	var topRight = modelviewMatrix.multiplied(new Vector3(mapWidth, 0, 0));
	var bottomLeft = modelviewMatrix.multiplied(new Vector3(0, mapHeight, 0));
	var bottomRight = modelviewMatrix.multiplied(new Vector3(mapWidth, mapHeight, 0));
	// solve equation Ax + By + Cz + D = 0
	var equations = [
		[topLeft.x, topLeft.y, topLeft.z, 0],
		[topRight.x, topRight.y, topRight.z, 0],
		[bottomLeft.x, bottomLeft.y, bottomLeft.z, 0],
		[bottomRight.x, bottomRight.y, bottomRight.z, 0]
	];
	var factors = UltraMode7._solveLinearEquationWithGaussianElimination(equations);
	// create plane equation
	var ray = target.minused(origin);
	var normal = new Vector3(factors[0], factors[1], factors[2]);
	ray.multiply((factors[3] - normal.dotted(origin)) / normal.dotted(ray));
	var intersection = origin.plused(ray);
	return modelviewMatrix.inversed().multiplied(intersection);
};

UltraMode7._solveLinearEquationWithGaussianElimination = function(M)
{
	var mLength = M.length;
	for (var i = 0; i < mLength; ++i)
	{
		M[i].push(1);
	}
	for (var i = 0; i < mLength; ++i)
	{
		// Search for maximum in this column
		var maxElement = Math.abs(M[i][i]);
		var maxRow = i;
		for (var k = i + 1; k < mLength; ++k)
		{
			var newMax = Math.abs(M[k][i]);
			if (maxElement < newMax)
			{
				maxElement = newMax;
				maxRow = k;
			}
		}
		// Swap maximum row with current row (column by column)
		for (var k = i; k < mLength + 1; ++k)
		{
			var swap = M[maxRow][k];
			M[maxRow][k] = M[i][k];
			M[i][k] = swap;
		}
		if (M[i][i] !== 0)
		{
			// Make all rows below this one 0 in current column
			for (var k = i + 1; k < mLength; ++k)
			{
				var value = -M[k][i] / M[i][i];
				for (var j = i; j < mLength + 1; ++j)
				{
					if (i === j)
					{
						M[k][j] = 0;
					}
					else
					{
						M[k][j] += value * M[i][j];
					}
				}
			}
		}
	}
	// Solve equation Mx=b for the upper triangular matrix M
	result = [];
	for (var i = mLength - 1; i >= 0; --i)
	{ 
		if (M[i][i] === 0)
		{
			result[i] = 1;
		}
		else
		{
			result[i] = M[i][mLength] / M[i][i];
		}
		for (var k = i - 1; k >= 0; --k)
		{
			M[k][mLength] -= M[k][i] * result[i];
		}
	}
	return result;
};

UltraMode7.mapToScreen = function(x, y)
{
	var position = new Vector3(x + $gameMap.displayX() * $gameMap.tileWidth(), y + $gameMap.displayY() * $gameMap.tileHeight(), 0);
	var worldPosition = $gameMap.ultraMode7ModelviewMatrix.multiplied(position);
	var projection = $gameMap.ultraMode7ProjectionMatrix;
	var result = projection.multiplied(worldPosition);
	// W is needed for perspective projection
	var vectorW = projection.data[3] * worldPosition.x + projection.data[7] * worldPosition.y + projection.data[11] * worldPosition.z + projection.data[15];
	// calculate perspective projection and offset to screen coordinates
	result.x = Math.round(result.x * Graphics.boxWidth / 2 / vectorW + Graphics.boxWidth / 2) - $gameScreen.shake();
	result.y = Math.round(result.y * Graphics.boxHeight / 2 / vectorW + Graphics.boxHeight / 2);
	return result;
};

UltraMode7.mapToScreenScale = function(x, y)
{
	if ($gameMap.ultraMode7Fov <= 0)
	{
		return 1.0;
	}
	return UltraMode7.mapZToScreenScale(UltraMode7.mapToScreen(x, y).z);
};

UltraMode7.mapZToScreenScale = function(z)
{
	return (UltraMode7.BASE_SCALE_Z / Math.abs(z));
};

UltraMode7.rotateDirection = function(direction, clockwise)
{
	var angle = $gameMap.ultraMode7Yaw.mod(360);
	if (clockwise && angle >= 45 && angle <= 135 || !clockwise && angle >= 225 && angle <= 315)
	{
		switch (direction)
		{
		case 2:	direction = 4;	break;
		case 4:	direction = 8;	break;
		case 6:	direction = 2;	break;
		case 8:	direction = 6;	break;
		default: 				break;
		}
	}
	else if (angle > 135 && angle < 225)
	{
		direction = 10 - direction;
	}
	else if (!clockwise && angle >= 45 && angle <= 135 || clockwise && angle >= 225 && angle <= 315)
	{
		switch (direction)
		{
		case 2:	direction = 6;	break;
		case 4:	direction = 2;	break;
		case 6:	direction = 8;	break;
		case 8:	direction = 4;	break;
		default: 				break;
		}
	}
	return direction;
};

//=============================================================================
// Shader
//=============================================================================

UltraMode7.Shader = (function(_super)
{
	RECT_SHADER_VERTEX = "\n\
		attribute vec2 aVertexPosition;\n\
		attribute vec2 aTextureCoord;\n\
		attribute vec4 aFrame;\n\
		attribute vec2 aAnim;\n\
		attribute float aTextureId;\n\
		\n\
		uniform mat4 mode7ProjectionMatrix;\n\
		uniform mat4 mode7ModelviewMatrix;\n\
		uniform vec2 animationFrame;\n\
		\n\
		varying vec2 vTextureCoord;\n\
		varying vec4 vFrame;\n\
		varying float vTextureId;\n\
		varying float vFade;\n\
		\n\
		void main(void){\n\
			vec4 position = mode7ModelviewMatrix * vec4(aVertexPosition, 0.0, 1.0);\n\
			position = mode7ProjectionMatrix * vec4(position.x, position.y, position.z, position.w);\
			gl_Position = position;\
			vec2 anim = aAnim * animationFrame;\n\
			vTextureCoord = aTextureCoord + anim;\n\
			vFrame = aFrame + vec4(anim, anim);\n\
			vTextureId = aTextureId;\n\
			vFade = clamp((position.z - " + UltraMode7.FADE_Z_BEGIN.toFixed(2) + ") / " + (UltraMode7.FADE_Z_END - UltraMode7.FADE_Z_BEGIN).toFixed(2) + ", 0.0, 1.0);\n\
		}\n";
	RECT_SHADER_FRAGMENT = "\
		varying vec2 vTextureCoord;\n\
		varying vec4 vFrame;\n\
		varying float vTextureId;\n\
		varying float vFade;\n\
		uniform vec4 shadowColor;\n\
		uniform sampler2D uSamplers[%count%];\n\
		uniform vec2 uSamplerSize[%count%];\n\
		\n\
		void main(void){\n\
			vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);\n\
			float textureId = floor(vTextureId + 0.5);\n\
			\n\
			vec4 color;\n\
			%forloop%\n\
			if (color.a < 0.01)\n\
			{\n\
				discard;\n\
			}\n\
			vec3 white = vec3(color.a, color.a, color.a);\n\
			gl_FragColor = vec4(mix(color.rgb, white, vFade), color.a);\n\
		}";
	__extends(Shader, _super);
	FLOAT_SIZE = 4;
	function Shader(gl, maxTextures)
	{
		var _this = _super.call(this, gl, maxTextures, RECT_SHADER_VERTEX, PIXI.tilemap.shaderGenerator.generateFragmentSrc(maxTextures, RECT_SHADER_FRAGMENT)) || this;
		_this.vertSize = 11;
		_this.vertPerQuad = 4;
		_this.stride = _this.vertSize * FLOAT_SIZE;
		PIXI.tilemap.shaderGenerator.fillSamplers(_this, _this.maxTextures);
		return _this;
	}
	Shader.prototype.createVao = function(renderer, vb)
	{
		var gl = renderer.gl;
		this.uniforms.mode7ProjectionMatrix = $gameMap.ultraMode7ProjectionMatrix.data;
		this.uniforms.mode7ModelviewMatrix = $gameMap.ultraMode7ModelviewMatrix.data;
		return renderer.createVao()
			.addIndex(this.indexBuffer)
			.addAttribute(vb, this.attributes.aVertexPosition, gl.FLOAT, false, this.stride, 0)
			.addAttribute(vb, this.attributes.aTextureCoord, gl.FLOAT, false, this.stride, 2 * FLOAT_SIZE)
			.addAttribute(vb, this.attributes.aFrame, gl.FLOAT, false, this.stride, 4 * FLOAT_SIZE)
			.addAttribute(vb, this.attributes.aAnim, gl.FLOAT, false, this.stride, 8 * FLOAT_SIZE)
			.addAttribute(vb, this.attributes.aTextureId, gl.FLOAT, false, this.stride, 10 * FLOAT_SIZE)
	};
	return Shader;
}(PIXI.tilemap.TilemapShader));

//=============================================================================
// PIXI.tilemap.TileRenderer
//=============================================================================

if (UltraMode7.TILEMAP_PIXELATED)
{
	PIXI.tilemap.TileRenderer.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
}
else
{
	PIXI.tilemap.TileRenderer.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
}

var UltraMode7_PIXI_tilemap_TileRenderer_prototype_onContextChange = PIXI.tilemap.TileRenderer.prototype.onContextChange;
PIXI.tilemap.TileRenderer.prototype.onContextChange = function()
{
	UltraMode7_PIXI_tilemap_TileRenderer_prototype_onContextChange.call(this);
	this._ultraMode7Shader = new UltraMode7.Shader(this.renderer.gl, this.maxTextures);
	this._ultraMode7Shader.indexBuffer = this.indexBuffer;
};

var UltraMode7_PIXI_tilemap_TileRenderer_prototype_destroy = PIXI.tilemap.TileRenderer.prototype.destroy;
PIXI.tilemap.TileRenderer.prototype.destroy = function()
{
	UltraMode7_PIXI_tilemap_TileRenderer_prototype_destroy.call(this);
	this._ultraMode7Shader.destroy();
	this._ultraMode7Shader = null;
};

var UltraMode7_PIXI_tilemap_TileRenderer_prototype_getShader = PIXI.tilemap.TileRenderer.prototype.getShader;
PIXI.tilemap.TileRenderer.prototype.getShader = function(useSquare)
{
	if (!$gameMap.useUltraMode7)
	{
		return UltraMode7_PIXI_tilemap_TileRenderer_prototype_getShader.call(this, useSquare);
	}
	return this._ultraMode7Shader;
};

// this fixes a bug in PIXI regarding an incorrectly named variable
var UltraMode7_PIXI_tilemap_TileRenderer_prototype_getVb = PIXI.tilemap.TileRenderer.prototype.getVb;
PIXI.tilemap.TileRenderer.prototype.getVb = function(id)
{
	var vb = UltraMode7_PIXI_tilemap_TileRenderer_prototype_getVb.call(this, id);
	if (vb && vb.lastAccessTime)
	{
		vb.lastTimeAccess = vb.lastAccessTime;
		delete vb.lastAccessTime;
	}
	return vb;
};

//=============================================================================
// PIXI.tilemap.RectTileLayer
//=============================================================================

var UltraMode7_PIXI_tilemap_RectTileLayer_prototype_renderWebGL = PIXI.tilemap.RectTileLayer.prototype.renderWebGL;
PIXI.tilemap.RectTileLayer.prototype.renderWebGL = function(renderer, useSquare)
{
	if (!$gameMap || !$gameMap.useUltraMode7)
	{
		UltraMode7_PIXI_tilemap_RectTileLayer_prototype_renderWebGL.call(this, renderer, useSquare);
		return;
	}
	var points = this.pointsBuf;
	if (points.length === 0)
	{
		return;
	}
	var tile = renderer.plugins.tilemap;
	var shader = tile.getShader(useSquare);
	var textures = this.textures;
	if (textures.length === 0)
	{
		return;
	}
	var rectsCount = points.length / 9;
	if (rectsCount === 0)
	{
		return;
	}
	var gl = renderer.gl;
	var length = textures.length;
	for (var i = 0; i < length; ++i)
	{
		if (!textures[i] || !textures[i].valid)
		{
			return;
		}
		var texture = textures[i].baseTexture;
	}
	if (!this.vbIds)
	{
		this.vbIds = [];
		this.vbBuffers = [];
		this.modificationMarkers = [];
		this.vbArrays = [];
	}
	tile.checkIndexBuffer(rectsCount);
	tile.bindTextures(renderer, shader, textures);
	shader.uniforms.mode7ProjectionMatrix = $gameMap.ultraMode7ProjectionMatrix.data;
	shader.uniforms.mode7ModelviewMatrix = $gameMap.ultraMode7ModelviewMatrix.data;
	var maxRects = UltraMode7.WEBGL_MAX_VERTICES / shader.vertPerQuad;
	var maxLoops = Math.floor((rectsCount + maxRects - 1) / maxRects);
	for (var j = 0; j < maxLoops; ++j)
	{
		if (!this.vbIds[j])
		{
			this.vbIds[j] = 0;
			this.vbBuffers[j] = null;
			this.modificationMarkers[j] = 0;
			this.vbArrays[j] = null;
		}
		var currentRectsCount = Math.min(maxRects, rectsCount - j * maxRects);
		var vb = tile.getVb(this.vbIds[j]);
		if (!vb)
		{
			vb = tile.createVb(useSquare);
			this.vbIds[j] = vb.id;
			this.vbBuffers[j] = null;
			this.modificationMarkers[j] = 0;
			this.vbArrays[j] = null;
		}
		var vao = vb.vao;
		renderer.bindVao(vao);
		var vertexBuf = vb.vb;
		vertexBuf.bind();
		var currentVertices = currentRectsCount * shader.vertPerQuad;
		if (this.modificationMarkers[j] !== currentVertices)
		{
			this.modificationMarkers[j] = currentVertices;
			var vs = shader.stride * currentVertices;
			if (!this.vbBuffers[j] || this.vbBuffers[j].byteLength < vs)
			{
				var bk = shader.stride;
				while (bk < vs)
				{
					bk *= 2;
				}
				this.vbBuffers[j] = new ArrayBuffer(bk);
				this.vbArrays[j] = new Float32Array(this.vbBuffers[j]);
				vertexBuf.upload(this.vbBuffers[j], 0, true);
			}
			var arr = this.vbArrays[j];
			var sz = 0;
			var eps = 0.5;
			for (i = j * maxRects * 9; i < points.length && i < (j + 1) * maxRects * 9; i += 9)
			{
				var x = points[i + 2];
				var y = points[i + 3];
				var w = points[i + 4];
				var h = points[i + 5];
				var u = points[i] + 1024 * (points[i + 8] & 1);
				var v = points[i + 1] + 1024 * ((points[i + 8] >> 1) & 1);
				var animX = points[i + 6];
				var animY = points[i + 7];
				var textureId = (points[i + 8] >> 2);
				arr[sz++] = x;
				arr[sz++] = y;
				arr[sz++] = u;
				arr[sz++] = v;
				arr[sz++] = u + eps;
				arr[sz++] = v + eps;
				arr[sz++] = u + w - eps;
				arr[sz++] = v + h - eps;
				arr[sz++] = animX;
				arr[sz++] = animY;
				arr[sz++] = textureId;
				arr[sz++] = x + w;
				arr[sz++] = y;
				arr[sz++] = u + w;
				arr[sz++] = v;
				arr[sz++] = u + eps;
				arr[sz++] = v + eps;
				arr[sz++] = u + w - eps;
				arr[sz++] = v + h - eps;
				arr[sz++] = animX;
				arr[sz++] = animY;
				arr[sz++] = textureId;
				arr[sz++] = x + w;
				arr[sz++] = y + h;
				arr[sz++] = u + w;
				arr[sz++] = v + h;
				arr[sz++] = u + eps;
				arr[sz++] = v + eps;
				arr[sz++] = u + w - eps;
				arr[sz++] = v + h - eps;
				arr[sz++] = animX;
				arr[sz++] = animY;
				arr[sz++] = textureId;
				arr[sz++] = x;
				arr[sz++] = y + h;
				arr[sz++] = u;
				arr[sz++] = v + h;
				arr[sz++] = u + eps;
				arr[sz++] = v + eps;
				arr[sz++] = u + w - eps;
				arr[sz++] = v + h - eps;
				arr[sz++] = animX;
				arr[sz++] = animY;
				arr[sz++] = textureId;
			}
			vertexBuf.upload(arr, 0, true);
		}
		gl.drawElements(gl.TRIANGLES, currentRectsCount * 6, gl.UNSIGNED_SHORT, 0);
	}
};

//=============================================================================
// Tilemap
//=============================================================================

var UltraMode7_Tilemap_prototype_initialize = Tilemap.prototype.initialize;
Tilemap.prototype.initialize = function()
{
	if (!$gameMap.useUltraMode7)
	{
		UltraMode7_Tilemap_prototype_initialize.call(this);
		return;
	}
	PIXI.Container.call(this);
	this._margin = 0;
	this._width = $gameMap.width() * $gameMap.tileWidth();
	this._height = $gameMap.height() * $gameMap.tileHeight();
	this._tileWidth = 48;
	this._tileHeight = 48;
	this._mapWidth = 0;
	this._mapHeight = 0;
	this._mapData = null;
	this._layerWidth = 0;
	this._layerHeight = 0;
	this._lastTiles = [];
	this.bitmaps = [];
	this.origin = new Point();
	this.flags = [];
	this.animationCount = 0;
	this.horizontalWrap = false;
	this.verticalWrap = false;
	this._createLayers();
	this.refresh();
};

//=============================================================================
// ShaderTilemap
//=============================================================================

var UltraMode7_ShaderTilemap_prototype_updateTransform = ShaderTilemap.prototype.updateTransform;
ShaderTilemap.prototype.updateTransform = function()
{
	if (!$gameMap.useUltraMode7)
	{
		UltraMode7_ShaderTilemap_prototype_updateTransform.call(this);
		return;
	}
	var marginX = 0;
	var marginY = 0;
	if ($gameMap.isLoopHorizontal())
	{
		marginX = ($gameMap.ultraMode7LoopMapsExtendX + UltraMode7.LOOP_MAPS_EXTEND_TILES) * this._tileWidth - Graphics.boxWidth / 2;
	}
	if ($gameMap.isLoopVertical())
	{
		marginY = ($gameMap.ultraMode7LoopMapsExtendY + UltraMode7.LOOP_MAPS_EXTEND_TILES) * this._tileHeight - Graphics.boxHeight / 2;
	}
	var startX = Math.floor(-marginX / this._tileWidth);
	var startY = Math.floor(-marginY / this._tileHeight);
	if (this._needsRepaint || this._lastStartX !== startX || this._lastStartY !== startY)
	{
		this._lastStartX = startX;
		this._lastStartY = startY;
		this._paintAllTiles(startX, startY);
		this._needsRepaint = false;
	}
	this._sortChildren();
	PIXI.Container.prototype.updateTransform.call(this);
};

var UltraMode7_ShaderTilemap_prototype__createLayers = ShaderTilemap.prototype._createLayers;
ShaderTilemap.prototype._createLayers = function()
{
	if (!$gameMap.useUltraMode7)
	{
		UltraMode7_ShaderTilemap_prototype__createLayers.call(this);
		return;
	}
	// width/height forcing is needed, because some scripts manipulate the width and height values of the tilemap
	this._width = $gameMap.width() * $gameMap.tileWidth();
	this._height = $gameMap.height() * $gameMap.tileHeight();
	if ($gameMap.isLoopHorizontal())
	{
		this._width += Graphics.boxWidth;
	}
	if ($gameMap.isLoopVertical())
	{
		this._height += Graphics.boxHeight;
	}
	var width = this._width;
	var height = this._height;
	var margin = this._margin;
	var tileCols = Math.ceil(width / this._tileWidth) + 1;
	var tileRows = Math.ceil(height / this._tileHeight) + 1;
	this._layerWidth = tileCols * this._tileWidth;
	this._layerHeight = tileRows * this._tileHeight;
	this._needsRepaint = true;
	if (!this.lowerZLayer)
	{
		this.lowerZLayer = new PIXI.tilemap.ZLayer(this, 0);
		this.upperZLayer = new PIXI.tilemap.ZLayer(this, 0);
		this.addChild(this.lowerZLayer);
		this.addChild(this.upperZLayer);
		var parameters = PluginManager.parameters('ShaderTilemap');
		var useSquareShader = Number(parameters.hasOwnProperty('squareShader') ? parameters['squareShader'] : 0);
		this.lowerLayer = new PIXI.tilemap.CompositeRectTileLayer(0, [], useSquareShader);
		this.lowerLayer.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
		this.lowerZLayer.addChild(this.lowerLayer);
		this.upperLayer = new PIXI.tilemap.CompositeRectTileLayer(0, [], useSquareShader);
		this.upperZLayer.addChild(this.upperLayer);
	}
};

var UltraMode7_ShaderTilemap_prototype__paintAllTiles = ShaderTilemap.prototype._paintAllTiles;
ShaderTilemap.prototype._paintAllTiles = function(startX, startY)
{
	if (!$gameMap.useUltraMode7)
	{
		UltraMode7_ShaderTilemap_prototype__paintAllTiles.call(this, startX, startY);
		return;
	}
	this.lowerZLayer.clear();
	this.upperZLayer.clear();
	var tileCols = Math.ceil(this._width / this._tileWidth);
	var tileRows = Math.ceil(this._height / this._tileHeight);
	for (var y = startY; y < tileRows - startY; ++y)
	{
		for (var x = startX; x < tileCols - startX; ++x)
		{
			this._paintTiles(0, 0, x, y);
		}
	}
};

//=============================================================================
// Game_CharacterBase
//=============================================================================

var UltraMode7_Game_CharacterBase_prototype_screenX = Game_CharacterBase.prototype.screenX;
Game_CharacterBase.prototype.screenX = function()
{
	var x = UltraMode7_Game_CharacterBase_prototype_screenX.call(this);
	if (!$gameMap.useUltraMode7)
	{
		return x;
	}
	var y = UltraMode7_Game_CharacterBase_prototype_screenY.call(this) + this.shiftY();
	return UltraMode7.mapToScreen(x, y).x;
};

var UltraMode7_Game_CharacterBase_prototype_screenY = Game_CharacterBase.prototype.screenY;
Game_CharacterBase.prototype.screenY = function()
{
	var y = UltraMode7_Game_CharacterBase_prototype_screenY.call(this);
	if (!$gameMap.useUltraMode7)
	{
		return y;
	}
	y += this.shiftY();
	var x = UltraMode7_Game_CharacterBase_prototype_screenX.call(this);
	return UltraMode7.mapToScreen(x, y).y;
};

Game_CharacterBase.prototype.screenScale = function()
{
	if (!$gameMap.useUltraMode7)
	{
		return 1.0;
	}
	var x = UltraMode7_Game_CharacterBase_prototype_screenX.call(this);
	var y = UltraMode7_Game_CharacterBase_prototype_screenY.call(this) + this.shiftY();
	return UltraMode7.mapToScreenScale(x, y);
};

Game_CharacterBase.prototype.isUltraMode7Visible = function(z)
{
	if (!$gameMap.useUltraMode7)
	{
		return true;
	}
	if ($gameMap.ultraMode7Fov <= 0)
	{
		return true;
	}
	if (!z)
	{
		var x = UltraMode7_Game_CharacterBase_prototype_screenX.call(this);
		var y = UltraMode7_Game_CharacterBase_prototype_screenY.call(this) + this.shiftY();
		z = UltraMode7.mapToScreen(x, y).z;
	}
	return (z > UltraMode7.NEAR_CLIP_Z && z < UltraMode7.FAR_CLIP_Z);
};

//=============================================================================
// Game_Player
//=============================================================================

var UltraMode7_Game_Player_prototype_getInputDirection = Game_Player.prototype.getInputDirection;
Game_Player.prototype.getInputDirection = function()
{
	var result = UltraMode7_Game_Player_prototype_getInputDirection.call(this);
	if ($gameMap.useUltraMode7 && result > 0 && UltraMode7.PLAYER_ADJUST_MOVE_DIRECTION)
	{
		result = UltraMode7.rotateDirection(result, false);
	}
	return result;
};

//=============================================================================
// Game_Vehicle
//=============================================================================

Game_Vehicle.prototype.scrolledX = function()
{
	if (!$gameMap.useUltraMode7 || !$gameMap.isLoopHorizontal())
	{
		return Game_Character.prototype.scrolledX.call(this);
	}
	return $gameMap.adjustUltraMode7X(this._realX);
};

Game_Vehicle.prototype.scrolledY = function()
{
	if (!$gameMap.useUltraMode7 || !$gameMap.isLoopVertical())
	{
		return Game_Character.prototype.scrolledY.call(this);
	}
	return $gameMap.adjustUltraMode7Y(this._realY);
};

//=============================================================================
// Game_Event
//=============================================================================

Game_Event.prototype.scrolledX = function()
{
	if (!$gameMap.useUltraMode7 || !$gameMap.isLoopHorizontal())
	{
		return Game_Character.prototype.scrolledX.call(this);
	}
	return $gameMap.adjustUltraMode7X(this._realX);
};

Game_Event.prototype.scrolledY = function()
{
	if (!$gameMap.useUltraMode7 || !$gameMap.isLoopVertical())
	{
		return Game_Character.prototype.scrolledY.call(this);
	}
	return $gameMap.adjustUltraMode7Y(this._realY);
};

//=============================================================================
// Game_Map
//=============================================================================

Object.defineProperties(Game_Map.prototype,
{
	useUltraMode7: { get: function() { return this._useUltraMode7; }, configurable: true },
	ultraMode7Fov: { get: function() { return this._ultraMode7Fov; }, configurable: true },
	ultraMode7Pitch: { get: function() { return this._ultraMode7Pitch; }, configurable: true },
	ultraMode7Yaw: { get: function() { return this._ultraMode7Yaw; }, configurable: true },
	ultraMode7CameraDistance: { get: function() { return this._ultraMode7CameraDistance; }, configurable: true },
	ultraMode7ParallaxDistance: { get: function() { return this._ultraMode7ParallaxDistance; }, configurable: true },
	ultraMode7LoopMapsExtendX: { get: function() { return this._ultraMode7LoopMapsExtendX; }, configurable: true },
	ultraMode7LoopMapsExtendY: { get: function() { return this._ultraMode7LoopMapsExtendY; }, configurable: true },
	ultraMode7ProjectionMatrix: { get: function() { return this._ultraMode7ProjectionMatrix; }, configurable: true },
	ultraMode7ModelviewMatrix: { get: function() { return this._ultraMode7ModelviewMatrix; }, configurable: true }
});

var UltraMode7_Game_Map_prototype_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function()
{
	UltraMode7_Game_Map_prototype_initialize.call(this);
	this.initUltraMode7();
};

var UltraMode7_Game_Map_prototype_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId)
{
	UltraMode7_Game_Map_prototype_setup.call(this, mapId);
	this.setupUltraMode7();
};

Game_Map.prototype.initUltraMode7 = function()
{
	this._useUltraMode7 = false;
	this._ultraMode7Pitch = 0;
	this._ultraMode7Yaw = 0;
	this._ultraMode7CameraDistance = UltraMode7.DEFAULT_CAMERA_DISTANCE;
	this._ultraMode7ParallaxDistance = UltraMode7.DEFAULT_PARALLAX_DISTANCE;
	this._ultraMode7LoopMapsExtendX = 0;
	this._ultraMode7LoopMapsExtendY = 0;
	this._ultraMode7ProjectionMatrix = new Matrix4();
	this._ultraMode7ModelviewMatrix = new Matrix4();
	var eye = new Vector3(0, 0, this._ultraMode7CameraDistance);
	var target = new Vector3(0, 0, 0);
	var up = new Vector3(0, 1, 0);
	this._ultraMode7ModelviewMatrix.lookAt(eye, target, up);
};

Game_Map.prototype.setupUltraMode7 = function()
{
	this.initUltraMode7();
	if (!$dataMap)
	{
		throw new Error("The map data is not available");
	}
	if ($dataMap.meta && ($dataMap.meta.UltraMode7 || $dataMap.meta.UltraMode7_FOV || $dataMap.meta.UltraMode7_Pitch ||
		$dataMap.meta.UltraMode7_Yaw || $dataMap.meta.UltraMode7_CameraDistance || $dataMap.meta.UltraMode7_ParallaxDistance))
	{
		this._useUltraMode7 = true;
		this._ultraMode7Fov = Math.max(BlizzardUtility.Numeric($dataMap.meta.UltraMode7_FOV, UltraMode7.DEFAULT_FOV), UltraMode7.MIN_FOV);
		this._ultraMode7Pitch = BlizzardUtility.Numeric($dataMap.meta.UltraMode7_Pitch, UltraMode7.DEFAULT_PITCH).clamp(UltraMode7.MIN_PITCH, UltraMode7.MAX_PITCH);
		this._ultraMode7Yaw = BlizzardUtility.Numeric($dataMap.meta.UltraMode7_Yaw, UltraMode7.DEFAULT_YAW);
		this._ultraMode7CameraDistance = Math.max(BlizzardUtility.Numeric($dataMap.meta.UltraMode7_CameraDistance, UltraMode7.DEFAULT_CAMERA_DISTANCE), 0);
		this._ultraMode7ParallaxDistance = Math.max(BlizzardUtility.Numeric($dataMap.meta.UltraMode7_ParallaxDistance, UltraMode7.DEFAULT_PARALLAX_DISTANCE), 1);
		this._ultraMode7LoopMapsExtendX = 0;
		this._ultraMode7LoopMapsExtendY = 0;
		this.refreshUltraMode7View();
	}
};

Game_Map.prototype.setUltraMode7Fov = function(value)
{
	if (!this._useUltraMode7)
	{
		return;
	}
	this._ultraMode7Fov = Math.max(value, UltraMode7.MIN_FOV); // more or less arbitrary limit, but there are huge issues with smaller values
	this.refreshUltraMode7View();
};

Game_Map.prototype.setUltraMode7Pitch = function(value)
{
	if (!this._useUltraMode7)
	{
		return;
	}
	this._ultraMode7Pitch = value.clamp(UltraMode7.MIN_PITCH, UltraMode7.MAX_PITCH);
	this.refreshUltraMode7View();
};

Game_Map.prototype.setUltraMode7Yaw = function(value)
{
	if (!this._useUltraMode7)
	{
		return;
	}
	this._ultraMode7Yaw = value;
	this.refreshUltraMode7View();
};

Game_Map.prototype.setUltraMode7CameraDistance = function(value)
{
	if (!this._useUltraMode7)
	{
		return;
	}
	this._ultraMode7CameraDistance = Math.max(value, 0);
	this.refreshUltraMode7View();
};

Game_Map.prototype.setUltraMode7ParallaxDistance = function(value)
{
	if (!this._useUltraMode7)
	{
		return;
	}
	this._ultraMode7ParallaxDistance = Math.max(value, 1);
	this.refreshUltraMode7View();
};

Game_Map.prototype.refreshUltraMode7View = function()
{
	if (!this._useUltraMode7)
	{
		return;
	}
	if (this.isLoopHorizontal() || this.isLoopVertical())
	{
		var halfFov = this._ultraMode7Fov * Math.PI / 180;
		var sideVector = UltraMode7.FAR_CLIP_Z / Math.cos(halfFov);
		var maxVector = Math.abs(sideVector / Math.cos(halfFov * Graphics.boxHeight / Graphics.boxWidth));
		maxVector = maxVector * this._ultraMode7CameraDistance / UltraMode7.FAR_CLIP_Z;
		this._ultraMode7LoopMapsExtendX = Math.ceil(maxVector / this.tileWidth()) + 1; // +1, because the tile coordinate is centered in Mode7
		this._ultraMode7LoopMapsExtendY = Math.ceil(maxVector / this.tileHeight()) + 1; // +1, because the tile coordinate is centered in Mode7
	}
	else
	{
		this._ultraMode7LoopMapsExtendX = 0;
		this._ultraMode7LoopMapsExtendY = 0;
	}
	// setup the matrices
	if (this._ultraMode7Fov > 0)
	{
		this._ultraMode7ProjectionMatrix.setPerspective(this._ultraMode7Fov, Graphics.boxWidth, Graphics.boxHeight, UltraMode7.NEAR_CLIP_Z, UltraMode7.FAR_CLIP_Z);
	}
	else
	{
		this._ultraMode7ProjectionMatrix.setOrthoProjection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
	}
	var eye = new Vector3(0, 0, this._ultraMode7CameraDistance);
	var target = new Vector3(0, 0, 0);
	var up = new Vector3(0, 1, 0);
	this._ultraMode7ModelviewMatrix.lookAt(eye, target, up);
	this._ultraMode7ModelviewMatrix.translate($gameScreen.shake(), 0, 0);
	this._ultraMode7ModelviewMatrix.rotateX(this._ultraMode7Pitch);
	this._ultraMode7ModelviewMatrix.rotateZ(this._ultraMode7Yaw);
	this._ultraMode7ModelviewMatrix.translate(-Graphics.boxWidth / 2 - this.displayX() * this.tileWidth(), -Graphics.boxHeight / 2 - (this.displayY() + 0.5) * this.tileHeight(), 0);
};

Game_Map.prototype.adjustUltraMode7X = function(x)
{
	var centerX = this.width() / 2;
	var displayCenterX = centerX - this.screenTileX() / 2;
	if (x >= centerX)
	{
		if (this._displayX < displayCenterX)
		{
			return (x - this._displayX - $dataMap.width);
		}
	}
	else if (this._displayX >= displayCenterX)
	{
		return (x - this._displayX + $dataMap.width);
	}
	return (x - this._displayX);
};

Game_Map.prototype.adjustUltraMode7Y = function(y)
{
	var centerY = this.height() / 2;
	var displayCenterY = centerY - this.screenTileY() / 2;
	if (y >= centerY)
	{
		if (this._displayY < displayCenterY)
		{
			return (y - this._displayY - $dataMap.height);
		}
	}
	else if (this._displayY >= displayCenterY)
	{
		return (y - this._displayY + $dataMap.height);
	}
	return (y - this._displayY);
};

var UltraMode7_Game_Map_prototype_parallaxOx = Game_Map.prototype.parallaxOx;
Game_Map.prototype.parallaxOx = function()
{
	if (!this._useUltraMode7)
	{
		return UltraMode7_Game_Map_prototype_parallaxOx.call(this);
	}
	var offset = -2 * UltraMode7.DEFAULT_PARALLAX_DISTANCE * Math.PI * this._ultraMode7Yaw / 360;
	if (this._parallaxZero)
	{
		return (this._parallaxX * UltraMode7.PARALLAX_SCROLL_X_MULTIPLIER * this.tileWidth() + offset);
	}
	if (this._parallaxLoopX)
	{
		return (this._parallaxX * UltraMode7.PARALLAX_SCROLL_X_MULTIPLIER * this.tileWidth() / 2 + offset);
	}
	return offset;
};

var UltraMode7_Game_Map_prototype_parallaxOy = Game_Map.prototype.parallaxOy;
Game_Map.prototype.parallaxOy = function()
{
	if (!this._useUltraMode7)
	{
		return UltraMode7_Game_Map_prototype_parallaxOy.call(this);
	}
	var offset = -2 * UltraMode7.DEFAULT_PARALLAX_DISTANCE * Math.PI * this._ultraMode7Pitch / 360;
	if (this._parallaxZero)
	{
		return (this._parallaxY * UltraMode7.PARALLAX_SCROLL_Y_MULTIPLIER * this.tileHeight() + offset);
	}
	if (this._parallaxLoopY)
	{
		return (this._parallaxY * UltraMode7.PARALLAX_SCROLL_Y_MULTIPLIER * this.tileHeight() / 2 + offset);
	}
	return offset;
};

var UltraMode7_Game_Map_prototype_setDisplayPos = Game_Map.prototype.setDisplayPos;
Game_Map.prototype.setDisplayPos = function(x, y)
{
	if (!this._useUltraMode7)
	{
		UltraMode7_Game_Map_prototype_setDisplayPos.call(this, x, y);
		return;
	}
	if (this.isLoopHorizontal())
	{
		this._displayX = x.mod(this.width());
		this._parallaxX = x;
	}
	else
	{
		var screenTileX = this.screenTileX();
		var endX = this.width() - screenTileX;
		this._displayX = x;
		this._parallaxX = this._displayX;
	}
	if (this.isLoopVertical())
	{
		this._displayY = y.mod(this.height());
		this._parallaxY = y;
	}
	else
	{
		var endY = this.height() - this.screenTileY();
		this._displayY = y;
		this._parallaxY = this._displayY;
	}
	this.refreshUltraMode7View();
};

var UltraMode7_Game_Map_prototype_scrollDown = Game_Map.prototype.scrollDown;
Game_Map.prototype.scrollDown = function(distance)
{
	if (!this._useUltraMode7)
	{
		UltraMode7_Game_Map_prototype_scrollDown.call(this, distance);
		return;
	}
	if (this.isLoopVertical())
	{
		this._displayY = (this._displayY + distance) % $dataMap.height;
		if (this._parallaxLoopY)
		{
			this._parallaxY += distance;
		}
	}
	else
	{
		this._displayY += distance;
		this._parallaxY += distance;
	}
	this.refreshUltraMode7View();
};

var UltraMode7_Game_Map_prototype_scrollLeft = Game_Map.prototype.scrollLeft;
Game_Map.prototype.scrollLeft = function(distance)
{
	if (!this._useUltraMode7)
	{
		UltraMode7_Game_Map_prototype_scrollLeft.call(this, distance);
		return;
	}
	if (this.isLoopHorizontal())
	{
		this._displayX = (this._displayX + $dataMap.width - distance) % $dataMap.width;
		if (this._parallaxLoopX)
		{
			this._parallaxX -= distance;
		}
	}
	else
	{
		this._displayX -= distance;
		this._parallaxX -= distance;
	}
	this.refreshUltraMode7View();
};

var UltraMode7_Game_Map_prototype_scrollRight = Game_Map.prototype.scrollRight;
Game_Map.prototype.scrollRight = function(distance)
{
	if (!this._useUltraMode7)
	{
		UltraMode7_Game_Map_prototype_scrollRight.call(this, distance);
		return;
	}
	if (this.isLoopHorizontal())
	{
		this._displayX = (this._displayX + distance) % $dataMap.width;
		if (this._parallaxLoopX)
		{
			this._parallaxX += distance;
		}
	}
	else
	{
		this._displayX += distance;
		this._parallaxX += distance;
	}
	this.refreshUltraMode7View();
};

var UltraMode7_Game_Map_prototype_scrollUp = Game_Map.prototype.scrollUp;
Game_Map.prototype.scrollUp = function(distance)
{
	if (!this._useUltraMode7)
	{
		UltraMode7_Game_Map_prototype_scrollUp.call(this, distance);
		return;
	}
	if (this.isLoopVertical())
	{
		this._displayY = (this._displayY + $dataMap.height - distance) % $dataMap.height;
		if (this._parallaxLoopY)
		{
			this._parallaxY -= distance;
		}
	}
	else
	{
		this._displayY -= distance;
		this._parallaxY -= distance;
	}
	this.refreshUltraMode7View();
};

var UltraMode7_Game_Map_prototype_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive)
{
	UltraMode7_Game_Map_prototype_update.call(this, sceneActive);
	if (this._useUltraMode7)
	{
		this.updateUltraMode7();
	}
};

Game_Map.prototype.updateUltraMode7 = function()
{
	var needRefresh = false;
	var shake = $gameScreen.shake();
	if (this._ultraMode7Shake != shake)
	{
		this._ultraMode7Shake = shake
		needRefresh = true;
	}
	if (this._ultraMode7FovDuration > 0)
	{
		var duration = this._ultraMode7FovDuration;
		this._ultraMode7Fov = Math.max((this._ultraMode7Fov * (duration - 1) + this._ultraMode7FovTarget) / duration, UltraMode7.MIN_FOV);
		--this._ultraMode7FovDuration;
		needRefresh = true;
	}
	if (this._ultraMode7PitchDuration > 0)
	{
		var duration = this._ultraMode7PitchDuration;
		this._ultraMode7Pitch = ((this._ultraMode7Pitch * (duration - 1) + this._ultraMode7PitchTarget) / duration).clamp(UltraMode7.MIN_PITCH, UltraMode7.MAX_PITCH);
		--this._ultraMode7PitchDuration;
		needRefresh = true;
	}
	if (this._ultraMode7YawDuration > 0)
	{
		var duration = this._ultraMode7YawDuration;
		this._ultraMode7Yaw = (this._ultraMode7Yaw * (duration - 1) + this._ultraMode7YawTarget) / duration;
		--this._ultraMode7YawDuration;
		needRefresh = true;
	}
	if (this._ultraMode7CameraDistanceDuration > 0)
	{
		var duration = this._ultraMode7CameraDistanceDuration;
		this._ultraMode7CameraDistance = Math.max((this._ultraMode7CameraDistance * (duration - 1) + this._ultraMode7CameraDistanceTarget) / duration, 0);
		--this._ultraMode7CameraDistanceDuration;
		needRefresh = true;
	}
	if (needRefresh)
	{
		this.refreshUltraMode7View();
	}
};

Game_Map.prototype.animateUltraMode7Fov = function(target, frameDuration)
{
	this._ultraMode7FovTarget = target;
	this._ultraMode7FovDuration = frameDuration;
};

Game_Map.prototype.animateUltraMode7Pitch = function(target, frameDuration)
{
	this._ultraMode7PitchTarget = target;
	this._ultraMode7PitchDuration = frameDuration;
};

Game_Map.prototype.animateUltraMode7Yaw = function(target, frameDuration)
{
	this._ultraMode7YawTarget = target;
	this._ultraMode7YawDuration = frameDuration;
};

Game_Map.prototype.animateUltraMode7CameraDistance = function(target, frameDuration)
{
	this._ultraMode7CameraDistanceTarget = target;
	this._ultraMode7CameraDistanceDuration = frameDuration;
};

//=============================================================================
// Sprite_Character
//=============================================================================

var UltraMode7_Sprite_Character_prototype_updateBitmap = Sprite_Character.prototype.updateBitmap;
Sprite_Character.prototype.updateBitmap = function()
{
	var imageChanged = this.isImageChanged();
	UltraMode7_Sprite_Character_prototype_updateBitmap.call(this);
	if ($gameMap.useUltraMode7 && imageChanged && this.bitmap)
	{
		this.bitmap.smooth = !UltraMode7.CHARACTERS_PIXELATED;
	}
};

var UltraMode7_Sprite_Character_prototype_characterPatternY = Sprite_Character.prototype.characterPatternY;
Sprite_Character.prototype.characterPatternY = function()
{
	if (!$gameMap.useUltraMode7 || !UltraMode7.CHARACTERS_ADJUST_SPRITE_DIRECTION)
	{
		return UltraMode7_Sprite_Character_prototype_characterPatternY.call(this);
	}
	return (UltraMode7.rotateDirection(this._character.direction(), true) - 2) / 2;
};

var UltraMode7_Sprite_Character_prototype_updatePosition = Sprite_Character.prototype.updatePosition;
Sprite_Character.prototype.updatePosition = function()
{
	UltraMode7_Sprite_Character_prototype_updatePosition.call(this);
	if (!$gameMap.useUltraMode7)
	{
		return;
	}
	var scale = this._character.screenScale();
	this.scale.x = scale;
	this.scale.y = scale;
};

//=============================================================================
// Sprite_Character
//=============================================================================

var UltraMode7_Sprite_Character_prototype_updateVisibility = Sprite_Character.prototype.updateVisibility;
Sprite_Character.prototype.updateVisibility = function()
{
	UltraMode7_Sprite_Character_prototype_updateVisibility.call(this);
	if (!$gameMap.useUltraMode7)
	{
		return;
	}
	if (!this._character.isUltraMode7Visible())
	{
		this.visible = false;
	}
};

//=============================================================================
// Sprite_Destination
//=============================================================================

var UltraMode7_Sprite_Destination_prototype_updatePosition = Sprite_Destination.prototype.updatePosition;
Sprite_Destination.prototype.updatePosition = function()
{
	UltraMode7_Sprite_Destination_prototype_updatePosition.call(this);
	if (!$gameMap.useUltraMode7)
	{
		return;
	}
	var position = UltraMode7.mapToScreen(this.x, this.y);
	this.x = position.x;
	this.y = position.y;
};

//=============================================================================
// Scene_Map
//=============================================================================

var UltraMode7_Scene_Map_prototype_processMapTouch = Scene_Map.prototype.processMapTouch;
Scene_Map.prototype.processMapTouch = function()
{
	if (!$gameMap.useUltraMode7)
	{
		UltraMode7_Scene_Map_prototype_processMapTouch.call(this);
		return;
	}
	if (TouchInput.isTriggered() || this._touchCount > 0)
	{
		if (TouchInput.isPressed())
		{
			if (this._touchCount === 0 || this._touchCount >= 15)
			{
				var position = UltraMode7.screenToMap(TouchInput.x, TouchInput.y);
				$gameTemp.setDestination(Math.floor(position.x / $gameMap.tileWidth()), Math.floor(position.y / $gameMap.tileHeight()));
			}
			this._touchCount++;
		}
		else
		{
			this._touchCount = 0;
		}
	}
};

//=============================================================================
// KhasUltraLighting compatibility
//=============================================================================

if (Khas && Khas.Graphics && Khas.Graphics.version >= 1.1 && Khas.Lighting && Khas.Lighting.version >= 4.2)
{
	//=============================================================================
	// Game_CharacterBase
	//=============================================================================

	Game_CharacterBase.prototype.lightScreenUltraMode7X = function()
	{
		return Math.round((this.scrolledX() + 0.5) * $gameMap.tileWidth() + $gameScreen.shake());
	};

	Game_CharacterBase.prototype.lightScreenUltraMode7Y = function()
	{
		return Math.round((this.scrolledY() + 0.5) * $gameMap.tileHeight());
	};

	var UltraMode7_Game_CharacterBase_prototype_lightScreenX = Game_CharacterBase.prototype.lightScreenX;
	Game_CharacterBase.prototype.lightScreenX = function()
	{
		if (!$gameMap.useUltraMode7)
		{
			return UltraMode7_Game_CharacterBase_prototype_lightScreenX.call(this);
		}
		var x = this.lightScreenUltraMode7X();
		var y = this.lightScreenUltraMode7Y() + $gameMap.tileHeight() / 2;
		return UltraMode7.mapToScreen(x, y).x;
	};

	var UltraMode7_Game_CharacterBase_prototype_lightScreenY = Game_CharacterBase.prototype.lightScreenY;
	Game_CharacterBase.prototype.lightScreenY = function()
	{
		if (!$gameMap.useUltraMode7)
		{
			return UltraMode7_Game_CharacterBase_prototype_lightScreenY.call(this);
		}
		var halfTileHeight = $gameMap.tileHeight() / 2;
		var x = this.lightScreenUltraMode7X();
		var y = this.lightScreenUltraMode7Y() + halfTileHeight;
		return UltraMode7.mapToScreen(x, y).y - halfTileHeight * this.screenScale();
	};

	//=============================================================================
	// Game_LightTile
	//=============================================================================

	Game_LightTile.prototype.scrolledX = function()
	{
		if (!$gameMap.useUltraMode7 || !$gameMap.isLoopHorizontal())
		{
			return $gameMap.adjustX(this._realX);
		}
		return $gameMap.adjustUltraMode7X(this._realX);
	};

	Game_LightTile.prototype.scrolledY = function()
	{
		if (!$gameMap.useUltraMode7 || !$gameMap.isLoopVertical())
		{
			return $gameMap.adjustY(this._realY);
		}
		return $gameMap.adjustUltraMode7Y(this._realY);
	};

	Game_LightTile.prototype.lightScreenUltraMode7X = function()
	{
		return Math.round(this.scrolledX() * $gameMap.tileWidth() + $gameScreen.shake());
	};

	Game_LightTile.prototype.lightScreenUltraMode7Y = function()
	{
		return Math.round(this.scrolledY() * $gameMap.tileHeight());
	};

	Game_LightTile.prototype.screenScale = function()
	{
		if (!$gameMap.useUltraMode7)
		{
			return 1.0;
		}
		var x = this.lightScreenUltraMode7X() + $gameMap.tileWidth() / 2;
		var y = this.lightScreenUltraMode7Y() + $gameMap.tileHeight() / 2;
		return UltraMode7.mapToScreenScale(x, y);
	};

	Game_LightTile.prototype.isUltraMode7Visible = function(z)
	{
		if (!$gameMap.useUltraMode7)
		{
			return true;
		}
		if ($gameMap.ultraMode7Fov <= 0)
		{
			return true;
		}
		if (!z)
		{
			var x = this.lightScreenUltraMode7X() + $gameMap.tileWidth() / 2;
			var y = this.lightScreenUltraMode7Y() + $gameMap.tileHeight() / 2;
			z = UltraMode7.mapToScreen(x, y).z;
		}
		return (z > UltraMode7.NEAR_CLIP_Z && z < UltraMode7.FAR_CLIP_Z);
	};

	var UltraMode7_Game_LightTile_prototype_lightScreenX = Game_LightTile.prototype.lightScreenX;
	Game_LightTile.prototype.lightScreenX = function()
	{
		if (!$gameMap.useUltraMode7)
		{
			return UltraMode7_Game_LightTile_prototype_lightScreenX.call(this);
		}
		var x = this.lightScreenUltraMode7X();
		var y = this.lightScreenUltraMode7Y() + $gameMap.tileHeight() / 2;
		return UltraMode7.mapToScreen(x, y).x;
	};

	var UltraMode7_Game_LightTile_prototype_lightScreenY = Game_LightTile.prototype.lightScreenY;
	Game_LightTile.prototype.lightScreenY = function()
	{
		if (!$gameMap.useUltraMode7)
		{
			return UltraMode7_Game_LightTile_prototype_lightScreenY.call(this);
		}
		var halfTileHeight = $gameMap.tileHeight() / 2;
		var x = this.lightScreenUltraMode7X();
		var y = this.lightScreenUltraMode7Y() + halfTileHeight;
		return UltraMode7.mapToScreen(x, y).y - halfTileHeight * this.screenScale();
	};

	//=============================================================================
	// Sprite_Light
	//=============================================================================

	var UltraMode7_Sprite_Light_prototype_refreshScreenPosition = Sprite_Light.prototype.refreshScreenPosition;
	Sprite_Light.prototype.refreshScreenPosition = function()
	{
		UltraMode7_Sprite_Light_prototype_refreshScreenPosition.call(this);
		if (!$gameMap.useUltraMode7)
		{
			return;
		}
		// some safety guards to ensure compatibility with custom objects
		if (this._character)
		{
			if (this._character.screenScale)
			{
				var scale = this._character.screenScale();
				this.scale.x = scale;
				this.scale.y = scale;
			}
			if (this._character.isUltraMode7Visible)
			{
				this.visible = this._character.isUltraMode7Visible();
			}
		}
	};
	
}

//=============================================================================

})();
