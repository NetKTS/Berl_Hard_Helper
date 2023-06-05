document.addEventListener('contextmenu', event => event.preventDefault());
window.onload = function () {
    var td = document.getElementsByTagName("td")
    for (let i = 0; i < td.length; i++) {
        td[i].addEventListener('contextmenu', function (event) {
            console.log(event);
            event.preventDefault();
            yellowmeteor(td[i].id)
            return false;
        }, false);
        td[i].addEventListener('auxclick', function (e) {
            if (e.button == 1) {
                BlueMeteorNotInMech(td[i].id);
            }
        })
    };
}
const defaluttileSpawn = 100000;
var passShandi = false;
var tiles = [
    { id: 12, healt: 3 },
    { id: 1, healt: 3 },
    { id: 3, healt: 3 },
    { id: 11, healt: 3 },
    { id: 0, healt: 14 },
    { id: 5, healt: 3 },
    { id: 9, healt: 3 },
    { id: 7, healt: 3 },
    { id: 6, healt: 3 },
]
var action = [];
var queue = [];
var queueTime = [];
var pattenblue = [2, 3, 4, 3, 4, 3, 4, 3, 4];
var pattenyellow = [1, 1, 1, 1];
var tilebrokens = [];
var Mode = ""

function meteor(a) {
    console.log("meteor");
    console.log(a.id);
    let tile = _.find(tiles, (item) => item.id == a.id);
    addAction("b", a.id, true);
    cutBluePatten()
}

function yellowmeteor(id) {
    console.log("yellowmeteor")
    console.log(id)
    addAction("y", id, true);
    //chain 
    let centerYellowIndex = _.findIndex(tiles, (item) => item.id == id);
    if ([0, 8].includes(centerYellowIndex)) {
        ((centerYellowIndex - 3) >= 0 && !queue.includes(centerYellowIndex - 3)) ? addAction("y", tiles[centerYellowIndex - 3].id) : '';
        ((centerYellowIndex - 1) >= 0 && !queue.includes(centerYellowIndex - 1)) ? addAction("y", tiles[centerYellowIndex - 1].id) : '';
        ((centerYellowIndex + 1) <= 8 && !queue.includes(centerYellowIndex + 1)) ? addAction("y", tiles[centerYellowIndex + 1].id) : '';
        ((centerYellowIndex + 3) <= 8 && !queue.includes(centerYellowIndex + 3)) ? addAction("y", tiles[centerYellowIndex + 3].id) : '';
        addAction("y", 0);
    } else if ([2, 6].includes(centerYellowIndex)) {
        if (centerYellowIndex == 2) {
            !queue.includes(centerYellowIndex - 1) ? addAction("y", tiles[centerYellowIndex - 1].id) :'';
            !queue.includes(centerYellowIndex + 3) ? addAction("y", tiles[centerYellowIndex + 3].id) :'';
            addAction("y", 0);
        }
        if (centerYellowIndex == 6) {
            !queue.includes(centerYellowIndex - 3) ? addAction("y", tiles[centerYellowIndex - 3].id):'';
            !queue.includes(centerYellowIndex + 1) ? addAction("y", tiles[centerYellowIndex + 1].id):'';
            addAction("y", 0);
        }
    } else {
        GameOverPopup();
    }
    cutYellowPatten();
}
function GameOverPopup() {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    Toast.fire({
        icon: 'error',
        title: 'Restart Now'
    })
}
function calHealt() {
    tiles = [
        { id: 12, healt: 3 },
        { id: 1, healt: 3 },
        { id: 3, healt: 3 },
        { id: 11, healt: 3 },
        { id: 0, healt: 14 },
        { id: 5, healt: 3 },
        { id: 9, healt: 3 },
        { id: 7, healt: 3 },
        { id: 6, healt: 3 },
    ]
    action.forEach((ac) => {
        let damage = ac.meteor == "b" ? 1 : 3;
        let tileIndex = _.findIndex(tiles, (item) => item.id == ac.tileId);

        if (ac.meteor == "fix") {
            damage = -1
        }
        tiles[tileIndex].healt -= damage;
        if (ac.meteor == "reset") {
            tiles[tileIndex].healt = 3
        }
    });
    changehtml();
}

