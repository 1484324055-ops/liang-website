# 微信二维码维护说明

## 当前状态

微信二维码已经配置并正常显示，不需要额外放置占位图片。

源文件位置：

```text
D:\Projects\个人网站\src\assets\images\wechat-qr.png
```

页面引用位置：

```text
src/components/Contact.astro
```

Astro 会在构建时自动生成优化后的 WebP 文件。当前构建后的二维码约为 43.5 KB。

## 更换二维码

1. 准备新的正方形二维码图片。
2. 使用同名文件覆盖：

   ```text
   D:\Projects\个人网站\src\assets\images\wechat-qr.png
   ```

3. 重新构建：

   ```powershell
   cd "D:\Projects\个人网站"
   npm run build
   ```

4. 启动生产预览：

   ```powershell
   npm run preview -- --host 127.0.0.1 --port 4323
   ```

5. 打开联系区，确认二维码清晰、没有裁切并且可以正常识别。

## 文件检查

```powershell
Get-Item "D:\Projects\个人网站\src\assets\images\wechat-qr.png"
```

二维码由 `Contact.astro` 使用 Astro `Image` 组件加载。不要再把重复副本放入 `public/images/`，避免构建产物和维护路径混乱。
