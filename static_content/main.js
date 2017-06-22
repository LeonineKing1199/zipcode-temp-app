(function() {
  'use strict';

  let isReqPending = false;
  
  const makeRequest = (zip) => {
    if (isReqPending) {
      return;
    }

    const url      = '/api/temp';
    const method   = 'POST';
    const useAsync = true;

    return new Promise((resolve, reject) => {
      isReqPending = true;

      const xhr = new XMLHttpRequest();

      xhr.open(method, url, useAsync);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const { temp, name, isCached } = JSON.parse(xhr.response);
            return resolve({ temp, name, isCached });
          }

          reject(new Error(xhr.responseText || 'AJAX error occurred'));
        }
      };

      xhr.send(JSON.stringify({ zip }));
    });
  };

  const onBtnClick = (inputNode, responseContainer) => () => {
    const zip = inputNode.value;

    makeRequest(zip)
      .then(({ temp, name, isCached }) => {
        responseContainer.innerHTML = '';

        const p = document.createElement('p');

        p.textContent = 
          `It's currently ${temp} F in ${name} ${isCached ? '(displaying cached results)' : ''}`;

        responseContainer.appendChild(p);
      })
      .catch((err) => {
        responseContainer.innerHTML = '';

        const p = document.createElement('p');
        p.textContent = 'An error occurred! Consider checking the developer console for network request statuses';

        responseContainer.appendChild(p);
      })
      .then(() => {
        isReqPending = false;
      });
  };

  const onDOMLoaded = () => {
    const btn       = document.getElementById('get-temp-btn');
    const inputNode = document.getElementById('zipcode-input');

    const responseContainer = document.getElementById('response-container');

    btn.addEventListener('click', onBtnClick(inputNode, responseContainer));
  };

  document.addEventListener('DOMContentLoaded', onDOMLoaded);
})();