function ResetTiles() {
    tiles = [
        { id: 12, healt: 3 },
        { id: 1, healt: 3 },
        { id: 3, healt: 3 },
        { id: 11, healt: 3 },
        { id: 0, healt: 14 },
        { id: 5, healt: 3 },
        { id: 9, healt: 3 },
        { id: 7, healt: 3 },
        { id: 6, healt: 3 },
    ]
    action = [];
    calHealt();
}

function undo() {
    let i = 0 ;
    const isClickExists = _.some(action, (obj) => obj.isClick === true);
    if(!isClickExists){
        return;
    }
    while(true){
        i++
        if(i == 100){
            break;
        }
        let a = action.pop();
        let lastedY = _.max(queueTime, (item)=>{ return item.time});
        let lastedTimeY = lastedY.time;
        if(a.meteor == 'y'){
            countdown(a.tileId,true);
        }
        if(a.isClick == true){
            if(a.meteor == 'b'){
                let getbackupblue = backupCutBlueAction.pop();
                if(getbackupblue == 'shift'){
                    pattenblue.unshift(1);
                }else if(getbackupblue == 1){
                    pattenblue[0]++;
                }

            }
            calHealt();
            calHealper();
            break;
        }
    }
    calHealt();
}

function addAction(meteor, id, isClick) {
    let meteorType = ""
    switch (meteor) {
        case "b":
            meteorType = "b"
            break;
        case "y":
            meteorType = "y"
            break;
        case "reset":
            meteorType = "reset"
            break;
        case "fix":
            meteorType = "fix"
            break;
    }
    let newAction = {
        meteor: meteorType,
        tileId: id,
        isClick: isClick
    }
    action.push(newAction);
    calHealt();
}

function changehtml() {
    tiles.forEach((item) => {
        let tilehtml = document.getElementById(item.id);
        let healt = item.healt <= 0 ? 0 : item.healt;
        let tileHealt = document.getElementById(`healt${item.id}`)
        if (healt == 0 && !queue.includes(item.id)) {
            queue.push(item.id);
            tilebroken(item.id);
            tilebrokens.push(item.id)
        }
        tilehtml.firstElementChild.className = `box healt${healt}`
        tileHealt.innerHTML = healt;
    })
}

function tilebroken(id) {

    setTimeout(() => {
        addAction("reset", id);
        var queueIndex = _.findIndex(queue, (item) => item == id);
        queue.splice(queueIndex, 1);
        tilebrokens.splice(queueIndex, 1);
    }, defaluttileSpawn)
    countdown(id);
}

function helper() {

}

function reset() {
    tiles = [
        { id: 12, healt: 3 },
        { id: 1, healt: 3 },
        { id: 3, healt: 3 },
        { id: 11, healt: 3 },
        { id: 0, healt: 14 },
        { id: 5, healt: 3 },
        { id: 9, healt: 3 },
        { id: 7, healt: 3 },
        { id: 6, healt: 3 },
    ]
    for(let i = 0 ; i < queueTime.length; i++){
        countdown(queueTime[i].id,true);
        i--;
    }
    action = [];
    queue = [];
    queueTime = [];
    Mode = "";
    useGuide = false;
    pattenblue = [2, 3, 4, 3, 4, 3, 4, 3, 4];
    pattenyellow = [1, 1, 1, 1];
    calHealt();
    changehtml();
    ClearBlueHealper();
    ClearYellowHealper();
    // location.reload();
}

