/* ═══════════════════════════════════════════════════════
   A T L A S   N O I R — Animation System v3.0
   Awwwards-Level Portfolio · Ayoub Achmaoui
   ═══════════════════════════════════════════════════════ */
(function(){
'use strict';

var mx = innerWidth/2, my = innerHeight/2;
var lenis;
var isMobile = matchMedia('(max-width:768px)').matches || 'ontouchstart' in window;
var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══ 1. PRELOADER — 3-Phase Cinematic ═══ */
function initPreloader(){
  var pre = document.getElementById('preloader');
  if(!pre) return;

  // Skip if already visited this session
  if(sessionStorage.getItem('atlas-visited')){
    pre.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(heroEntrance, 100);
    return;
  }

  document.body.style.overflow = 'hidden';
  var counter = document.getElementById('pre-count');
  var atlasEl = document.getElementById('pre-atlas');
  var noirEl = document.getElementById('pre-noir');
  var lineEl = document.getElementById('pre-line');

  // Inject letters
  function injectChars(el, word){
    word.split('').forEach(function(ch){
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      el.appendChild(span);
    });
  }
  injectChars(atlasEl, 'ATLAS');
  injectChars(noirEl, 'NOIR');

  if(typeof gsap === 'undefined' || reducedMotion){
    pre.classList.add('hidden');
    document.body.style.overflow = '';
    sessionStorage.setItem('atlas-visited','1');
    setTimeout(heroEntrance, 100);
    return;
  }

  var tl = gsap.timeline({onComplete: function(){
    sessionStorage.setItem('atlas-visited','1');
  }});

  // Phase 1: Counter 0→100%
  tl.to({v:0},{v:100, duration:1.2, ease:'power3.in',
    onUpdate:function(){ if(counter) counter.textContent = Math.round(this.targets()[0].v); }
  });

  // Phase 2: Letter reveals
  tl.to(atlasEl.querySelectorAll('.char'),{
    opacity:1, y:0, duration:.7, stagger:.06, ease:'expo.out'
  }, '-=0.2');
  tl.to(noirEl.querySelectorAll('.char'),{
    opacity:1, y:0, duration:.7, stagger:.06, ease:'expo.out'
  }, '-=0.4');

  // Line stretch
  tl.add(function(){ lineEl.classList.add('active'); }, '-=0.3');

  // Phase 3: Exit
  tl.to({},{ duration:.5 }); // pause
  tl.add(function(){
    pre.classList.add('exit');
    document.body.style.overflow = '';
    setTimeout(function(){
      pre.classList.add('hidden');
      heroEntrance();
    }, 900);
  });
}

/* ═══ 2. HERO ENTRANCE ═══ */
function heroEntrance(){
  if(typeof gsap === 'undefined' || reducedMotion) return;

  var t1 = document.getElementById('hero-title-1');
  var t2 = document.getElementById('hero-title-2');
  var line = document.getElementById('hero-line');

  // Split title text
  if(typeof SplitType !== 'undefined'){
    [t1,t2].forEach(function(el,i){
      if(!el) return;
      var s = new SplitType(el, {types:'chars'});
      gsap.from(s.chars, {
        opacity:0, y:80, rotateX:-60,
        duration:.8, stagger:.04, ease:'expo.out',
        delay: i * 0.4
      });
    });
  }

  // Accent line
  setTimeout(function(){ if(line) line.classList.add('active'); }, 600);

  // Portrait
  gsap.from('.hero__portrait',{opacity:0,scale:.9,duration:1,delay:.7,ease:'expo.out'});

  // Name
  var nameEl = document.getElementById('hero-name');
  if(nameEl && typeof SplitType !== 'undefined'){
    var ns = new SplitType(nameEl, {types:'chars'});
    gsap.from(ns.chars,{opacity:0,y:50,duration:.7,stagger:.03,delay:1,ease:'expo.out'});
  }

  // Staggered reveals
  gsap.from('.hero__subtitle',{opacity:0,y:20,duration:.6,delay:1.2,ease:'power3.out'});
  gsap.from('.hero__tagline',{opacity:0,y:20,duration:.6,delay:1.4,ease:'power3.out'});
  gsap.from('.hero__ctas',{opacity:0,y:20,duration:.5,delay:1.6,ease:'power3.out'});
  gsap.from('.hero__stats',{opacity:0,y:15,duration:.5,delay:1.8,ease:'power3.out'});
  gsap.from('.hero__meta span',{opacity:0,x:10,duration:.4,stagger:.1,delay:1.5,ease:'power3.out'});

  // Counters
  document.querySelectorAll('.stat__number[data-target]').forEach(function(el){
    var target = parseInt(el.dataset.target);
    gsap.to({v:0},{v:target,duration:1.5,delay:2,ease:'power2.out',
      onUpdate:function(){ el.textContent = Math.round(this.targets()[0].v); }
    });
  });
}

/* ═══ 3. HERO PARTICLES ═══ */
function initParticles(){
  var canvas = document.getElementById('hero-particles');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var COUNT = isMobile ? 40 : 120;

  function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
  resize(); window.addEventListener('resize',resize);

  for(var i=0;i<COUNT;i++){
    particles.push({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      r:Math.random()*1.5+.3, vx:(Math.random()-.5)*.12,
      vy:-Math.random()*.25-.05, alpha:Math.random()*.35+.05,
      phase:Math.random()*Math.PI*2
    });
  }
  var t=0;
  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    t+=.006;
    // Mouse parallax
    var pmx=(mx/innerWidth-.5)*.02, pmy=(my/innerHeight-.5)*.02;
    particles.forEach(function(p){
      p.x += p.vx + Math.sin(t+p.phase)*.08 + pmx;
      p.y += p.vy + pmy;
      if(p.y<-10){p.y=canvas.height+10;p.x=Math.random()*canvas.width}
      if(p.x<-10)p.x=canvas.width+10;
      if(p.x>canvas.width+10)p.x=-10;
      var flicker=.5+Math.sin(t*2+p.phase)*.5;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(196,151,58,'+(p.alpha*flicker)+')';
      ctx.fill();
    });
    requestAnimationFrame(render);
  }
  render();
}

/* ═══ 4. CURSOR — 7 States ═══ */
function initCursor(){
  if(isMobile) return;
  var dot=document.getElementById('cursor-dot');
  var ring=document.getElementById('cursor-ring');
  var label=document.getElementById('cursor-label');
  if(!dot||!ring) return;

  var dx=mx,dy=my,rx=mx,ry=my;

  document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY});
  document.addEventListener('mousedown',function(){document.body.classList.add('clicking')});
  document.addEventListener('mouseup',function(){document.body.classList.remove('clicking')});

  // State management via data-cursor attributes
  var stateMap = {
    'link': 'cursor-link',
    'project': 'cursor-project',
    'cta': 'cursor-cta',
    'image': 'cursor-image',
    'text': 'cursor-text',
    'drag': 'cursor-drag'
  };
  var labelMap = {
    'project': 'VIEW →',
    'image': 'EXPLORE',
    'drag': 'DRAG'
  };

  // Query all interactive elements
  function setupCursorStates(){
    // data-cursor elements
    document.querySelectorAll('[data-cursor]').forEach(function(el){
      el.addEventListener('mouseenter',function(){
        var state = el.dataset.cursor;
        var cls = stateMap[state];
        if(cls) document.body.classList.add(cls);
        if(labelMap[state] && label) label.textContent = labelMap[state];
      });
      el.addEventListener('mouseleave',function(){
        Object.values(stateMap).forEach(function(c){document.body.classList.remove(c)});
        if(label) label.textContent = '';
      });
    });

    // Nav links, buttons
    var linkSel = '.nav__links a,.nav__cta,.contact-link,.project__cta,.btn-ghost,.cert-pill,.tech-pill,.hamburger';
    document.querySelectorAll(linkSel).forEach(function(el){
      el.addEventListener('mouseenter',function(){document.body.classList.add('cursor-link')});
      el.addEventListener('mouseleave',function(){document.body.classList.remove('cursor-link')});
    });

    // Primary buttons (magnetic CTAs)
    document.querySelectorAll('.btn-primary,.contact__cta,.contact__email').forEach(function(el){
      el.addEventListener('mouseenter',function(){document.body.classList.add('cursor-cta')});
      el.addEventListener('mouseleave',function(){document.body.classList.remove('cursor-cta')});
    });

    // Text
    document.querySelectorAll('p,.section-sub,.project__desc,.about__text p,.hero__tagline').forEach(function(el){
      el.addEventListener('mouseenter',function(){document.body.classList.add('cursor-text')});
      el.addEventListener('mouseleave',function(){document.body.classList.remove('cursor-text')});
    });
  }
  setupCursorStates();

  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach(function(el){
    el.addEventListener('mousemove',function(e){
      var r=el.getBoundingClientRect();
      var rx2=e.clientX-r.left-r.width/2, ry2=e.clientY-r.top-r.height/2;
      if(typeof gsap!=='undefined') gsap.to(el,{x:rx2*.25,y:ry2*.25,duration:.4,ease:'power2.out'});
    });
    el.addEventListener('mouseleave',function(){
      if(typeof gsap!=='undefined') gsap.to(el,{x:0,y:0,duration:.7,ease:'elastic.out(1,0.4)'});
    });
  });

  // Render loop
  (function loop(){
    dx+=(mx-dx)*.2; dy+=(my-dy)*.2;
    rx+=(mx-rx)*.08; ry+=(my-ry)*.08;
    dot.style.left=dx+'px'; dot.style.top=dy+'px';
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(loop);
  })();
}

