// 生成带favicon的二维码
async function generateQRCode(qrcodeDiv, url, favicon, defaultIcon) {
  try {
    console.log('开始生成二维码:', { url, favicon });
    qrcodeDiv.innerHTML = '';
    
    return new Promise((resolve) => {
      // 创建MutationObserver监听二维码生成
      const observer = new MutationObserver((mutations, obs) => {
        const canvas = qrcodeDiv.querySelector('canvas');
        const img = qrcodeDiv.querySelector('img');
        
        if (canvas && img) {
          console.log('检测到Canvas和Image元素');
          obs.disconnect();  // 停止观察
          
          // 等待一下确保二维码完全渲染
          setTimeout(() => {
            const ctx = canvas.getContext('2d');
            const size = 24;  // 图标尺寸保持24px
            const padding = 4;  // 将白色边距设置为4px
            
            // 确保完全居中
            const x = Math.floor((canvas.width - size) / 2);
            const y = Math.floor((canvas.height - size) / 2);
            
            console.log('绘制参数:', { size, padding, x, y });
            
            // 先清除中心区域
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - padding, y - padding, size + padding * 2, size + padding * 2);
            
            // 加载并绘制图标
            const img = new Image();
            img.onload = function() {
              console.log('图标加载成功');
              ctx.drawImage(img, x, y, size, size);
              console.log('图标绘制完成');
              
              // 显示canvas，隐藏img
              canvas.style.display = 'block';
              qrcodeDiv.querySelector('img').style.display = 'none';
              
              resolve();
            };
            img.onerror = function(e) {
              console.log('图标加载失败，使用默认图标:', e);
              const fallbackImg = new Image();
              fallbackImg.onload = function() {
                ctx.drawImage(fallbackImg, x, y, size, size);
                console.log('默认图标绘制完成');
                
                // 显示canvas，隐藏img
                canvas.style.display = 'block';
                qrcodeDiv.querySelector('img').style.display = 'none';
                
                resolve();
              };
              fallbackImg.onerror = function(e) {
                console.error('默认图标加载失败:', e);
                resolve();
              };
              fallbackImg.src = defaultIcon;
            };
            img.src = favicon || defaultIcon;
          }, 100);
        }
      });
      
      // 开始观察DOM变化
      observer.observe(qrcodeDiv, {
        childList: true,
        subtree: true
      });
      
      console.log('创建QRCode实例');
      // 创建QRCode实例
      new QRCode(qrcodeDiv, {
        text: url,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    qrcodeDiv.innerHTML = `
      <div style="color: red; text-align: center;">
        二维码生成失败<br>
        ${error.message}
      </div>
    `;
  }
}

// 导出函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateQRCode };
} else {
  window.generateQRCode = generateQRCode;
} 