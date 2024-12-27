// 创建浮动图标和二维码容器
function createFloatingIcon() {
  // 检查是否已存在图标
  if (document.getElementById('qr-floating-icon')) {
    return;
  }

  // 创建容器
  const container = document.createElement('div');
  container.id = 'qr-container';
  
  // 创建图标
  const icon = document.createElement('div');
  icon.id = 'qr-floating-icon';
  
  // 创建二维码区域
  const qrArea = document.createElement('div');
  qrArea.id = 'qr-area';
  qrArea.style.display = 'none';
  qrArea.innerHTML = `
    <div class="qr-content">
      <div id="qrcode"></div>
      <div class="site-info">
        <img id="favicon" src="" alt="favicon">
        <span id="site-name"></span>
      </div>
    </div>
  `;
  
  // 获取当前网站的favicon
  const favicon = getFavicon();
  const defaultIcon = chrome.runtime.getURL('icons/icon.svg');
  
  // 使用img元素加载favicon，处理加载失败的情况
  const img = document.createElement('img');
  img.alt = 'QR Code';
  img.onerror = () => {
    img.src = defaultIcon;  // 加载失败时使用默认图标
  };
  img.src = favicon;  // 尝试加载网站favicon
  
  icon.appendChild(img);
  
  // 添加到页面
  container.appendChild(icon);
  container.appendChild(qrArea);
  document.body.appendChild(container);

  // 点击图标时显示/隐藏二维码
  icon.addEventListener('click', async () => {
    if (qrArea.style.display === 'none') {
      // 获取当前页面信息
      const url = window.location.href;
      const favicon = getFavicon();
      const title = document.title;
      
      // 显示二维码
      qrArea.style.display = 'block';
      
      // 设置网站信息
      const faviconImg = qrArea.querySelector('#favicon');
      const siteName = qrArea.querySelector('#site-name');
      faviconImg.src = favicon;
      siteName.textContent = title;
      
      // 生成二维码
      if (typeof QRCode !== 'undefined') {
        const qrcodeDiv = qrArea.querySelector('#qrcode');
        const defaultIcon = chrome.runtime.getURL('icons/icon.svg');
        await window.generateQRCode(qrcodeDiv, url, favicon, defaultIcon);
      }
    } else {
      qrArea.style.display = 'none';
    }
  });

  // 点击其他区域关闭二维码
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && qrArea.style.display === 'block') {
      qrArea.style.display = 'none';
    }
  });
}

// 注入QRCode库
function injectQRCodeScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('qrcode.min.js');
  document.head.appendChild(script);
}

// 确保在页面加载完成后创建图标
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectQRCodeScript();
    createFloatingIcon();
  });
} else {
  injectQRCodeScript();
  createFloatingIcon();
}

// 添加错误处理
window.addEventListener('error', (e) => {
  console.error('Content script error:', e);
});

// 获取网站favicon的函数
function getFavicon() {
  // 按优先级获取favicon
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel*="icon"]'
  ];
  
  for (const selector of selectors) {
    const link = document.querySelector(selector);
    if (link?.href) {
      return link.href;
    }
  }
  
  // 如果都没找到，返回默认的favicon路径
  return '/favicon.ico';
} 