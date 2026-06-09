/**
 * 性能优化脚本
 * 运行: node optimize.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  publicDir: './public',
  distDir: './dist',
  imageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  maxSizeKB: 200, // 最大图片大小
};

// 工具函数
function getFileSizeInKB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / 1024;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// 扫描图片
function scanImages(dir) {
  const images = [];

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walk(filePath);
      } else if (CONFIG.imageExtensions.includes(path.extname(file).toLowerCase())) {
        const sizeKB = getFileSizeInKB(filePath);
        images.push({
          path: filePath,
          sizeKB: sizeKB,
          optimized: sizeKB <= CONFIG.maxSizeKB,
        });
      }
    }
  }

  walk(dir);
  return images;
}

// 生成报告
function generateReport(images) {
  console.log('\n=== 性能优化报告 ===\n');

  // 统计
  const totalImages = images.length;
  const optimizedImages = images.filter(img => img.optimized).length;
  const totalSizeKB = images.reduce((sum, img) => sum + img.sizeKB, 0);

  console.log(`总图片数: ${totalImages}`);
  console.log(`已优化: ${optimizedImages}/${totalImages}`);
  console.log(`总大小: ${formatSize(totalSizeKB * 1024)}`);
  console.log(`平均大小: ${formatSize((totalSizeKB / totalImages) * 1024)}`);

  // 需要优化的图片
  const needOptimize = images.filter(img => !img.optimized);
  if (needOptimize.length > 0) {
    console.log('\n需要优化的图片:');
    needOptimize.forEach(img => {
      console.log(`  - ${img.path}: ${formatSize(img.sizeKB * 1024)}`);
    });
  } else {
    console.log('\n✅ 所有图片都已优化');
  }

  // 性能建议
  console.log('\n=== 性能建议 ===');
  console.log('1. 启用 Gzip/Brotli 压缩');
  console.log('2. 使用 CDN 加速静态资源');
  console.log('3. 实现图片懒加载');
  console.log('4. 添加 Service Worker 缓存');
  console.log('5. 使用 WebP 格式图片');
  console.log('6. 预加载关键资源');
  console.log('7. 减少 HTTP 请求');
  console.log('8. 优化 CSS 和 JavaScript');
}

// 主函数
function main() {
  console.log('开始性能检查...');

  // 检查图片
  const images = scanImages(CONFIG.publicDir);
  generateReport(images);

  // 检查 dist 目录
  if (fs.existsSync(CONFIG.distDir)) {
    console.log('\n=== 构建产物分析 ===');
    const distSize = calculateDirSize(CONFIG.distDir);
    console.log(`构建产物总大小: ${formatSize(distSize)}`);
  }
}

// 计算目录大小
function calculateDirSize(dir) {
  let totalSize = 0;

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walk(filePath);
      } else {
        totalSize += stat.size;
      }
    }
  }

  walk(dir);
  return totalSize;
}

// 运行
main();
