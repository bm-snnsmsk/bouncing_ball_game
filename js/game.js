// requestAnimationFrame isteği START
window.animasyonFrameIstegi = (function(){
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback){
        return window.setTimeout(callback, 1000 / 60) ;
    } ;
}) () ;
// requestAnimationFrame isteği END


// cancelAnimationFrame iptal START
window.animasyonFrameIptal = (function(){
    return window.cancelAnimationFrame || 
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    clearTimeout() ;
}) () ;
// cancelAnimationFrame iptal END


let canvas = document.querySelector('#canvas') ,
    ctx = canvas.getContext('2d') ,
    G = canvas.width = window.innerWidth ,  // fullscreen width
    Y = canvas.height = window.innerHeight ; //  // fullscreen height

  

let parcalar = [],
    topum = {},
    mouse = {},
    puanlar = 0, 
    hiz = 60, // frame / saniye
    carpismaParcacigi = 20 ,
    parcaPozisyonu = {},
    carpismaDegiskeni = 0,
    kivilcimDegiskeni = 1,
    baslatButon ={},
    resetButon  ={},
    res, // animasyon başlatma değişkeni
    bitti = 0,
    cubukCarpisma,
    cubuk = [2]; 


canvas.addEventListener('mousemove', mouseHareket, true);
canvas.addEventListener('mousedown', butonTiklandi, true);

//carpisma efekti START
let carpisma = document.querySelector('#carp') ;
//carpisma efekti END



topum = { // ball nesnesi
    x: 50,
    y: 50,
    r: 5,
    c:"rgba(255,255,255)",
    xh:4,
    yh:8,
    ciz:function(){
        ctx.beginPath();
        ctx.fillStyle=this.c;
        ctx.arc(this.x,this.y,this.r,0,Math.PI * 2, false) ;
        ctx.fill() ;
    }
} ;

// baslat butonu START
baslatButon = {
    w:100,
    h:50,
    x:G/2-50,
    y:Y/2-25,
    ciz: function(){
        ctx.strokeStyle ="white",
        ctx.lineWidth = "2";
        ctx.strokeRect(this.x, this.y,this.w,this.h);
        ctx.font="18px Arial, sans-serif";
        ctx.textAlign="center" ;
        ctx.textBaseline = "middle" ;
        ctx.fillStyle="white";
        ctx.fillText("Başlat",G/2,Y/2);
    }
}
// başlat butonu END

// reset butonu START
resetButon = {
    w:100,
    h:50,
    x:G/2-50,
    y:Y/2-25,
    ciz: function(){
        ctx.strokeStyle ="white",
        ctx.lineWidth = "2";
        ctx.strokeRect(this.x, this.y,this.w,this.h);
        ctx.font="18px Arial, sans-serif";
        ctx.textAlign="center" ;
        ctx.textBaseline = "middle" ;
        ctx.fillStyle="white";
        ctx.fillText("Yeniden Başlat",G/2,Y/2-50);
    }
}
// reset butonu END

// kıvılcımlar START
function parcacikOlutur(x,y,m){
    this.x = x || 0 ;
    this.y = y || 0 ;
    this.radius = 1.2;
    this.xh= -1.5+Math.random()*3 ;
    this.yh= m*Math.random()*1.5 ;
}
// kıvılcımlar END

// hız artırma START
function hizArtir(){
    if(puanlar%4 ==0){
        if(Math.abs(topum.xh) < 15){
            topum.xh+=(topum.xh<0) ? -1 : 1 ;
            topum.yh+=(topum.yh<0) ? -2 : 2 ;
        }
    }
}
// hız artırma END


// cubuklar
function kurek(pos){
    this.h = 5;
    this.w = 150 ;
    this.x = G / 2 - this.w / 2 ;
    this.y = (pos == 'ust') ? 0 : (Y - this.h) ;
}

// cubuklar oluşturuldu
cubuk.push(new kurek('asagi')) ;
cubuk.push(new kurek('ust')) ;

//tuval çizmek 
function canvasCiz(){
    ctx.fillStyle = "black" ;
      // background color
    ctx.fillRect(0,0,G,Y) ;
}

function ciz(){
    canvasCiz() ;
    for(let i = 0 ; i < cubuk.length; i++){
        let p = cubuk[i] ;
        ctx.fillStyle = "white";
        ctx.fillRect(p.x, p.y, p.w, p.h) ;
    }
    topum.ciz() ;
    guncelle() ;
}

// animasyonu çalıştır
function animDongu(){
    res = animasyonFrameIstegi(animDongu) ;  
    ciz() ;
}
//animDongu();

function baslamaEkrani(){
    ciz() ;
    baslatButon.ciz();
}