function setStart() {
    tiles = [
        { id: 12, healt: 3 },
        { id: 1, healt: 3 },
        { id: 3, healt: 3 },
        { id: 11, healt: 3 },
        { id: 0, healt: 14 },
        { id: 5, healt: 3 },
        { id: 9, healt: 3 },
        { id: 7, healt: 3 },
        { id: 6, healt: 3 },
    ]
    action = [];
    queue = [];
    pattenblue = [2, 3, 4, 3, 4, 3, 4, 3, 4];
    calHealt();
    addAction("y", 6);
    addAction("y", 5);
    addAction("y", 7);
    addAction("y", 0);
    addAction("b", 9);
    addAction("b", 11);
    addAction("b", 12);
    addAction("b", 1);
    addAction("b", 1);
    Mode = "Hard"
    calHealper()
}
function BlueMeteorNotInMech(id) {
    addAction("b", id);
    calHealper();
}
function countdown(id,isStop = false) {
    var seconds = defaluttileSpawn / 1000;
    function tick() {
        seconds--;
        let isHaveinqueue = false;
        queueTime.forEach(q => {
            if (q.id == id) {
                isHaveinqueue = true;
            }
        });
        if (!isHaveinqueue) {
            queueTime.push(
                {
                    id: id,
                    time: seconds,
                    timeout:null
                }
            );
        } else {
            var queueIndex = _.findIndex(queueTime, (item) => item.id == id);
            queueTime[queueIndex].time = seconds;
        }
        var time = document.getElementById(`time${id}`);
        var text = `${seconds >= 60 ? 1 : 0}: ${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`
        time.innerHTML = text
        if (seconds >= 0 && !isStop) {
            var queueIndex = _.findIndex(queueTime, (item) => item.id == id);
            queueTime[queueIndex].timeout = setTimeout(tick, 1000);
        } else {
            time.innerHTML = '';
            var queueIndex = _.findIndex(queueTime, (item) => item.id == id);
            clearTimeout(queueTime[queueIndex].timeout)
            queueTime.splice(queueIndex, 1);
            calHealper();
        }

    }
    tick();
}

function ClearBlueHealper() {
    tiles.forEach((t) => {
        let element = document.getElementById(t.id)
        for (let i = element.childNodes[1].children.length - 1; i > 0; i--) {
            if (element.childNodes[1].children[i].className.includes("blueMeteorhelper")) {
                element.childNodes[1].children[i].remove();
            }
        }
    });
}
function ClearYellowHealper() {
    tiles.forEach((t) => {
        let element = document.getElementById(t.id)
        for (let i = element.childNodes[1].children.length - 1; i > 0; i--) {
            if (element.childNodes[1].children[i].className.includes("yellowMeteorhelper")) {
                element.childNodes[1].children[i].remove();
            }
        }
    });
}

