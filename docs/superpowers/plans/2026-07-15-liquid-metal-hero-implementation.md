# 液态金属首屏实施计划

## 目标

在保留现有首页内容、结构、打字机动画和按钮行为的前提下，用独立的 Three.js Shader 场景替换首屏二维粒子背景，并增加轻量鼠标反馈、滚动收束、按钮扫光和完整降级逻辑。

## 约束

- 不修改任何业务文案、客户名称、数据或链接。
- 不重构首屏以外的业务组件。
- 不引入 React 或全站平滑滚动。
- 不提交、推送或部署。
- 保留当前工作区中与本任务无关的已有修改。

## 任务一：安装最小依赖

### 修改文件

- `package.json`
- `package-lock.json`

### 操作

1. 安装 `three@^0.185.1`。
2. 安装 `gsap@^3.15.0`，仅使用 ScrollTrigger。
3. 安装 `@types/three@^0.185.1` 作为开发依赖。
4. 不安装 React、React Bits、Paper Shaders 或 Lenis。

### 验证

- `npm ls three gsap`
- `npm run build`

## 任务二：建立液态金属场景模块

### 新增文件

- `src/lib/liquid-metal-scene.ts`

### 实现内容

1. 定义集中式场景配置：
   - 色彩
   - 强度
   - DPR 上限
   - 鼠标位移上限
   - 桌面与移动端 Shader 质量
2. 创建 Three.js Renderer、Scene、Camera 和全屏 Plane。
3. 编写 Vertex Shader 与 Fragment Shader：
   - 多层噪声形成液态流动
   - 金属高光集中于右侧
   - 文案区域保持低亮度
   - 支持 `uTime`、`uPointer`、`uScroll`、`uResolution`、`uIntensity`
4. 实现鼠标输入平滑插值。
5. 实现滚动进度更新接口。
6. 实现 ResizeObserver 和窗口 resize 回退。
7. 实现 IntersectionObserver、页面可见性暂停和资源销毁。
8. 初始化失败时返回可识别的失败状态，不抛出到首屏其他脚本。

### 验证

- TypeScript 无未处理类型错误。
- 场景可以独立初始化和销毁。
- Shader 编译失败时页面内容仍然存在。

## 任务三：封装首屏视觉组件

### 新增文件

- `src/components/HeroLiquidMetal.astro`

### 实现内容

1. 输出装饰性 Canvas。
2. 输出文案安全遮罩、暗角和滚动连接线。
3. 设置正确的 `aria-hidden` 和不可聚焦属性。
4. 在组件脚本中动态初始化液态金属场景。
5. 注册 GSAP ScrollTrigger：
   - 首屏滚动时降低亮度
   - 将右侧高光收束为下行金色流线
   - 不修改浏览器原生滚动
6. `prefers-reduced-motion` 时仅渲染静态画面。
7. WebGL 不可用时显示 CSS 黑金渐变。

### 验证

- Canvas 位于内容后方。
- 组件失败不会影响首屏文字与按钮。
- 组件卸载时清理 ScrollTrigger 和场景资源。

## 任务四：接入现有 Hero

### 修改文件

- `src/components/Hero.astro`

### 实现内容

1. 导入并渲染 `HeroLiquidMetal`。
2. 删除 `heroParticles` Canvas。
3. 删除现有二维粒子脚本及相关样式。
4. 保留以下内容逐字不变：
   - 头像
   - 身份标签
   - 两行标题
   - 说明文字
   - 三个客户名称
   - 两个按钮及链接
   - 四项数据
5. 完整保留现有打字机逻辑和 reduced-motion 行为。
6. 为主要按钮增加一次性金属扫光。
7. 调整 Hero 内容层级，确保视觉组件始终在后方。

### 验证

- 对比修改前后的固定文案与链接。
- 打字机先显示第一行，停顿后显示第二行。
- 按钮尺寸在悬停时不变化。

## 任务五：消除重复的首屏滚动控制

### 修改文件

- `src/layouts/Layout.astro`

### 实现内容

1. 删除旧的 `hero-bg`、`hero-grid` 和 `hero-content` 手写滚动视差逻辑。
2. 保留全局 reveal 和计数器逻辑。
3. 确认 Hero 内容不再被两个动画系统同时修改 `transform` 和 `opacity`。
4. 不改变其他区块的滚动进入动画。

### 验证

- 首屏滚动时内容没有抖动或跳变。
- WhyMe 及后续区块 reveal 正常。
- 计数器仍只执行一次。

## 任务六：补充首屏到下一屏的视觉衔接

### 修改文件

- `src/pages/index.astro`

### 实现内容

1. 为 Hero 后的第一个 divider 增加可定位的类名。
2. 让金色流线在首屏底部结束于 divider 附近。
3. WhyMe 不增加新节点；金色边缘光由 Hero 内部连接线和专用 divider 完成。
4. 移动端关闭该连接效果。

### 验证

- Hero 与 WhyMe 之间没有明显视觉断层。
- 连接线不会穿过 WhyMe 标题和卡片。
- 后续 divider 样式不受影响。

## 任务七：构建与视觉验证

### 构建验证

1. `npm run build`
2. 检查构建产物中 Three.js 和 GSAP 是否只加载一次。
3. 检查浏览器控制台错误。

### 桌面验证

- 视口：1920×1080
- 视口：1440×900
- 检查：
  - Canvas 非空白
  - 标题始终清晰
  - 高光不覆盖正文
  - 鼠标反馈平滑
  - 滚动收束正常

### 移动端验证

- 视口：390×844
- 检查：
  - 文案无溢出
  - 按钮无位移
  - Shader 使用简化质量
  - 无鼠标交互
  - 页面滚动流畅

### 无障碍与降级验证

- 模拟 `prefers-reduced-motion: reduce`
- 模拟 WebGL 初始化失败
- 页面切到后台再恢复
- 检查 Canvas 不进入焦点顺序

### Canvas 像素检查

1. 截取首屏 Canvas。
2. 计算非背景像素占比和亮度方差。
3. 确认画面不是全黑、全透明或静态空白。

## 任务八：最终差异检查

1. `git diff --check`
2. 检查 `git status`，只列出本任务新增或修改文件。
3. 对照设计规格逐项确认。
4. 不修改 `PERFORMANCE_REPORT.md`、`QR_CODE_INSTRUCTIONS.md` 和 `.superpowers/` 中已有内容。
5. 向用户提供本地预览地址、修改摘要和验证结果。

## 预计文件变化

### 新增

- `src/components/HeroLiquidMetal.astro`
- `src/lib/liquid-metal-scene.ts`

### 修改

- `package.json`
- `package-lock.json`
- `src/components/Hero.astro`
- `src/layouts/Layout.astro`
- `src/pages/index.astro`

### 不修改

- 首屏和其他区块的业务文案
- 客户名称与业务数据
- 证书内容
- 联系方式
- 部署配置
- `src/components/WhyMe.astro`
