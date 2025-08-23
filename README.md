# pixi-interact-kit

PixiJS 拖拽交互管理器 - 用于管理 PixiJS 场景中的拖拽、缩放、旋转操作
在原本的基础之上又封装了一层图形编辑器的功能

## 安装

`bash
npm install pixi-interact-kit
`

## 使用方法

`javascript
import { Drager } from 'pixi-interact-kit'
// 依赖pixi.js

// 创建 PixiJS 应用
const app = new Application()

await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
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

#### 必须传递你的APP实例
`javascript
new Drager(app)
`

#### 方法

**add(obj)**
- 让你的图形拥有控制框
- obj - 要添加的 PixiJS 对象（Sprite、Graphics 等）

**remove(obj)**
- 取消图形的控制框

**toggle(obj)**
- 开关，如果有控制框则取消控制框，如果没有控制框则增加

**removeAll**
- 移除所有拖拽对象



## 注意事项

1. **锚点设置**：为了获得最佳的旋转效果，建议在添加对象前设置锚点：
   `javascript
   sprite.anchor.set(0.5) // 中心锚点
   `

2. **父子关系**：支持复杂的父子对象关系，控制框会正确跟随对象的世界变换

3. **性能**：可以设置帧数，优化的话我个人觉得还行

## 许可证

MIT

## 作者

bysq-2006
