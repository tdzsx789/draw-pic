fetch('http://localhost:5260/getImages')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      data.images.forEach(image => {
        // 直接使用 image.url 作为图片的 src
        const img = document.createElement('img');
        img.src = image.url; // http://localhost:5260/images/filename.jpg
        document.body.appendChild(img);
      });
    }
  });