/* ═══ 5. PROGRESS BAR ═══ */
function initProgress(){
  var bar=document.getElementById('progress-bar');
  if(!bar) return;
  window.addEventListener('scroll',function(){
    var p=window.scrollY/(document.documentElement.scrollHeight-innerHeight);
    bar.style.transform='scaleX('+p+')';
  },{passive:true});
}

/* ═══ 6. LENIS SMOOTH SCROLL ═══ */
function initLenis(){
  if(typeof Lenis==='undefined' || reducedMotion) return;
  try{
    lenis=new Lenis({lerp:.08,duration:1.4,smoothWheel:true,wheelMultiplier:1,touchMultiplier:2});
    if(typeof gsap!=='undefined' && typeof ScrollTrigger!=='undefined'){
      lenis.on('scroll',function(){ScrollTrigger.update()});
      gsap.ticker.add(function(t){lenis.raf(t*1000)});
      gsap.ticker.lagSmoothing(0);
    } else {
      (function r(t){lenis.raf(t);requestAnimationFrame(r)})();
    }
  }catch(e){}
}

/* ═══ 7. NAVIGATION ═══ */
function initNav(){
  var nav = document.getElementById('main-nav');
  if(!nav) return;
  var lastY=0, scrollDir=0, hideThreshold=200;

  window.addEventListener('scroll',function(){
    var y=window.scrollY;
    // Scrolled state (background)
    nav.classList.toggle('scrolled', y > 80);
    // Hide/show on scroll direction
    if(y > hideThreshold){
      if(y > lastY + 5) nav.classList.add('hidden');
      else if(y < lastY - 5) nav.classList.remove('hidden');
    } else {
      nav.classList.remove('hidden');
    }
    lastY = y;
  },{passive:true});

  // Active section detection
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav__links a');
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        links.forEach(function(a){a.classList.remove('active')});
        var link = document.querySelector('.nav__links a[href="#'+en.target.id+'"]');
        if(link) link.classList.add('active');
      }
    });
  },{threshold:.25});
  sections.forEach(function(s){obs.observe(s)});

  // Scroll indicator hide
  var si = document.getElementById('scroll-indicator');
  if(si){
    var hidden=false;
    window.addEventListener('scroll',function(){
      if(!hidden && window.scrollY > 100){
        hidden=true;
        gsap.to(si,{opacity:0,y:20,duration:.5,ease:'power2.in'});
      }
    },{passive:true});
  }
}

