# pixi-interact-kit

PixiJS 拖拽交互管理器 - 用于管理 PixiJS 场景中的拖拽、缩放、旋转操作

## 特性

-  **拖拽控制** - 直观的拖拽交互
-  **旋转操作** - 支持对象旋转
-  **缩放控制** - 支持双向和单向缩放
-  **精确控制** - 提供8个控制点和1个旋转控制点
-  **父子关系支持** - 正确处理复杂的对象层级关系

## 安装

`ash
npm install pixi-interact-kit
`

## 使用方法

`javascript
import { Application, Sprite, Texture } from 'pixi.js'
import { Drager } from 'pixi-interact-kit'

// 创建 PixiJS 应用
const app = new Application({
  width: 800,
  height: 600
})

// 创建拖拽管理器
const drager = new Drager(app)

// 创建一个精灵对象
const sprite = new Sprite(Texture.WHITE)
sprite.width = 100
sprite.height = 100
sprite.tint = 0x00ff00
sprite.anchor.set(0.5) // 设置锚点为中心，便于旋转

// 添加到场景和拖拽管理器
app.stage.addChild(sprite)
drager.add(sprite)
`

## API 文档

### Drager 类

#### 构造函数
`javascript
new Drager(app)
`
- pp - PixiJS Application 实例

#### 方法

**add(obj)**
- 添加对象到拖拽管理器
- obj - 要添加的 PixiJS 对象（Sprite、Graphics 等）

**remove(obj)**
- 从拖拽管理器中移除对象
- obj - 要移除的对象

**LookDragerContainer()**
- 打印当前管理器中的所有对象（调试用）

#### 控制点说明

- **UpperLeft, UpperRight, LowerLeft, LowerRight** - 角点，用于等比缩放
- **Upper, Lower** - 上下边中点，用于垂直缩放
- **Left, Right** - 左右边中点，用于水平缩放
- **Rotate** - 旋转控制点

## 注意事项

1. **锚点设置**：为了获得最佳的旋转效果，建议在添加对象前设置锚点：
   `javascript
   sprite.anchor.set(0.5) // 中心锚点
   `

2. **父子关系**：支持复杂的父子对象关系，控制框会正确跟随对象的世界变换

3. **性能**：管理器会在每帧更新控制框位置，适合中等数量的交互对象

## 许可证

MIT

## 作者

bysq-2006
