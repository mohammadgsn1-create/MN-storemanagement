// settings.js — page-specific logic for settings.html
// Uses shared shell behavior in js/base.js

  

  // ---- live currency conversion preview (USD -> LBP) ----
  const rateInput = document.getElementById('exchangeRate');
  const ratePreview = document.getElementById('ratePreview');

  function updateRatePreview(){
    const rate = parseFloat(rateInput.value) || 0;
    const oneUsd = rate.toLocaleString();
    const hundredUsd = (rate * 100).toLocaleString();
    ratePreview.innerHTML = `$1.00 = ${oneUsd} ل.ل &nbsp;·&nbsp; $100.00 = ${hundredUsd} ل.ل`;
  }
  rateInput.addEventListener('input', updateRatePreview);
