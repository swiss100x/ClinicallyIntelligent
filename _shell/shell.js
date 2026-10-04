<script>
(function(){
  var h=document.querySelector('.site-head'), b=h&&h.querySelector('.sh-menu'), s=document.getElementById('sh-sheet');
  if(!h) return;
  function onS(){ h.classList.toggle('scrolled', window.scrollY>4); } onS(); window.addEventListener('scroll',onS,{passive:true});
  function set(open){ b.setAttribute('aria-expanded',open); s.hidden=!open; document.body.classList.toggle('sh-open',open); b.firstChild.nodeValue=open?'Close ':'Menu '; if(open){ var f=s.querySelector('a'); if(f) f.focus(); } }
  b.addEventListener('click',function(){ set(b.getAttribute('aria-expanded')!=='true'); });
  document.addEventListener('keydown',function(e){
    if(s.hidden) return;
    if(e.key==='Escape'){ set(false); b.focus(); return; }
    if(e.key==='Tab'){
      var f=[b].concat([].slice.call(s.querySelectorAll('a'))), i=f.indexOf(document.activeElement);
      if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); }
    }
  });
  window.addEventListener('resize',function(){ if(window.innerWidth>=880 && !s.hidden) set(false); });
  s.addEventListener('click',function(e){ if(e.target.tagName==='A') set(false); });
})();
</script>