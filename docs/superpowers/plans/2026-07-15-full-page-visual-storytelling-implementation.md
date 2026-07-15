# 全站章节式视觉叙事实施计划

## 目标

在现有液态金属首屏基础上，建立一个贯穿 Hero、WhyMe、ROI、案例、证书、服务、流程、FAQ 和联系区的统一视觉系统。保留全部业务文案、页面区块顺序、链接、数据和现有功能。

## 约束

- 不修改业务文案、案例数字、证书信息、ROI 公式和联系方式。
- 不增加新的大型前端依赖。
- 全站只保留一个 Three.js Renderer。
- 不启用全站强制平滑滚动或横向滚动。
- 移动端必须有明确降级，不能照搬桌面端复杂效果。
- 不覆盖用户已有的 `PERFORMANCE_REPORT.md` 和 `QR_CODE_INSTRUCTIONS.md` 修改。
- 不 commit、push 或部署。

## 任务一：记录基线并建立章节标记

### 修改文件

- `src/pages/index.astro`
- `src/styles/global.css`

### 实现内容

1. 为页面主体增加视觉故事根节点。
2. 为每个区块的分隔区域增加稳定的章节标记。
3. 建立全局视觉层所需的层级变量和内容安全区。
4. 保证 Canvas 位于内容后方，且不参与点击和布局。
5. 保留当前 Hero 与 WhyMe 之间已有的过渡类名。

### 验证

- 页面结构和区块顺序不变。
- 锚点导航正常。
- 不加载视觉控制器时页面与当前版本一致。

## 任务二：扩展液态金属场景为全页视觉场景

### 修改文件

- `src/lib/liquid-metal-scene.ts`

### 实现内容

1. 增加标准章节状态：
   - `hero`
   - `whyme`
   - `roi`
   - `cases`
   - `certificates`
   - `services`
   - `process`
   - `faq`
   - `contact`
2. 增加章节形态与强度参数：
   - 三条流线
   - 波纹
   - 纵深轨道
   - 边缘反光
   - 单一路径
   - 二维码收束
3. 在章节切换时使用插值，不瞬间切换 Shader 状态。
4. 保持现有 Hero 的液态光幕、鼠标反馈和滚动收束。
5. 增加低频渲染、页面失焦暂停和资源销毁。
6. 维持 WebGL 失败与减少动画模式的回退。

### 验证

- 场景仍只创建一个 Renderer。
- Hero 当前视觉效果没有明显回退。
- 手动切换九种章节状态时 Canvas 非空且形态可区分。
- 页面失焦后停止动画循环。

## 任务三：建立统一章节控制器

### 新增文件

- `src/lib/visual-story-controller.ts`

### 修改文件

- `src/components/HeroLiquidMetal.astro`
- `src/layouts/Layout.astro`

### 实现内容

1. 使用 IntersectionObserver 和滚动位置识别当前章节。
2. 将章节内部滚动位置归一化为 `0-1`。
3. 将章节状态和进度发送给液态金属场景。
4. 提供自定义事件或根节点状态，供区块 DOM 动效读取。
5. 在触控设备、减少动画模式和 WebGL 回退模式下切换质量档位。
6. 清理旧的只服务于 Hero 的 ScrollTrigger，避免两套滚动控制冲突。
7. 保留现有 reveal、计数器和打字机逻辑。

### 验证

- 滚动整页时章节状态按正确顺序切换。
- 快速滚动和反向滚动不会跳到错误章节。
- Hero 打字机、全局 reveal 和计数器仍正常。
- 页面只有一个滚动监听入口和一个场景动画循环。

## 任务四：实现 WhyMe 三线路激活

### 修改文件

- `src/components/WhyMe.astro`

### 实现内容

1. 为三张卡片增加稳定的视觉目标标记。
2. 根据章节进度依次切换卡片激活状态。
3. 增加卡片轻微空间错层和桌面端指针倾斜。
4. 将计数器启动时机与卡片激活状态协调，避免尚未激活就完成计数。
5. 增加三条线路进入与汇合的局部边缘响应。
6. 移动端关闭倾斜，保留激活顺序。

### 验证

- 三张卡片按顺序激活。
- 线路和高光不穿过正文。
- 卡片倾斜不超过设计角度，不改变网格尺寸。
- 移动端无横向溢出。

## 任务五：升级 ROI 交互反馈

### 修改文件

- `src/components/ROICalculator.astro`

### 实现内容

1. 保留现有三个滑块及计算函数。
2. 用 CSS 变量同步每个滑块的归一化进度。
3. 增加金色流体轨道和滑块输入反馈。
4. 结果变化时触发一次液态波纹和数值脉冲。
5. 为年度综合节省增加一次性扫光。
6. 减少动画模式下只更新进度和数值，不播放位移与脉冲。

### 验证

- 所有滑块范围、步长和默认值保持不变。
- 默认结果与当前版本一致。
- 快速拖动时无动画堆积和控制台错误。
- `aria-live` 属性保持有效。

## 任务六：实现案例轨道与证书展陈

### 修改文件

- `src/components/Cases.astro`
- `src/components/Certificates.astro`

### 实现内容

