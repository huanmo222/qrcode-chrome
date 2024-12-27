// 获取当前标签页信息
async function getCurrentTab() {
  try {
    console.log('开始获取当前标签页...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('获取到标签页:', {
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl
    });
    return tab;
  } catch (error) {
    console.error('获取标签页失败:', error);
    return null;
  }
}

// 生成二维码
async function generateQRCodeForPopup(url, favicon) {
  const qrcodeDiv = document.getElementById('qrcode');
  const defaultIcon = chrome.runtime.getURL('icons/icon.svg');
  await generateQRCode(qrcodeDiv, url, favicon, defaultIcon);
}

// 初始化
async function init() {
  try {
    const tab = await getCurrentTab();
    if (!tab) {
      throw new Error('无法获取当前标签页信息');
    }

    const faviconImg = document.getElementById('favicon');
    const siteName = document.getElementById('site-name');
    const defaultIcon = chrome.runtime.getURL('icons/icon.svg');

    // 设置网站信息
    faviconImg.src = tab.favIconUrl || defaultIcon;
    siteName.textContent = tab.title ? tab.title.split(' - ')[0] : '未知网站';

    // 生成二维码
    await generateQRCodeForPopup(tab.url, tab.favIconUrl || defaultIcon);
  } catch (error) {
    console.error('初始化失败:', error);
    document.querySelector('.container').innerHTML = `
      <div style="color: red; text-align: center;">
        加载失败，请重试<br>
        ${error.message}
      </div>
    `;
  }
}

// 确保QRCode库加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM加载完成');
  console.log('QRCode库状态:', typeof QRCode);
  if (typeof QRCode === 'undefined') {
    console.error('QRCode库未加载，请检查qrcode.min.js文件');
    return;
  }
  init();
}); 