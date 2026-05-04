document.addEventListener('DOMContentLoaded', function(){
  const track = document.querySelector('.carousel-track');
  if(!track) return;
  const slides = Array.from(track.children);
  const nextBtn = document.querySelector('.carousel-next');
  const prevBtn = document.querySelector('.carousel-prev');
  const total = slides.length;
  let current = 0;
  const intervalTime = 5000; // 5 segundos
  let intervalId = null;

  function update(){
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  function next(){
    current = (current + 1) % total;
    update();
  }

  function prev(){
    current = (current - 1 + total) % total;
    update();
  }

  function startAuto(){
    stopAuto();
    intervalId = setInterval(next, intervalTime);
  }

  function stopAuto(){
    if(intervalId) clearInterval(intervalId);
  }

  function resetAuto(){
    stopAuto();
    startAuto();
  }

  if(nextBtn){
    nextBtn.addEventListener('click', function(e){
      e.preventDefault();
      next();
      resetAuto();
    });
  }

  if(prevBtn){
    prevBtn.addEventListener('click', function(e){
      e.preventDefault();
      prev();
      resetAuto();
    });
  }

  // Inicializar
  update();
  startAuto();

  // Opcional: navegación por teclas izquierda/derecha
  document.addEventListener('keydown', function(e){
    if(e.key === 'ArrowRight'){ next(); resetAuto(); }
    if(e.key === 'ArrowLeft'){ prev(); resetAuto(); }
  });
});