function drawbluehealper(tid, sequence) {
    if(tid == null){
        return;
    }
    let element = document.getElementById(tid);
    element.childNodes[1].innerHTML += `<div class='blueMeteorhelper notRotate helpblue${sequence}'>${sequence}</div>`
}
function drawyellowhealper(tid) {
    //12,3,6,9
    if ([12, 3, 6, 9].includes(tid)) {
        let element = document.getElementById(tid);
        element.childNodes[1].innerHTML += `<div class='yellowMeteorhelper notRotate helpyellow${tid}'>Y</div>`
    }
}
function calYellow() {
    let reverseaction = [...action];
    let lastedYellow = _.findWhere(reverseaction.reverse(), { meteor: 'y', isClick: true })
    let lastedyellowRecommend = pattenyellow.length + 1 % 2 == 0 ? 12 : 6;
    if (lastedYellow?.tileId == lastedyellowRecommend || lastedYellow == null) {
        return pattenyellow.length % 2 == 0 ? 12 : 6;
    } else {
        let TopHp = 0;
        zone["top"].forEach((i) => {
            let tileIndex = findTileIndex(i);
            TopHp += tiles[tileIndex].healt;
        })
        let BottomHp = 0;
        zone["bottom"].forEach((i) => {
            let tileIndex = findTileIndex(i);
            BottomHp += tiles[tileIndex].healt;
        })
        return TopHp >= BottomHp ? 6 : 12;
    }
}
const zone = {
    "top": [11, 1, 12],
    "bottom": [6, 7, 5],
    "flex": [9, 0, 3],
}
function calHealper() {
    ClearBlueHealper()
    ClearYellowHealper();
    let orderb = document.getElementById("orderB");
    orderb.innerHTML = `Mode : ${Mode}`
    let dropblue = [];
    let yellowRecommend = pattenyellow.length % 2 == 0 ? 12 : 6;
    let BrokenTileAfter1min = calTileBrokenAfter1min();
    let ZoneRecommend = "";
    switch (yellowRecommend) {
        case 12:
            ZoneRecommend = "top"
            break;
        case 6:
            ZoneRecommend = "bottom"
            break;
    }
    let canNuke = BrokenTileAfter1min < 3 ? true : false;
    tilebrokens.forEach((i) => {
        if (zone[ZoneRecommend].includes(i)) {
            canNuke = false;
        }
    })

    tiles.forEach((t) => {
        if (t.id == yellowRecommend) {
            drawyellowhealper(calYellow());
        }
        if ((canNuke && passShandi) || (pattenblue.length > 7 && pattenblue.length < 9)) {
            dropblue = calBlue(true, yellowRecommend);
        } else {
            dropblue = calBlue(false, yellowRecommend);
        }
    });
    dropblue = sortAndGroup(dropblue);
    dropblue.forEach((b, index) => {
        drawbluehealper(b, index + 1)
    });
}
let backupCutBlueAction = [];
function cutBluePatten() {
    pattenblue[0]--
    backupCutBlueAction.push(1);
    if (pattenblue[0] > 0) {
    } else {
        pattenblue.shift();
        backupCutBlueAction.push("shift");
        calHealper()
    }

}
function cutYellowPatten() {
    pattenyellow.shift();
    calHealper()
}

function calTileBrokenAfter1min() {
    let BrokenTileAfter1min = 0;
    queueTime.forEach((q) => {
        if (q.time > 60) {
            BrokenTileAfter1min++;
        }
    })
    return BrokenTileAfter1min;
}

function passShandiF() {
    passShandi = true;
    calHealper()
    document.getElementById("shandiBtn").style.backgroundColor = "#04FF00";
}
function calBlue(canNuke, yellowRecommend) {
    let ZoneRecommend;
    if (pattenblue.length == 0) {
        return;
    }
    let blueMeteorCount = pattenblue[0];
    let dropplace = [];
    switch (yellowRecommend) {
        case 12:
            ZoneRecommend = "top"
            break;
        case 6:
            ZoneRecommend = "bottom"
            break;
    }
    let recommendtileHpMorethan1 = findTileCanDropMeteor(zone[ZoneRecommend])
    let oppositetileHpMorethan1 = findTileCanDropMeteor(zone[getOpposite(ZoneRecommend)])
    if (canNuke) {
        let nukeid = findNuke(ZoneRecommend);
        dropplace.push(nukeid);
        dropplace.push(nukeid);
        blueMeteorCount = blueMeteorCount - 2;
        let canUseTile = recommendtileHpMorethan1.concat(oppositetileHpMorethan1);

        let BrokenTileAfter1min = calTileBrokenAfter1min();
        let backupTile = findTileCanDropMeteor([9, 0, 3])
        if (BrokenTileAfter1min == 0 && recommendtileHpMorethan1.length == 0) {
            if (queueTime.length > 0) {
                var canuseTileAfter1min = findTileCanDropMeteorAfter1Min();
                canUseTile = canuseTileAfter1min;
            }
        }
        // cut nuke id because it can place only 2 in 1 tile
        canUseTile = canUseTile.filter((x) => x !== nukeid);
        for (let i = 0; i < blueMeteorCount; i++) {
            if (canUseTile.length > 0) {
                dropplace.push(canUseTile.shift());
            } else {
                dropplace.push(backupTile.shift());
            }
        }
    } else {
        let canUseTile = recommendtileHpMorethan1.concat(oppositetileHpMorethan1);
        let backupTile = findTileCanDropMeteor([9, 0, 3])
        for (let i = 0; i < blueMeteorCount; i++) {
            if (canUseTile.length > 0) {
                dropplace.push(canUseTile.shift());
            } else {
                dropplace.push(backupTile.shift());
            }
            // if (recommendtileHpMorethan1.length > 0) {
            //     dropplace.push(recommendtileHpMorethan1.pop());

            // } else if (oppositetileHpMorethan1.length > 0) {
            //     (recommendtileHpMorethan1.pop());
            // }
        }
    }

    return dropplace;
}
function getOpposite(zone) {
    switch (zone) {
        case "top":
            return "bottom";
            break;
        case "bottom":
            return "top";
            break;
        case "right":
            return "left";
            break;
        case "left":
            return "right";
            break;
    }
    return null;
}