/* ═══ 8. MOBILE MENU ═══ */
function initMobile(){
  var ham=document.getElementById('hamburger');
  var drawer=document.getElementById('mobile-drawer');
  if(!ham||!drawer) return;

  ham.addEventListener('click',function(){
    ham.classList.toggle('active');
    drawer.classList.toggle('open');
  });

  drawer.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      ham.classList.remove('active');
      drawer.classList.remove('open');
      var target=document.querySelector(this.getAttribute('href'));
      if(target){
        if(lenis) lenis.scrollTo(target);
        else target.scrollIntoView({behavior:'smooth'});
      }
    });
  });

  // Also handle all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      var target=document.querySelector(this.getAttribute('href'));
      if(target){
        if(lenis) lenis.scrollTo(target);
        else target.scrollIntoView({behavior:'smooth'});
      }
      if(drawer.classList.contains('open')){
        ham.classList.remove('active');
        drawer.classList.remove('open');
      }
    });
  });
}

/* ═══ 9. SCROLL REVEALS ═══ */
function initReveals(){
  if(typeof gsap==='undefined'||typeof ScrollTrigger==='undefined'||reducedMotion) return;

  var targets='.section-label,.section-title,.section-sub,.about__text p,.timeline__node,.cert-pill,.about__card,.stat-box,.service-row,.project,.lab-card,.contact__label,.contact__title,.contact__email,.contact__links,.contact__cta,.tech-category,.hero__stats';

  gsap.utils.toArray(targets).forEach(function(el){
    gsap.from(el,{
      opacity:0,y:50,duration:.8,ease:'expo.out',
      scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}
    });
  });

  // Project image parallax
  gsap.utils.toArray('.project__visual img').forEach(function(img){
    gsap.to(img,{
      yPercent:-10,ease:'none',
      scrollTrigger:{trigger:img.closest('.project'),start:'top bottom',end:'bottom top',scrub:1.5}
    });
  });

  // Language bars
  var langObs=new IntersectionObserver(function(e){
    e.forEach(function(en){
      if(en.isIntersecting){
        en.target.querySelectorAll('.lang-fill').forEach(function(b){
          b.style.width=b.dataset.width+'%';
        });
        langObs.unobserve(en.target);
      }
    });
  },{threshold:.3});
  document.querySelectorAll('.lang-bars').forEach(function(el){langObs.observe(el)});
}

