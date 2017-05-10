

/*暂停 界面*/


//获取开始界面
var startdiv = document.getElementById("startdiv");

//获取主界面
var maindiv = document.getElementById("maindiv");

//获取显示分数的标签
var scorelabel = document.getElementById("label");

//获取结束界面
var enddiv = document.getElementById("enddiv");

//显示最终分数的文本
var planscore = document.getElementById("planscore");

//获取暂停页面
var suspenddiv = document.getElementById("suspenddiv");

//定时器对象
var tid;

//记录总分的变量
var scores = 0;

//开始游戏点击按钮的事件
function begin() {
  //console.log("hehe");
  startdiv.style.display = "none";
  maindiv.style.display = "block";

  tid = setInterval(start,20);
}

//重新开始
function again() {
  window.location.reload(true);
}

//保存敌方飞机的数组
var enemys = [];

var time1 = 0;
var time2 = 0;

//保存子弹的数组
var bullets = [];

//背景流动的改变值
var positionY = 0;

//被循环调用的方法
function start() {

  //背景图片的流动
  maindiv.style.backgroundPositionY = positionY + "px";
  positionY += 0.9;
  if(positionY == 568) {
    positionY = 0;
  }

  time1++;
  if(time1 == 20) {
    time2++;
    if(time2 % 5 == 0) {   //创建中型飞机
      enemys.push(new enemy(25,286,46,60,"image/enemy3_fly_1.png",3,6,"image/中飞机爆炸.gif",360,200));
    }

    //大飞机
    if (time2 == 20) {
      enemys.push(new enemy(57,216,110,164,"image/enemy2_fly_1.png",1,12,"image/大飞机爆炸.gif",540,500));
      time2 = 0;
    }

    //小飞机
    else {
      enemys.push(new enemy(10,286,34,24,"image/enemy1_fly_1.png",4,1,"image/小飞机爆炸.gif",360,100));
    }
    time1 = 0;
  }

  //遍历敌方飞机数组
  var enemylen = enemys.length;
  for (var i = 0; i < enemylen; i++) {
    var e = enemys[i];
    if(enemys[i].planisdie != true) {
      e.move();
    }

    //判断飞机是否超出边界,如果超出边界进行销毁
    if(enemys[i].plannode.offsetTop > 568) {
      maindiv.removeChild(enemys[i].plannode);   //删除对应节点
      enemys.splice(i,1);   //删除数组中的对象
      enemylen--;
    }

    //判断飞机是否死亡
    if(enemys[i].planisdie == true) {
      enemys[i].diecount += 20;
      if(enemys[i].diecount == enemys[i].dietime) {
        maindiv.removeChild(enemys[i].plannode);
        enemys.splice(i,1);
        enemylen--;
      }
    }
  }

  //创建子弹
  if(time1%5 == 0) {
    bullets.push(new oddbullet(parseInt(selfplan.plannode.style.left) + 31,parseInt(selfplan.plannode.style.top)-10));
  }

  //移动子弹
  var bulletslen = bullets.length;
  for (var i = 0; i < bulletslen; i++) {
    bullets[i].bulletmove();

    //如果子弹超出屏幕,移除子弹
    if(bullets[i].bulletnode.offsetTop < 0) {  //子弹超出边界
      maindiv.removeChild(bullets[i].bulletnode);
      bullets.splice(i,1);
      bulletslen--;
    }
  }

   //碰撞判断
  for (var k = 0; k < bulletslen; k++) {
    for (var j = 0; j < enemylen; j++) {
      //1.本方飞机与敌方飞机碰撞
      if(enemys[j].planisdie == false) {
        if((enemys[j].plannode.offsetLeft <= selfplan.plannode.offsetLeft + 66) && (enemys[j].plannode.offsetLeft + enemys[j].w >= selfplan.plannode.offsetLeft)) {
          if((enemys[j].plannode.offsetTop <= selfplan.plannode.offsetTop + 80) && (enemys[j].plannode.offsetTop + enemys[j].h >= selfplan.plannode.offsetTop + 40)) {
            //碰撞条件符合,游戏结束
            selfplan.plannode.src = "image/本方飞机爆炸.gif";
            //死亡显示结束界面
            enddiv.style.display = "block";
            //显示总分
            planscore.innerHTML = scores;
            //结束循环事件
            clearInterval(tid);
            //取消鼠标移动事件
            if(document.removeEventListener) {
              maindiv.removeEventListener("mousemove",ourmove,false);
              maindiv.removeEventListener("mousemove",borderline,false);
            }else if(document.detachEvent) {
              document.detachEvent("onmousemove",ourmove);
              document.detachEvent("onmousemove",borderline);
            }
          }
        }
      }

      //2.判断子弹与敌机是否有碰撞
      if((bullets[k].bulletnode.offsetLeft + 6 >= enemys[j].plannode.offsetLeft) && bullets[k].bulletnode.offsetLeft <= enemys[j].plannode.offsetLeft + enemys[j].w) {
        if((bullets[k].bulletnode.offsetTop <= enemys[j].plannode.offsetTop + enemys[j].h) && (bullets[k].bulletnode.offsetTop + 14 >= enemys[j].plannode.offsetTop)) {
          //敌机的血量随着子弹的碰撞减少
          enemys[j].hp -= 1;
          if(enemys[j].hp == 0) {   //飞机死亡
            enemys[j].plannode.src = enemys[j].boomsrc;

            enemys[j].planisdie = true;

            //加分
            scores += enemys[j].score;
            scorelabel.innerHTML = scores;
          }

          //删除子弹
          maindiv.removeChild(bullets[k].bulletnode);
          bullets.splice(k,1);
          bulletslen--;
          break;
        }
      }
    }
  }
}

