(function(){
'use strict';

const cursor=document.getElementById('cursor');
const follower=document.getElementById('cursor-follower');
const trailContainer=document.getElementById('trail-container');
const gradientShift=document.getElementById('gradient-shift');
const orbWrappers=document.querySelectorAll('.orb-wrapper');
const sections=document.querySelectorAll('section');

let rawMouseX=0,rawMouseY=0;
let targetMouseX=0,targetMouseY=0;
let followX=0,followY=0;
let trailDots=[];

const magneticElements=document.querySelectorAll('a,button,.project-card,.stat-card,.contact-link');
const magneticThreshold=120;

document.addEventListener('mousemove',e=>{
rawMouseX=e.clientX;
rawMouseY=e.clientY;

targetMouseX=rawMouseX;
targetMouseY=rawMouseY;

magneticElements.forEach(el=>{
const rect=el.getBoundingClientRect();
const elCenterX=rect.left+rect.width/2;
const elCenterY=rect.top+rect.height/2;
const dx=elCenterX-rawMouseX;
const dy=elCenterY-rawMouseY;
const distance=Math.sqrt(dx*dx+dy*dy);
if(distance<magneticThreshold){
const force=(magneticThreshold-distance)/magneticThreshold;
targetMouseX+=dx*force*0.6;
targetMouseY+=dy*force*0.6;
}
});

cursor.style.left=(targetMouseX-4)+'px';
cursor.style.top=(targetMouseY-4)+'px';

if(Math.random()>0.6)createTrailDot(targetMouseX,targetMouseY);
});

function createTrailDot(x,y){
const dot=document.createElement('div');
dot.className='cursor-trail';
dot.style.left=(x-3)+'px';
dot.style.top=(y-3)+'px';
trailContainer.appendChild(dot);
trailDots.push({el:dot,opacity:0.4,scale:1});
if(trailDots.length>15){
const old=trailDots.shift();
old.el.remove();
}
}

function animateTrails(){
trailDots.forEach((dot,i)=>{
dot.opacity-=0.03;
dot.scale-=0.02;
dot.el.style.opacity=Math.max(0,dot.opacity);
dot.el.style.transform=`scale(${Math.max(0.2,dot.scale)})`;
if(dot.opacity<=0){
dot.el.remove();
trailDots.splice(i,1);
}
});
requestAnimationFrame(animateTrails);
}
animateTrails();

function animateFollower(){
followX+=(targetMouseX-followX)*0.08;
followY+=(targetMouseY-followY)*0.08;
follower.style.left=(followX-20)+'px';
follower.style.top=(followY-20)+'px';
requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a,button,.project-card,.contact-link,.stat-card').forEach(el=>{
el.addEventListener('mouseenter',()=>{
cursor.style.transform='scale(3)';
follower.style.transform='scale(1.5)';
follower.style.borderColor='rgba(0,162,255,0.6)';
});
el.addEventListener('mouseleave',()=>{
cursor.style.transform='scale(1)';
follower.style.transform='scale(1)';
follower.style.borderColor='rgba(0,162,255,0.3)';
});
});

const canvas=document.getElementById('particles');
const ctx=canvas.getContext('2d');
let particles=[];

function resizeCanvas(){
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize',resizeCanvas);

class Particle{
constructor(layer){
this.layer=layer||0;
this.reset();
}
reset(){
this.x=Math.random()*canvas.width;
this.y=Math.random()*canvas.height;
if(this.layer===0){
this.size=Math.random()*0.8+0.3;
this.speedX=(Math.random()-0.5)*0.15;
this.speedY=(Math.random()-0.5)*0.15;
this.opacity=Math.random()*0.2+0.05;
this.hue=Math.random()>0.5?210:45;
}else if(this.layer===1){
this.size=Math.random()*1.2+0.5;
this.speedX=(Math.random()-0.5)*0.3;
this.speedY=(Math.random()-0.5)*0.3;
this.opacity=Math.random()*0.3+0.1;
this.hue=Math.random()>0.5?210:45;
}else{
this.size=Math.random()*2+1;
this.speedX=(Math.random()-0.5)*0.6;
this.speedY=(Math.random()-0.5)*0.6;
this.opacity=Math.random()*0.5+0.2;
this.hue=Math.random()>0.5?210:45;
}
}
update(scrollDelta){
this.x+=this.speedX+(this.layer*0.1*scrollDelta);
this.y+=this.speedY;
if(this.x<0||this.x>canvas.width||this.y<0||this.y>canvas.height)this.reset();
}
draw(){
ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fillStyle=`hsla(${this.hue},100%,70%,${this.opacity})`;
ctx.fill();
}
}

for(let i=0;i<40;i++)particles.push(new Particle(0));
for(let i=0;i<30;i++)particles.push(new Particle(1));
for(let i=0;i<15;i++)particles.push(new Particle(2));

function drawConnections(){
for(let i=0;i<particles.length;i++){
for(let j=i+1;j<particles.length;j++){
const dx=particles[i].x-particles[j].x;
const dy=particles[i].y-particles[j].y;
const dist=Math.sqrt(dx*dx+dy*dy);
if(dist<100){
ctx.beginPath();
ctx.moveTo(particles[i].x,particles[i].y);
ctx.lineTo(particles[j].x,particles[j].y);
ctx.strokeStyle=`rgba(0,162,255,${0.05*(1-dist/100)})`;
ctx.lineWidth=0.5;
ctx.stroke();
}
}
}
}

let lastScrollY=0;
function animateParticles(){
const scrollDelta=(window.scrollY-lastScrollY)*0.01;
lastScrollY=window.scrollY;
ctx.clearRect(0,0,canvas.width,canvas.height);
particles.forEach(p=>{p.update(scrollDelta);p.draw();});
drawConnections();
requestAnimationFrame(animateParticles);
}
animateParticles();

const heroText=document.getElementById('hero-text');
const chars=heroText.textContent.split('');
heroText.innerHTML='';
chars.forEach((char,i)=>{
const span=document.createElement('span');
span.className='char';
span.textContent=char===' '?'\u00A0':char;
span.style.transitionDelay=(i*30)+'ms';
heroText.appendChild(span);
});

function scatterHero(scrollProgress){
const chars=heroText.querySelectorAll('.char');
chars.forEach((char,i)=>{
const offset=scrollProgress;
const dx=(Math.random()-0.5)*offset*200;
const dy=-offset*150-i*offset*30;
const rot=(Math.random()-0.5)*offset*45;
char.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg)`;
char.style.opacity=1-offset*0.8;
});
}

const observer=new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add('active');
entry.target.classList.remove('inactive');
if(entry.target.dataset.counted)return;
const counters=entry.target.querySelectorAll('[data-count]');
counters.forEach(counter=>animateCounter(counter));
const progresses=entry.target.querySelectorAll('.progress');
progresses.forEach(p=>animateProgress(p));
entry.target.dataset.counted='true';
}else{
entry.target.classList.remove('active');
entry.target.classList.add('inactive');
}
});
},{threshold:0.15,rootMargin:'-10% 0px'});

sections.forEach(section=>observer.observe(section));

function animateCounter(el){
const target=parseInt(el.dataset.count);
const duration=2000;
const start=performance.now();
function update(now){
const progress=Math.min((now-start)/duration,1);
el.textContent=Math.floor(progress*target);
if(progress<1)requestAnimationFrame(update);
}
requestAnimationFrame(update);
}

function animateProgress(el){
const target=parseInt(el.dataset.progress);
const duration=2000;
const circumference=314;
const start=performance.now();
const percentEl=el.parentElement.nextElementSibling;
function update(now){
const progress=Math.min((now-start)/duration,1);
const eased=1-Math.pow(1-progress,3);
const offset=circumference-(eased*target/100)*circumference;
el.style.strokeDashoffset=offset;
if(percentEl)percentEl.textContent=Math.floor(eased*target)+'%';
if(progress<1)requestAnimationFrame(update);
}
requestAnimationFrame(update);
}

document.querySelectorAll('.project-card').forEach(card=>{
card.addEventListener('mousemove',e=>{
const rect=card.getBoundingClientRect();
const x=(e.clientX-rect.left)/rect.width-0.5;
const y=(e.clientY-rect.top)/rect.height-0.5;
card.style.transform=`perspective(1000px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-8px)`;
});
card.addEventListener('mouseleave',()=>{
card.style.transform='perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
});
});

const nav=document.getElementById('nav');
const hamburger=document.getElementById('hamburger');
const mobileNav=document.getElementById('mobileNav');
const mobileLinks=document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click',()=>{
hamburger.classList.toggle('active');
mobileNav.classList.toggle('active');
});

mobileLinks.forEach(link=>{
link.addEventListener('click',()=>{
hamburger.classList.remove('active');
mobileNav.classList.remove('active');
});
});

window.addEventListener('scroll',()=>{
nav.classList.toggle('scrolled',window.scrollY>50);
});

document.querySelectorAll('a[href^="#"]').forEach(a=>{
a.addEventListener('click',e=>{
e.preventDefault();
const target=document.querySelector(a.getAttribute('href'));
if(target)target.scrollIntoView({behavior:'smooth'});
});
});

let scrollTicking=false;
window.addEventListener('scroll',()=>{
if(!scrollTicking){
requestAnimationFrame(()=>{
const scrollY=window.scrollY;

orbWrappers.forEach(wrapper=>{
const speed=parseFloat(wrapper.dataset.speed)||0.03;
wrapper.style.transform=`translateY(${scrollY*speed}px)`;
});

const gradientAngle=135+(scrollY*0.05);
gradientShift.style.setProperty('--gradient-angle',`${gradientAngle}deg`);

const heroSection=document.getElementById('hero');
const heroRect=heroSection.getBoundingClientRect();
const heroProgress=Math.max(0,Math.min(1,-heroRect.top/heroRect.height));
scatterHero(heroProgress);

const hueShift=scrollY*0.02;
document.querySelectorAll('.gradient-orb').forEach((orb,i)=>{
orb.style.filter=`blur(${100+i*10}px) hue-rotate(${hueShift*(i+1)}deg)`;
});

scrollTicking=false;
});
scrollTicking=true;
}
});
})();