/* ═══ 10. TEXT SCRAMBLE EFFECT ═══ */
function initScramble(){
  if(isMobile || reducedMotion) return;
  var arabicChars='أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
  document.querySelectorAll('.section-title').forEach(function(el){
    var original = el.textContent;
    el.addEventListener('mouseenter',function(){
      var iterations=0;
      var interval=setInterval(function(){
        el.textContent=original.split('').map(function(ch,i){
          if(ch===' '||ch==='\n') return ch;
          if(i<iterations) return original[i];
          return arabicChars[Math.floor(Math.random()*arabicChars.length)];
        }).join('');
        iterations+=1;
        if(iterations>original.length) clearInterval(interval);
      },30);
    });
  });
}

/* ═══ 11. CONTACT INTERACTIONS ═══ */
function initContact(){
  // Email copy
  var email=document.getElementById('contact-email');
  var toast=document.getElementById('contact-toast');
  if(email){
    email.addEventListener('click',function(e){
      e.preventDefault();
      navigator.clipboard.writeText('achmaouiayoub120@gmail.com').then(function(){
        if(toast){
          toast.classList.add('show');
          setTimeout(function(){toast.classList.remove('show')},2000);
        }
      });
    });
  }

  // Parallax on contact title
  var title=document.getElementById('contact-title');
  if(title && !isMobile){
    document.addEventListener('mousemove',function(e){
      var x=(e.clientX/innerWidth-.5);
      title.style.transform='translateX('+(x*-15)+'px)';
    });
  }
}

