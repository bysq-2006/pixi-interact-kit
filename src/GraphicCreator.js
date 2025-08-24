import { Container, Graphics } from 'pixi.js'

/**
 * 用于创建各种图形
 * 可以实现点击拖拽创造各种图形
 * 
 * @note 设计限制：
 * GraphicCreator在全局坐标系下工作。
 * 如果目标容器（this.dir）有旋转、缩放等变换，绘制的图形位置可能不符合预期。
 * 
 * @example
 * // 推荐用法：使用未变换的容器
 * const creator = new GraphicCreator(app);
 * creator.dir = app.stage; // 或其他未旋转/缩放的容器
 * 
 * // 避免这样使用：
 * const rotatedContainer = new Container();
 * rotatedContainer.rotation = Math.PI / 4; // 旋转45度
 * creator.dir = rotatedContainer; // 可能导致绘制位置偏差
 */
export class GraphicCreator {
  constructor(app) {
    this.app = app
    this.dir = app.stage //新创建的图形默认的存放路径
    this.mode = 'none' //当前创建图形的模式
    this.drawToObj = false //是否正在绘制图形
    this.onCreate = null // 钩子函数，创建时回调

    // 绑定this
    this.click = this.click.bind(this)
    this.move = this.move.bind(this)
    this.loosen = this.loosen.bind(this)

    this.init()
  }

  /**
   * 设置当前创建图形的模式
   * @param {string} mode - 模式名称，目前支持:
   * - 'none' - 无模式
   * - 'rect' - 矩形
   * - 'circle' - 圆形
   * - 'line' - 直线
   * - 'triangle' - 三角形
   */
  setMode(mode) {
    this.mode = mode
  }

  init() {
    this.app.renderer.events.domElement.addEventListener('pointerdown', this.click)
    this.app.renderer.events.domElement.addEventListener('pointermove', this.move)
    this.app.renderer.events.domElement.addEventListener('pointerup', this.loosen)
  }

  /**
   * 销毁方法
   * @example
   * graphicCreator.destroy()
   * graphicCreator = null // 之后将引用置空
   */
  destroy() {
    this.app.renderer.events.domElement.removeEventListener('pointerdown', this.click)
    this.app.renderer.events.domElement.removeEventListener('pointermove', this.move)
    this.app.renderer.events.domElement.removeEventListener('pointerup', this.loosen)
  }

  // 添加一个绘制函数映射表
  drawMap = {
    rect: (graphics, x, y, w, h) => graphics.rect(x, y, w, h),

    circle: (graphics, x, y, w, h) => {
      const r = Math.sqrt(w * w + h * h) / 2
      graphics.circle(w / 2, h / 2, r)
    },

    line: (graphics, x, y, w, h) => graphics.moveTo(x, y).lineTo(x + w, y + h),
    
    triangle: (graphics, x, y, w, h) => {
      graphics.poly([
        x, y + h,
        x + w / 2, y,
        x + w, y + h
      ])
    }
  }

  click() {
    if (this.mode === 'none') return
    const graphics = new Graphics()
    const point = this.getPoint()
    graphics.x = point.x
    graphics.y = point.y
    // 记录起始点坐标
    this.startPoint = { x: point.x, y: point.y }
    // 初始宽高都为1
    this.drawMap[this.mode]?.(graphics, 0, 0, 1, 1)
    graphics.fill({ color: 0xffffff }).stroke({ width: 2, color: 0x000000 })
    this.dir.addChild(graphics)
    this.drawToObj = graphics
    // 钩子回调
    if (typeof this.onCreate === 'function') {
      this.onCreate(graphics)
    }
  }

  move() {
    if (!this.drawToObj) return
    const point = this.getPoint()
    
    // 计算矩形的左上角和宽高
    const left = Math.min(this.startPoint.x, point.x)
    const top = Math.min(this.startPoint.y, point.y)
    const width = Math.abs(point.x - this.startPoint.x)
    const height = Math.abs(point.y - this.startPoint.y)

    // 设置图形位置为左上角
    this.drawToObj.x = left
    this.drawToObj.y = top
    this.drawToObj.clear()
    this.drawMap[this.mode]?.(this.drawToObj, 0, 0, width, height)
    this.drawToObj.fill({ color: 0xffffff }).stroke({ width: 2, color: 0x000000 })
  }

  loosen() {
    this.drawToObj = false
    this.startPoint = null // 清理起始点
  }

  getPoint() {
    const rect = this.app.canvas.getBoundingClientRect();
    // 将PixiJS坐标转换为DOM坐标系
    return {
      x: this.app.renderer.events.pointer.x - rect.left,
      y: this.app.renderer.events.pointer.y - rect.top
    }
  }
}