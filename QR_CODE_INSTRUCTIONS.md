# 微信二维码图片放置说明

## 当前状态
网站中已配置微信二维码显示位置，但需要您手动放置图片文件。

## 放置步骤

### 1. 保存二维码图片
将您发送的微信二维码图片保存到以下位置：
```
f:\Obsidian\lzj-notes\20_项目\个人网站\public\images\wechat-qr.jpg
```

### 2. 图片要求
- **文件名**: `wechat-qr.jpg`（必须严格匹配）
- **格式**: JPG 或 JPEG
- **建议尺寸**: 400x400 像素（正方形）
- **文件大小**: 建议小于 200KB

### 3. 验证图片
放置图片后，可以通过以下命令检查：
```bash
# 检查图片是否存在
ls -lh d:/Obsidian/lzj-notes/website/public/images/wechat-qr.jpg

# 检查图片大小
python -c "import os; print(f'{os.path.getsize(\"d:/Obsidian/lzj-notes/website/public/images/wechat-qr.jpg\") / 1024:.1f} KB')"
```

### 4. 重新构建网站
图片放置后，重新构建网站：
```bash
cd d:/Obsidian/lzj-notes/website
npm run build
```

### 5. 预览效果
启动本地服务器查看效果：
```bash
npm run dev
```

然后访问 http://localhost:4322 查看二维码是否正确显示。

## 替代方案

如果您无法直接放置图片，可以：

1. **使用在线图片**: 将二维码图片上传到图床，然后修改 `src/components/Contact.astro` 中的图片链接
2. **使用占位符**: 暂时保持当前的占位符样式

## 技术细节

二维码在网站中的位置：
- **文件**: `src/components/Contact.astro`
- **CSS类**: `.contact-qr-img`
- **样式**: 圆角、边框、悬停效果

## 联系方式

如果遇到问题，请检查：
1. 图片文件名是否正确
2. 图片路径是否正确
3. 图片格式是否支持
4. 文件权限是否正确
