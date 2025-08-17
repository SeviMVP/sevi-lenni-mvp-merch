// Simple slider only for elements with [data-slider]
document.querySelectorAll('[data-slider]').forEach(function(slider){
  const imgs = Array.from(slider.querySelectorAll('img'));
  let i = 0;
  function show(n){ imgs.forEach((el,idx)=> el.classList.toggle('active', idx===n)); }
  function next(){ i = (i+1) % imgs.length; show(i); }
  function prev(){ i = (i-1+imgs.length) % imgs.length; show(i); }
  slider.querySelector('.next').addEventListener('click', next);
  slider.querySelector('.prev').addEventListener('click', prev);

  // Touch support
  let startX = 0;
  slider.addEventListener('touchstart', e=> startX = e.touches[0].clientX, {passive:true});
  slider.addEventListener('touchend', e=> {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 30) { dx < 0 ? next() : prev(); }
  }, {passive:true});
});
