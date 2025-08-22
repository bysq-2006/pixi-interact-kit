import { Container, Application, Graphics } from 'pixi.js'

/**
 * Drager 拖拽交互管理器
 * 用于管理 PixiJS 场景中的拖拽对象
 * @example
 * const drager = new Drager(app) //传入你的application实例
 */
export class Drager {
  constructor(app) {
    this.targetMap = new Map() // 用于存储目标对象与拖动框的映射,双向关联的
    this.app = app // 引用
    this.DragerContainer = null // 用来快速定位,存放拖拽对象的容器
    this.handleSize = 10 // 控制框的尺寸
    this.init()
  }
  // 初始化方法
  init() {
    this.DragerContainer = new Container()
    this.DragerContainer.label = 'DragerContainer'
    this.app.stage.addChild(this.DragerContainer)
    this.app.ticker.add(this.update, this) // 传递方法引用和上下文
    this.app.renderer.events.domElement.addEventListener('pointerup', this.interaction.loosen) // 监听全局的松开事件
  }
  /**
   * 添加拖拽对象到DragerContainer
   * add(对象)，最好是添加精灵或者图形
   * @param {Object} obj - 要添加的对象
   * @examplef
   * // 传入对象本身
   * drager.add(sprite)
   * 本插件旋转只会更改角度，要绕轴心旋转请在添加对象时设置好锚点
   * sprite.anchor.set(0.5) // 设置锚点为中心
  */
  add(obj) {
    const newContainer = new Container()
    newContainer.label = obj.label
    this.DragerContainer.addChild(newContainer)
    this.targetMap.set(obj, newContainer)
    this.targetMap.set(newContainer, obj) // 双向关联
    this.ControlBoxGraphics(obj) // 添加控制框图形
    newContainer.interactive = true // 使容器可交互
    newContainer.on('pointerdown', this.interaction.click) // 绑定交互事件
  }
  /**
   * 移除拖拽对象，在DragerContainer里面
   * @param {Object|string} obj - 要移除的对象
   * @example
   * // 传入对象本身
   * drager.remove(sprite)
  */
  remove(obj) {
    const target = this.targetMap.get(obj)
    if (target) {
      this.targetMap.delete(obj)
      this.targetMap.delete(target) // 删除双向关联
      this.DragerContainer.removeChild(target) // 从容器中移除
      target.destroy({ children: true }) // 彻底销毁
    } else {
      console.warn(`对于删除${obj}对应的元素的操作，`, '未找到对应的拖拽对象')
    }
  }
  // 交互方法
  interaction = {
    status_: 'none', // 交互状态，none,scaleXY,scaleX,scaleY,rotate
    click: (e) => {
      this.interaction.record(e)
      switch (e.target.label) {
        case 'UpperLeft':
          this.interaction.status_ = 'scaleXY'
          break
        case 'UpperRight':
          this.interaction.status_ = 'scaleXY'
          break
        case 'LowerLeft':
          this.interaction.status_ = 'scaleXY'
          break
        case 'LowerRight':
          this.interaction.status_ = 'scaleXY'
          break
        case 'Upper':
          this.interaction.status_ = 'scaleY'
          break
        case 'Lower':
          this.interaction.status_ = 'scaleY'
          break
        case 'Left':
          this.interaction.status_ = 'scaleX'
          break
        case 'Right':
          this.interaction.status_ = 'scaleX'
          break
        case 'Rotate':
          this.interaction.status_ = 'rotate'
          break
        default:
          this.interaction.status_ = 'none'
      }
    },
    // 记录点击时的值
    record: (e) => {
      this.interaction.goalEvent = e.target.parent // 记录当前点击事件的目标的父亲
      this.interaction.obj = this.targetMap.get(this.interaction.goalEvent); // 记录当前点击事件绑定的对象
      this.interaction.globXY = this.interaction.obj.getGlobalPosition()
      this.interaction.scaleStart = { x: this.interaction.obj.scale.x, y: this.interaction.obj.scale.y } // 记录初始缩放
      this.interaction.rotationStart = this.interaction.obj.rotation; // 记录全局旋转角度
      this.interaction.startClick = e.data.getLocalPosition(this.app.stage) // 记录初始点击位置
    },
    // 必须绑定到整个canvas画板，不然的话一旦脱出画框外就不生效就会看起来一卡一卡的
    loosen: () => {
      this.interaction.status_ = 'none' // 松开鼠标后重置状态
      this.interaction.goalEvent = null // 清除目标事件
    },
    // 使用全局坐标系
    move: () => {
      if (this.interaction.status_ === 'none') return // 如果没有交互状态则不处理
      function pointToPerpendicularLineDistance(center, ref, target) {
        // 计算从点 target 到(经过center,并且和center和ref垂直的线)线的距离
        const dirX = ref.x - center.x;
        const dirY = ref.y - center.y;
        const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
        if (dirLength === 0) {
          return 0; // Handle zero vector case
        }
        const normDirX = dirX / dirLength;
        const normDirY = dirY / dirLength;
        const toTargetX = target.x - center.x;
        const toTargetY = target.y - center.y;
        const projection = toTargetX * normDirX + toTargetY * normDirY;
        return Math.abs(projection);
      }

      const rect = this.app.canvas.getBoundingClientRect();
      // 将PixiJS坐标转换为DOM坐标系
      const mouseX = this.app.renderer.events.pointer.x - rect.left;
      const mouseY = this.app.renderer.events.pointer.y - rect.top;
      const globXY = this.interaction.globXY
      const start = this.interaction.startClick;

      switch (this.interaction.status_) {
        case 'scaleXY': // 缩放
          const startDist = Math.hypot(start.x - globXY.x, start.y - globXY.y);
          const currentDist = Math.hypot(mouseX - globXY.x, mouseY - globXY.y);
          const scaleRatio = currentDist / startDist;
          this.interaction.obj.scale.x = this.interaction.scaleStart.x * scaleRatio; // 逆向缩放
          this.interaction.obj.scale.y = this.interaction.scaleStart.y * scaleRatio; // 逆向缩放
          break
        case 'scaleX': // 水平缩放
          const startDistX = pointToPerpendicularLineDistance(globXY, start, start)
          const currentDistX = pointToPerpendicularLineDistance(globXY, start, { x: mouseX, y: mouseY })
          const scaleRatioX = currentDistX / startDistX;
          this.interaction.obj.scale.x = this.interaction.scaleStart.x * scaleRatioX;
          break
        case 'scaleY': // 垂直缩放
          const startDistY = pointToPerpendicularLineDistance(globXY, start, start)
          const currentDistY = pointToPerpendicularLineDistance(globXY, start, { x: mouseX, y: mouseY })
          const scaleRatioY = currentDistY / startDistY;
          this.interaction.obj.scale.y = this.interaction.scaleStart.y * scaleRatioY;
          break
        case 'rotate': // 旋转
          // 计算起始角度和当前角度
          const startAngle = Math.atan2(start.y - globXY.y, start.x - globXY.x);
          const currentAngle = Math.atan2(mouseY - globXY.y, mouseX - globXY.x);
          const deltaAngle = currentAngle - startAngle;
          this.interaction.obj.rotation = this.interaction.rotationStart + deltaAngle;
          break
      }
    },
  }
  /**
   * 添加控制框图形到DragerContainer
   * @param {Object} obj - 要添加控制框的对象
  */
  ControlBoxGraphics(obj) {
    const objWidth = obj.width
    const objHeight = obj.height
    const handleSize = this.handleSize // 控制框的尺寸

    function CreateTemplateSquare(x, y) {
      const square = new Graphics()
      square.rect(0, 0, handleSize, handleSize)    // 绘制小方块
      square.stroke({ width: 2, color: 0x000000 }) // 设置边框宽度和颜色（2像素黑色）
      square.fill({ color: 0xffffff })             // 设置填充颜色为白色
      square.x = x - handleSize / 2                // 居中对齐
      square.y = y - handleSize / 2
      square.interactive = true // 使小方块可交互
      return square
    }

    const UpperLeft = CreateTemplateSquare(0, 0)
    UpperLeft.label = 'UpperLeft'
    const UpperRight = CreateTemplateSquare(objWidth, 0)
    UpperRight.label = 'UpperRight'
    const LowerLeft = CreateTemplateSquare(0, objHeight)
    LowerLeft.label = 'LowerLeft'
    const LowerRight = CreateTemplateSquare(objWidth, objHeight)
    LowerRight.label = 'LowerRight'
    const Upper = CreateTemplateSquare(objWidth / 2, 0)
    Upper.label = 'Upper'
    const Lower = CreateTemplateSquare(objWidth / 2, objHeight)
    Lower.label = 'Lower'
    const Left = CreateTemplateSquare(0, objHeight / 2)
    Left.label = 'Left'
    const Right = CreateTemplateSquare(objWidth, objHeight / 2)
    Right.label = 'Right'
    const Rotate = CreateTemplateSquare(objWidth * 1.2, objHeight / 2)
    Rotate.label = 'Rotate'

    this.targetMap.get(obj).addChild(UpperLeft, UpperRight, LowerLeft, LowerRight,
      Upper, Lower, Left, Right, Rotate)
  }
  LookDragerContainer() {
    console.log('DragerContainer中的对象:')
    this.DragerContainer.children.forEach((child, index) => {
      console.log(`${index}: ${child.label}`, child)
    })
  }
  // 更新方法
  update() {
    this.DragerContainer.children.forEach((child) => {
      const target = this.targetMap.get(child);
      const wt = target.worldTransform;

      // 直接设置变换矩阵
      child.setFromMatrix(wt);

      // 让控制框里的小方块保持固定大小
      child.children.forEach((handle) => {
        // 直接根据父容器的缩放来设置逆缩放
        const parentScaleX = child.scale.x;
        const parentScaleY = child.scale.y;

        if (parentScaleX !== 0 && parentScaleY !== 0) {
          handle.scale.set(1 / parentScaleX, 1 / parentScaleY);
        }
      });

      this.interaction.move();
    });
  }
}