//–––––––––––––––––––––––––––创建对象––––––––––––––––––––––––––
//创建对象所需要的构造函数
//创建本方飞机和敌方飞机的基本构造函数
function plan(x,y,w,h,imgsrc,speed,hp,boomsrc,dietime,score) {
  this.x = x;
  this.y = y;
  this.imgsrc = imgsrc;
  this.speed = speed;
  this.w = w;
  this.h = h;
  this.hp = hp;
  this.boomsrc = boomsrc;
  this.score = score;

  //记录飞机死亡
  this.planisdie = false;

  //死亡时间
  this.dietime = dietime;
  this.diecount = 0;

  //显示飞机的原理,获取页面,创建图片节点,进行插入
  this.plannode = null;
  //document.createElement("img");
  this.init = function() {
    this.plannode = document.createElement("img");
    this.plannode.style.position = "absolute";
    this.plannode.style.left = this.x + "px";    //注意单位
    this.plannode.style.top = this.y + "px";
    this.plannode.src = this.imgsrc;

    //插入节点
    maindiv.appendChild(this.plannode);
  }
  this.init();

  //行为
  //移动行为
  this.move = function() {
    this.plannode.style.top = this.plannode.offsetTop + this.speed + "px";
  }
}

//创建子弹的基本构造函数
function bullet(x,y,imgsrc) {
  this.x = x;
  this.y = y;
  this.imgsrc = imgsrc;

  this.bulletnode = null;  //子弹节点
  this.init = function() {
    this.bulletnode = document.createElement("img");
    this.bulletnode.style.position = "absolute";
    this.bulletnode.style.left = this.x + "px";    //注意单位
    this.bulletnode.style.top = this.y + "px";
    this.bulletnode.src = this.imgsrc;

    maindiv.appendChild(this.bulletnode);
  }

  this.init();

  //子弹移动
  this.bulletmove = function() {
    this.bulletnode.style.top = this.bulletnode.offsetTop - 20 + "px";
  }
}

//–––––––––––––––––––––––––––––本方飞机––––––––––––––––––––––––––––––––
//创建本方飞机的构造函数
function selfplan(x,y) {
  //f.call(o,a,b);  对象o 调用f,其中a,b 表示是函数 f 的参数
  plan.call(this,x,y,66,80,"image/我的飞机.gif");
  //plan.call(this,x,y,"image/本方飞机爆炸.gif")
}

