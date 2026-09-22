(function () {
  if (window.customElements && customElements.get('dot-field')) return;
  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }
  function hexToRgb(hex) {
    var s = String(hex || '#174EA6').replace('#', '');
    if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
    var n = parseInt(s, 16);
    if (isNaN(n)) return [23,78,166];
    return [(n>>16)&255,(n>>8)&255,n&255];
  }
  class DotField extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.style.display='block'; this.style.position='absolute'; this.style.inset='0';
      this.style.width='100%'; this.style.height='100%';
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText='display:block;width:100%;height:100%;';
      this.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.st = { x:-9999, y:-9999, active:0, target:0, t0:performance.now() };
      this._move = function(e){
        var r=this.getBoundingClientRect();
        this.st.target=(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)?1:0;
        this.st.x=e.clientX-r.left; this.st.y=e.clientY-r.top;
      }.bind(this);
      window.addEventListener('pointermove', this._move, {passive:true});
      this._loop=this._loop.bind(this); this._raf=requestAnimationFrame(this._loop);
      this._last=0; var self=this;
      this._timer=setInterval(function(){ var now=performance.now(); if(now-self._last>90) self._draw(now); }, 40);
    }
    disconnectedCallback(){ cancelAnimationFrame(this._raf); clearInterval(this._timer); window.removeEventListener('pointermove', this._move); this._init=false; }
    _loop(now){ this._raf=requestAnimationFrame(this._loop); this._draw(now); }
    _draw(now){
      this._last=now;
      var rect=this.getBoundingClientRect();
      if (rect.width<2||rect.height<2) return;
      var dpr=Math.min(window.devicePixelRatio||1,2);
      var w=rect.width,h=rect.height;
      var cw=Math.round(w*dpr),ch=Math.round(h*dpr);
      if (this.canvas.width!==cw||this.canvas.height!==ch){ this.canvas.width=cw; this.canvas.height=ch; }
      var ctx=this.ctx; ctx.setTransform(dpr,0,0,dpr,0,0);
      var spacing=Math.max(8,num(this.getAttribute('spacing'),26));
      var baseR=Math.max(0.4,num(this.getAttribute('dot-size'),1.6));
      var rgb=hexToRgb(this.getAttribute('color')||'#174EA6');
      var glow=num(this.getAttribute('glow'),0.5);
      var noiseAmt=num(this.getAttribute('noise'),0.35);
      var waveRadius=Math.max(40,num(this.getAttribute('wave-radius'),260));
      var col='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',';
      var st=this.st; var t=(now-st.t0)/1000;
      st.active += (st.target-st.active)*0.1;
      ctx.clearRect(0,0,w,h);
      var cols=Math.ceil(w/spacing)+1, rows=Math.ceil(h/spacing)+1;
      var offX=(w-(cols-1)*spacing)/2, offY=spacing*0.5;
      for (var j=0;j<rows;j++){
        for (var i=0;i<cols;i++){
          var x=offX+i*spacing, y=offY+j*spacing;
          var amb=Math.sin(x*0.012+y*0.008+t*0.55)*0.5+Math.sin(x*0.031-y*0.024+t*0.9)*0.25;
          var dx=x-st.x, dy=y-st.y; var d=Math.sqrt(dx*dx+dy*dy);
          var fall=Math.max(0,1-d/waveRadius);
          var ripple=Math.sin(d*0.055-t*3.2)*fall*fall*st.active;
          var hs=Math.sin(i*12.9898+j*78.233)*43758.5453;
          var n=noiseAmt>0?((hs-Math.floor(hs))-0.5)*noiseAmt:0;
          var m=Math.max(0,0.45+amb*0.28+ripple*1.2+n);
          var r=baseR*(0.72+m*0.95);
          if (r<=0.05) continue;
          var fade=1-(y/h)*0.5;
          var alpha=Math.min(0.42,(0.06+m*0.24)*fade);
          if (glow>0 && (ripple>0.15||m>1.05)){ ctx.shadowBlur=10*glow; ctx.shadowColor=col+(0.55*glow).toFixed(3)+')'; }
          else { ctx.shadowBlur=0; ctx.shadowColor='transparent'; }
          ctx.fillStyle=col+alpha.toFixed(3)+')';
          ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        }
      }
      ctx.shadowBlur=0;
    }
  }
  customElements.define('dot-field', DotField);
})();