function findTileCanDropMeteor(Finds) {
    let returnTile = [];
    // add backup
    Finds.forEach((i) => {
        let tileindex = findTileIndex(i);
        let temptile = tiles[tileindex];
        let healt = temptile.healt;
        if (i == 0) {
            healt = temptile.healt % 3;
            if (healt == 0) {
                GameOverPopup();
            }
        }
        for (let r = 0; r < healt; r++) {
            if (healt > 1) {
                returnTile.push(temptile.id);
                healt--;
            }
        }
    })
    return returnTile;
}

function findTileIndex(Id) {
    return _.findIndex(tiles, (item) => item.id == Id);
}
function findNuke(ZoneRecommend) {
    let lower = {
        id: -1,
        healt: 99
    }
    zone[ZoneRecommend].forEach((i) => {
        if (![12, 3, 6, 9].includes(i)) {
            if (lower.id == -1) {
                lower.id = i;
            }
            let tileindex = findTileIndex(i)
            if (tiles[tileindex].healt < lower.healt && tiles[tileindex].healt > 0) {
                lower.healt = tiles[tileindex].healt;
            }
        }
    })

    return lower.id;
}
function findTileCanDropMeteorAfter1Min() {
    let returnTile = [];
    if (queueTime.length > 0) {
        queueTime.forEach((q) => {
            if (q.time < 60) {
                returnTile.push(q.id);
                returnTile.push(q.id);
            }
        })
    }
    return returnTile;
}

function sortAndGroup(arr) {
    let counts = {};

    if(arr?.length == 0 || arr == null){
        return;
    }
    arr.forEach((num) => {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    });

    arr.sort((a, b) => {
        if (counts[b] === counts[a]) {
            return arr.indexOf(a) - arr.indexOf(b);
        } else {
            return counts[b] - counts[a];
        }
    });

    return arr;
}

var useGuide = false;
function guide(){
    useGuide = !useGuide;
    var card = document.getElementsByClassName("card");
    for(let i = 0 ; i < card.length ; i++){
        card[i].style.opacity = useGuide ? 1 :0;
    }
}

function Manual(){
    reset();
    Mode = "Manual"
    var calmanual = document.getElementsByClassName("calmanual");
    for(let i = 0 ; i < calmanual.length ; i++){
        calmanual[i].style.display = "inline";
    }
    let orderb = document.getElementById("orderB");
    pattenblue = [];
    orderb.innerHTML = `Mode : ${Mode}`
    calHealper();
    
}
function cal3M(){
    pattenblue[0] = 3
    calHealper();
}

function cal4M(){
    pattenblue[0] = 4
    calHealper();
}