/* ═══ 12. LAB EXPERIMENTS ═══ */
function initZellige(){
  var c=document.getElementById('zellige-canvas');
  if(!c) return;
  var ctx=c.getContext('2d');
  var cols=['#C4973A','#C4522A','#1B3A6B','#1A4A3A','#E8B84B'];
  var tiles=[];

  function resize(){var r=c.parentElement.getBoundingClientRect();c.width=r.width;c.height=r.height*.65}
  resize();

  function draw(x,y,sz,col,rot){
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);
    ctx.fillStyle=col+'55';ctx.strokeStyle=col;ctx.lineWidth=.6;
    ctx.beginPath();ctx.moveTo(0,-sz);ctx.lineTo(sz*.7,0);
    ctx.lineTo(0,sz);ctx.lineTo(-sz*.7,0);ctx.closePath();
    ctx.fill();ctx.stroke();ctx.restore();
  }
  function render(){
    ctx.clearRect(0,0,c.width,c.height);
    tiles.forEach(function(t){draw(t.x,t.y,t.s,t.c,t.r);t.r+=.002});
    requestAnimationFrame(render);
  }
  c.addEventListener('click',function(e){
    var r=c.getBoundingClientRect();
    for(var i=0;i<3;i++){
      tiles.push({
        x:e.clientX-r.left+(Math.random()-0.5)*40,
        y:e.clientY-r.top+(Math.random()-0.5)*40,
        s:12+Math.random()*20,
        c:cols[Math.floor(Math.random()*cols.length)],
        r:Math.random()*Math.PI
      });
    }
  });
  for(var i=0;i<12;i++){
    tiles.push({x:Math.random()*300,y:Math.random()*200,s:10+Math.random()*16,c:cols[Math.floor(Math.random()*cols.length)],r:Math.random()*Math.PI});
  }
  render();
}

function initPhysics(){
  var c=document.getElementById('physics-canvas');
  if(!c||typeof Matter==='undefined') return;
  var r=c.parentElement.getBoundingClientRect();
  c.width=r.width;c.height=r.height*.65;
  var eng=Matter.Engine.create(),w=c.width,h=c.height,ctx=c.getContext('2d');
  var balls=[],colors=['#C4522A','#1A4A3A','#C4973A','#E8B84B','#8B7355'];

  Matter.Composite.add(eng.world,[
    Matter.Bodies.rectangle(w/2,h+25,w,50,{isStatic:true}),
    Matter.Bodies.rectangle(-25,h/2,50,h,{isStatic:true}),
    Matter.Bodies.rectangle(w+25,h/2,50,h,{isStatic:true})
  ]);

  for(var i=0;i<18;i++){
    var b=Matter.Bodies.circle(Math.random()*w*.8+w*.1,Math.random()*h*.4,4+Math.random()*8,{restitution:.7});
    b.render={c:colors[Math.floor(Math.random()*colors.length)]};
    Matter.Composite.add(eng.world,b);balls.push(b);
  }

  c.addEventListener('click',function(e){
    var rc=c.getBoundingClientRect();
    var b=Matter.Bodies.circle(e.clientX-rc.left,e.clientY-rc.top,4+Math.random()*6,{restitution:.7});
    b.render={c:colors[Math.floor(Math.random()*colors.length)]};
    Matter.Composite.add(eng.world,b);balls.push(b);
  });

  // Mouse wind
  if(!isMobile){
    c.addEventListener('mousemove',function(e){
      var rc=c.getBoundingClientRect();
      var fx=(e.clientX-rc.left-w/2)*.00003;
      var fy=(e.clientY-rc.top-h/2)*.00003;
      balls.forEach(function(b){Matter.Body.applyForce(b,b.position,{x:fx,y:fy})});
    });
  }

  (function ren(){
    Matter.Engine.update(eng,16);
    ctx.clearRect(0,0,w,h);
    balls.forEach(function(b){
      ctx.beginPath();ctx.arc(b.position.x,b.position.y,b.circleRadius,0,Math.PI*2);
      ctx.fillStyle=b.render.c;ctx.fill();
    });
    requestAnimationFrame(ren);
  })();
}

