
Game_Character.prototype.shijian_xunlu = function(x,y) {
        direction = this.findDirectionTo(x, y);
        if (direction > 0) {
            this.moveStraight(direction);
}}