1. 为案例卡增加近景和远景两种进入状态。
2. 增加当前案例轨道节点和数据区高光。
3. 保持案例双列网格，不使用横向轮播。
4. 为证书图片增加桌面端轻微 3D 倾斜和边缘反光。
5. 实现证书大图查看器：
   - 点击与键盘打开
   - 关闭按钮
   - 遮罩关闭
   - `Escape` 关闭
   - 背景滚动锁定
   - 焦点恢复
6. 手机端关闭证书倾斜，保留点击放大。

### 验证

- 六个案例和七张证书内容保持不变。
- 证书大图没有裁切，图片可完整阅读。
- 查看器关闭后焦点返回原证书。
- 手机端证书区高度与滚动体验合理。

## 任务七：实现服务线路与合作流程

### 修改文件

- `src/components/Services.astro`
- `src/components/Process.astro`

### 实现内容

1. 为三张服务卡建立线路映射。
2. 悬停和键盘聚焦时增强当前线路并降低其他线路亮度。
3. 保持推荐卡片现有信息，只增强前后层次和边缘高光。
4. 将流程连接线改为可按滚动进度生长。
5. 四个节点依次进入“未到达、当前、已完成”状态。
6. 移动端使用纵向连接线与节点进度。

### 验证

- 服务按钮保持可点击。
- 键盘聚焦和鼠标悬停具有一致反馈。
- 流程节点按 01 至 04 顺序点亮。
- 动画不改变卡片高度和网格位置。

## 任务八：实现 FAQ 降噪与联系区收束

### 修改文件

- `src/components/FAQ.astro`
- `src/components/Contact.astro`

### 实现内容

1. 保留 FAQ 单项展开逻辑和无障碍属性。
2. FAQ 展开时增加一次性细边缘流光。
3. 联系区增加全局线路收束目标。
4. 二维码外围增加低速金属边框，严格避开二维码有效区域。
5. 指针接近二维码时增强收束，不阻止扫码或点击。
6. 社交卡片按顺序进入，链接行为保持不变。

### 验证

- FAQ 键盘操作、`Escape` 和单项展开正常。
- 二维码仍可识别，视觉层不覆盖二维码。
- 所有外部链接保持原地址。
- 移动端二维码尺寸和社交卡片布局正常。

## 任务九：移动端、无障碍与性能收尾

### 修改文件

- `src/styles/global.css`
- 本轮新增或修改的视觉模块

### 实现内容

1. 统一移动端质量档位和动效开关。
2. 统一 `prefers-reduced-motion` 行为。
3. 确保所有装饰层使用 `aria-hidden` 和 `pointer-events: none`。
4. 控制 DPR、Shader 迭代、反光层和同时运行的动画数量。
5. 页面失焦、区块离屏和无视觉变化时降低渲染负载。
6. 检查长文本、按钮、证书名称和结果数字的容器稳定性。

### 验证

- 390×844 下无横向溢出。
- 减少动画模式下内容完整且状态清楚。
- 页面切换后台后 CPU/GPU 活动明显下降。
- 视觉层不进入键盘焦点顺序。

## 任务十：完整构建和视觉验收

### 构建验证

1. `npm run build`
2. TypeScript `tsc --noEmit`
3. `git diff --check`
4. 浏览器控制台无运行时错误。

### 桌面验证

- 1920×1080
- 1440×900
- 检查九个章节的进入、焦点和离开状态。
- 检查 Canvas 非空、形态连续、文字无遮挡。
- 检查鼠标倾斜、服务线路和二维码收束。

### 移动端验证

- 390×844
- 检查所有区块高度、文本换行和横向溢出。
- 检查移动端降级和滚动流畅度。
- 检查证书查看器与 ROI 滑块触控。

### 功能回归

- Hero 打字机。
- 页面锚点。
- WhyMe 与案例计数器。
- ROI 计算。
- 证书查看器。
- 服务 CTA。
- FAQ。
- 二维码与外部链接。

### Canvas 检查

1. 在 Hero、WhyMe、ROI、Cases、Process 和 Contact 分别截图。
2. 检查 Canvas 非背景像素占比与亮度方差。
3. 确认各章节状态存在可感知差异。
4. 确认任何状态都没有高光覆盖正文。

## 预计文件变化

### 新增

- `src/lib/visual-story-controller.ts`
- `docs/superpowers/plans/2026-07-15-full-page-visual-storytelling-implementation.md`

### 修改

- `src/lib/liquid-metal-scene.ts`
- `src/components/HeroLiquidMetal.astro`
- `src/components/WhyMe.astro`
- `src/components/ROICalculator.astro`
- `src/components/Cases.astro`
- `src/components/Certificates.astro`
- `src/components/Services.astro`
- `src/components/Process.astro`
- `src/components/FAQ.astro`
- `src/components/Contact.astro`
- `src/layouts/Layout.astro`
- `src/pages/index.astro`
- `src/styles/global.css`

### 不修改

- 业务文案和区块顺序
- ROI 公式
- 案例数据与证书内容
- 联系方式和外部链接
- 部署配置
- `PERFORMANCE_REPORT.md`
- `QR_CODE_INSTRUCTIONS.md`

## 完成标准

全页滚动时能够明确感知同一液态金属视觉系统在不同章节中的形态变化，同时内容仍然清晰、功能保持完整、移动端可用、减少动画和 WebGL 回退可靠。完成后只提供本地预览与验证结果，不执行提交、推送或部署。