// ekrandaki değişikleri guncelle fonksiyonu START
function guncelle(){

    //puan tablosu
    scoreGuncelle() ;

    //top hareketi
    topum.x += topum.xh ;
    topum.y += topum.yh ;

    // çubuk hareketi
    if(mouse.x && mouse.y){
        for(let i=1; i<cubuk.length; i++){
            let p = cubuk[i];
            p.x = mouse.x - p.w/2 ;
        }
    }  
    
    //  cubukları çağırma  
    p1 = cubuk[1] ;
    p2 = cubuk[2] ;
    if(carpismalar(topum, p1)){
        //topum.yh = -topum.yh ;
        carpismaEylemi(topum,p1) ;
    }else if(carpismalar(topum, p2)){
        //topum.yh = -topum.yh ;    // çarpışma anında yön değiştirildiği için bu koda geek kalmadı
        carpismaEylemi(topum,p2) ; 
    }else{
        //top üst ve alt çubuğa çarparsa
        if(topum.y + topum.r > Y){
            topum.y = Y - topum.r ;
            oyunBitti() ;
        }else if(topum.y < 0){
            topum.y = topum.r ;
            oyunBitti() ;
        }

 

     //top sağ ve sol kenara çarparsa
     if(topum.x + topum.r > G){
        topum.xh = -topum.xh ;
        topum.x = G - topum.r ;
    }else if(topum.x - topum.r < 0){
        topum.xh = -topum.xh ;
        topum.x = topum.r ;
    }
    }
    // oluşturulmuş parçaları array'e push etme
    if(carpismaDegiskeni ==1){
        for(var i=0;i<carpismaParcacigi;i++){
            parcalar.push(new parcacikOlutur(parcaPozisyonu.x, parcaPozisyonu.y,cogalt));
        }
    }    
    // oluşturulmuş parçaları yayma
    parcaciklariYay();
    carpismaDegiskeni =0 ; // bu yapılmazsa parçalar ekrandan kaybolmaz

}
// ekrandaki değişikleri guncelle fonksiyonu END

// mousemove addEventListener fonksiyonu START
function mouseHareket(e){
    mouse.x = e.pageX ;
    mouse.y = e.pageY ;
}
// mousemove addEventListener fonksiyonu END


// collision fonksiyonu START
function carpismalar(b, p){ // b = top , p = çubuk
    if(b.x + topum.r >= p.x && b.x - topum.r <= p.x + p.w){
        if(b.y>=(p.y-p.h) && p.y>0){
            cubukCarpisma = 1 ;
            return true ;
        }else if(b.y <= p.h && p.y == 0){
            cubukCarpisma = 2 ;
            return true ;
        }else{
            return false ;
        }
    }
}
// collision fonksiyonu END



// collision eylemi START
function carpismaEylemi(topum, p){ 
    topum.yh = -topum.yh ;
    if(cubukCarpisma == 1){
        topum.y = p.y - p.h ;
        parcaPozisyonu.y = topum.y - topum.r ; // sıçrama yönü
        cogalt = -1 ;
    }else if(cubukCarpisma == 2){
        topum.y = p.h+topum.r ;
        parcaPozisyonu.y = topum.y - topum.r ; // sıçrama yönü
        cogalt = 1 ;
    }
    puanlar++;
    hizArtir();
    if(carpisma){ // ses efekti için
        if(puanlar>0){
            carpisma.pause(); 
        }
        carpisma.currentTime =0;
        carpisma.play();
       
    }
    parcaPozisyonu.x = topum.x ; 
    carpismaDegiskeni =1;
}
// collision eyemi END

// oyunBitti fonksiyonu START
function oyunBitti(){
    ctx.fillStyle="white" ;
    ctx.font="30px Arial, sans-serif";
    ctx.textAlign="center" ;
    ctx.textBaseline = "middle" ;
    ctx.fillText('Oyun Bitti. Punınız : '+puanlar,G/2, Y/2+25) ;
    animasyonFrameIptal(res) ;
    bitti = 1;
    resetButon.ciz() ;
}
// oyunBitti fonksiyonu END

// score fonksiyonu START
function scoreGuncelle(){
    ctx.fillStyle="white" ;
    ctx.font="30px Arial, sans-serif";
    ctx.textAlign="left" ;
    ctx.textBaseline = "top" ;
    ctx.fillText("Puanınız : "+puanlar,10, 10) ;
}
// score fonksiyonu END

// parçaları dağıtma fonksiyonu START
function parcaciklariYay(){
    for(let i =0;i<parcalar.length;i++){
        let par = parcalar[i] ;
        ctx.beginPath();
        ctx.fillStyle="white";
        if(par.radius>0){
            ctx.arc(par.x,par.y,par.radius,0,Math.PI * 2, false) ;
        }
        ctx.fill();
        par.x += par.xh;
        par.y += par.yh;
        //parçaların kayolması
        par.radius = Math.max(par.radius-0.05,0.0) // parçalar yavaş yavaş kaybolur
    }
}
// parçaları dağıtma fonksiyonu END


// oyunBitti fonksiyonu START
function butonTiklandi(e){    
    // mouse pozisyonunu yakala
    let mx = e.pageX;
    let my = e.pageY;
    // başlat butonuna tıkla
    if(mx >= baslatButon.x && mx<=baslatButon.x+baslatButon.w){
        animDongu() ; // animasyonu başlat
        baslatButon = {} ; // başlat fonksiyonunu sil
    }
    if(bitti == 1){
        if(mx >= resetButon.x && mx <= resetButon.x + resetButon.w){
            topum.x = 20 ;
            topum.y = 20 ; 
            puanlar = 0 ;
            topum.xh = 4;
            topum.yh = 8;
            animDongu() ; // animasyonu başlat
            bitti = 0 ;
        }
    }
}
// oyunBitti fonksiyonu END



baslamaEkrani();