//创建本方飞机对象
var selfplan = new selfplan(120,485);

//1.本方飞机移动事件
var ourmove = function() {

  //适配不同浏览器
  var oevent = window.event || arguments[0];

  var selfplanX = oevent.clientX - 500;
  var selfplanY = oevent.clientY;

  //66 80
  selfplan.plannode.style.left = selfplanX - 33 + "px";
  selfplan.plannode.style.top = selfplanY - 40 + "px";
}

//2.本方飞机超出边界的事件
var borderline = function() {
  //获取事件触发后的event对象，做了一个兼容性处理。||用来做布尔短路，若浏览器存在window.event对象，
  //e就被指向该对象，否则指向事件处理函数的第一个参数，事件处理函数的第一个参数就是默认为该事件event对象。
  var oevent = window.event || arguments[0];

  var x = oevent.clientX;
  var y = oevent.clientY;

  //(x,y)
  if(x<533 || x > 787 || y < 0 || y > 528) {   //鼠标超出主界面
    if(document.removeEventListener) {
      maindiv.removeEventListener("mousemove",ourmove,true);
    }else if(document.deattachEvent) {
      maindiv.deattachEvent("onmousemove",ourmove);
    }
  }else{  //鼠标回到主界面
    if(document.addEventListener) {
      //为本方飞机进行添加移动事件
      maindiv.addEventListener("mousemove",ourmove,true);
    } else if(document.attachEvent) {
      maindiv.attachEvent("onmousemove",ourmove);
    }
  }
}

//3.暂停事件
var number = 0;
var pause = function() {
  if(number == 0) {    //暂停操作
    suspenddiv.style.display = "block";
    if(document.removeEventListener) {
      maindiv.removeEventListener("mousemove",ourmove,true);
      maindiv.removeEventListener("mousemove",borderline,true);
    }else if(document.detachEvent) {
      maindiv.detachEvent('onmousemove',ourmove);
      maindiv.detachEvent("onmousemove",borderline);
    }
    clearInterval(tid);
    number = 1;
  }else {   //再次进入游戏
    suspenddiv.style.display = "none";
    if (document.addEventListener) {
      maindiv.addEventListener("mousemove",ourmove,true);
      maindiv.addEventListener("mousemove",borderline,true);
    }else if(document.attachEvent) {
      maindiv.attachEvent("onmousemove",ourmove);
      maindiv.attachEvent("onmousemove",borderline);
    }
    tid = setInterval(start,30);
    number = 0;
  }
}

//–––––––––––––––––––––––––––敌方飞机––––––––––––––––––––––––––
//创建敌方飞机的构造函数
function enemy(a,b,w,h,imgsrc,speed,hp,boomsrc,dietime,score) {
  plan.call(this,random(a,b),100,w,h,imgsrc,speed,hp,boomsrc,dietime,score);
}
function random(min,max) {
   return Math.floor(Math.random()*(max-min) + min);   //0~ max-min
}

// ––––––––––––––––––––––––––––子弹––––––––––––––––––––––––––––––
// 创建单行子弹
function oddbullet(x,y) {
   bullet.call(this,x,y,"image/bullet1.png");
}

//––––––––––––––––––––––––––––事件监听––––––––––––––––––––––––––––
if(document.addEventListener) {
  //为本方飞机进行添加移动事件
  maindiv.addEventListener("mousemove",ourmove,false);

  //本方飞机超出边界事件
  maindiv.addEventListener("mousemove",borderline,false);

  //为本方飞机添加暂停事件
  selfplan.plannode.addEventListener("click",pause,true);

  //为暂停界面中的按钮添加响应事件
  //继续
  suspenddiv.getElementsByTagName("button")[0].addEventListener("click",pause,true);
  //回到主界面
  suspenddiv.getElementsByTagName("button")[2].addEventListener("click",again,true);

} else if(document.attachEvent) {
  maindiv.attachEvent("onmousemove",ourmove);
  maindiv.attachEvent("onmousemove",borderline);
}