function initCalli(){
  var txt=document.getElementById('calli-text');
  if(!txt) return;
  var t=0;
  (function w(){
    t+=.035;
    txt.setAttribute('y', 80+Math.sin(t)*10);
    txt.setAttribute('transform','rotate('+Math.sin(t*.5)*3+' 100 80)');
    txt.setAttribute('opacity', .4+Math.sin(t*.8)*.3);
    requestAnimationFrame(w);
  })();
}

/* ═══ 13. KONAMI CODE ═══ */
function initKonami(){
  var code=[38,38,40,40,37,39,37,39,66,65],pos=0;
  var ee=document.getElementById('easter-egg');
  document.addEventListener('keydown',function(e){
    if(e.keyCode===code[pos]){
      pos++;
      if(pos===code.length){
        pos=0;
        if(!ee) return;
        ee.classList.add('active');
        var sc=document.getElementById('ee-stars');
        if(sc){
          sc.width=innerWidth;sc.height=innerHeight;
          var sx=sc.getContext('2d');
          for(var i=0;i<200;i++){
            sx.fillStyle='rgba(255,255,255,'+(Math.random()*.7+.2)+')';
            sx.beginPath();sx.arc(Math.random()*sc.width,Math.random()*sc.height,Math.random()*2.5,0,Math.PI*2);
            sx.fill();
          }
        }
        setTimeout(function(){
          if(typeof gsap!=='undefined'){
            gsap.to(ee,{opacity:0,duration:.8,onComplete:function(){
              ee.classList.remove('active');ee.style.opacity='';
            }});
          } else {
            ee.style.opacity='0';
            setTimeout(function(){ee.classList.remove('active');ee.style.opacity=''},800);
          }
        },4000);
      }
    } else pos=0;
  });
}

/* ═══ 14. THEME TOGGLE ═══ */
function initTheme(){
  var btn = document.getElementById('theme-toggle');
  if(!btn) return;
  var sun = btn.querySelector('.sun-icon');
  var moon = btn.querySelector('.moon-icon');

  var currentTheme = localStorage.getItem('atlas-theme');
  if(!currentTheme){
    currentTheme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme){
    if(theme === 'light'){
      document.documentElement.setAttribute('data-theme', 'light');
      if(sun) sun.style.display = 'none';
      if(moon) moon.style.display = 'block';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if(sun) sun.style.display = 'block';
      if(moon) moon.style.display = 'none';
    }
    localStorage.setItem('atlas-theme', theme);
  }

  applyTheme(currentTheme);

  btn.addEventListener('click', function(){
    var newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  });
}

/* ═══ INIT ═══ */
function init(){
  if(typeof gsap!=='undefined'){
    if(typeof ScrollTrigger!=='undefined') gsap.registerPlugin(ScrollTrigger);
  }
  initTheme();
  initPreloader();
  initParticles();
  initProgress();
  initCursor();
  initLenis();
  initMobile();
  initKonami();
  initContact();
  initScramble();
  if(typeof gsap!=='undefined'){
    initReveals();
    initNav();
  }
  initZellige();
  initCalli();
  if(typeof Matter!=='undefined') initPhysics();
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
