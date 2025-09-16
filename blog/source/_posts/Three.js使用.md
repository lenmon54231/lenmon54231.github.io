---
title: Three.js使用
date: 2023-10-15 11:38:42
tags: [three.js]
---

## Three.js使用

前端搞 3D 图形化这块的入门首选就是：Three.js，主要还是文档全面（并且支持中文，这点很难得），支持的工具也比较丰富，对应网上也可以查到一些大神做的 3D 方案。

<!-- more -->

### 常用代码块

```js
const mainHDR = await loadEnvMapByHDR(
  require("@/assets/hdr/diamond.hdr"),
  this.render3dCtx.renderer
);
setAllMaterials(
  model,
  {
    envMap: mainHDR,
    envMapIntensity: 1.2,
    side: FrontSide,
    forceSinglePass: true,
  },
  (material) => {
    return !material.isMeshBasicMaterial;
  }
);
```

### 坐标系 axisHelper

three 用的是右手坐标系

即：x 朝右，y 朝上，z 朝外面

#### 反转角度

```js
rotation.x = -0.5 * Math.PI; // 沿x轴顺时针旋转90°
rotation.x = -1 * Math.PI; // 沿x轴顺时针旋转180°

rotation.x = 0.5 * Math.PI; // 沿x轴逆时针旋转90°
rotation.x = 1 * Math.PI; // 沿x轴逆时针旋转180°
```

其他轴同理

### 渲染器 WebGLRenderer

#### 构造器实例化

```js
const canvas = document.querySelector("#three");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
```

#### 属性功能

1. 添加阴影 shadowMap

   ```js
   renderer.shadowMap.enabled = true; // 添加阴影
   ```

2. 开始渲染 render

   ```js
   renderer.render(scene, camera);
   ```

3. 输出颜色 toneMappingExposure

   ```js
   renderer.toneMapping = THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure = 8; //色调映射的曝光级别。默认是1(显示色彩)
   renderer.outputEncoding = THREE.sRGBEncoding;
   ```

   toneMapping:色调映射

   ```js
   THREE.NoToneMapping;
   THREE.LinearToneMapping;
   THREE.ReinhardToneMapping;
   THREE.CineonToneMapping;
   THREE.ACESFilmicToneMapping;
   ```

   outputEncoding:渲染器的输出编码

   ```js
   THREE.LinearEncoding;
   THREE.sRGBEncoding;
   THREE.BasicDepthPacking;
   THREE.RGBADepthPacking;
   ```

4. 光照模式 physicallyCorrectLights

   是否使用物理上正确的光照模式。 默认是 false

5. test

### 几何体 Geometry

#### 立方体 BoxBufferGeometry

BoxGeometry 是四边形几何类, 它通常用给定的长宽高参数构造立方体或不规则四边形

```js
THREE.BoxGeometry(
  width,
  height,
  depth,
  widthSegments,
  heightSegments,
  depthSegments
);
```

width — X 轴上面的宽度，默认值为 1。
height — Y 轴上面的高度，默认值为 1。
depth — Z 轴上面的深度，默认值为 1。
widthSegments — （可选）宽度的分段数，默认值是 1。
heightSegments — （可选）高度的分段数，默认值是 1。
depthSegments — （可选）深度的分段数，默认值是 1。

#### 平面类 PlaneGeometry

PlaneGeometry 是平面类, 其实是一个长方形，而不是数学意义上无限大小的平面;

```js
THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
```

#### 球体 SphereBufferGeometry

SphereGeometry 是球体类, 构造函数如下所示 ( radius 是半径； segmentsWidth 表示经度上的切片数； segmentsHeight 表示纬度上的切片数； phiStart 表示经度开始的弧度； phiLength 表示经度跨过的弧度； thetaStart 表示纬度开始的弧度； thetaLength 表示纬度跨过的弧度), 其中需要注意的是在使用时可以根据经纬度切片数来定制球形外形, 可以通过经纬度弧度来定制球形起始形状;

```js
THREE.SphereGeometry(
  radius,
  segmentsWidth,
  segmentsHeight,
  phiStart,
  phiLength,
  thetaStart,
  thetaLength
);
```

#### 圆形或者扇形类 CircleGeometry

CircleGeometry 几何类可以创建圆形或者扇形;

```js
THREE.CircleGeometry(radius, segments, thetaStart, thetaLength);
```

#### 圆柱体 CylinderBufferGeometry

构造函数如下所示( radiusTop 与 radiusBottom 分别是顶面和底面的半径，由此可知，当这两个参数设置为不同的值时，实际上创建的是一个圆台； height 是圆柱体的高度； radiusSegments 与 heightSegments 可类比球体中的分段； openEnded 是一个布尔值，表示是否没有顶面和底面，缺省值为 false，表示有顶面和底面);

```js
THREE.CylinderGeometry(
  radiusTop,
  radiusBottom,
  height,
  radiusSegments,
  heightSegments,
  openEnded
);
```

#### TetrahedronGeometry 正多边体

TetrahedronGeometry / 正四面体、OctahedronGeometry / 正八面体、IcosahedronGeometry / 正二十面体的构造函数分别如下所示;

```js
THREE.TetrahedronGeometry(radius, detail);
THREE.OctahedronGeometry(radius, detail);
THREE.IcosahedronGeometry(radius, detail);
```

#### 圆环面, 也为甜甜圈的形状 TorusGeometry

```js
THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
```

#### 圆环结 TorusKnotGeometry

```js
THREE.TorusKnotGeometry(
  radius,
  tube,
  radialSegments,
  tubularSegments,
  p,
  q,
  heightScale
);
```

#### 锥形几何类 ConeGeometry

```js
THREE.ConeGeometry(
  radius,
  height,
  radialSegments,
  heightSegments,
  openEnded,
  thetaStart,
  thetaLength
);
```

### 材质 Material

#### 基础网格材质 MeshBasicMaterial

一个以简单着色（平面或线框）方式来绘制几何体的材质。

这种材质不受光照的影响。

#### Lambert 网格材质 MeshLambertMaterial

一种非光泽表面的材质，没有镜面高光。

这可以很好地模拟一些表面（例如未经处理的木材或石材），但不能模拟具有镜面高光的光泽表面（例如涂漆木材）

#### Phong 网格材质 MeshPhongMaterial

一种用于具有镜面高光的光泽表面的材质。

该材质可以模拟具有镜面高光的光泽表面（例如涂漆木材）

#### 标准网格材质 MeshStandardMaterial

一种基于物理的标准材质

这种方法与旧方法的不同之处在于，不使用近似值来表示光与表面的相互作用，而是使用物理上正确的模型。 我们的想法是，不是在特定照明下调整材质以使其看起来很好，而是可以创建一种材质，能够“正确”地应对所有光照场景。

### 材质属性

1. 颜色 color
2. 环境贴图 envMap:应该添加由 PMREMGenerator 预处理过的环境贴图
3. 环境贴图系数 envMapIntensity: 缩放环境贴图的效果。
4. 金属材质感 metalness
5. 粗糙材质感 roughness
6. 法线贴图纹理 normalMap：用于创建法线贴图的纹理

envMapIntensity 可以查看一下图示：

![金属感和粗糙感](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/%E6%9D%90%E8%B4%A8%E6%95%88%E6%9E%9C.png)

### 相机 camera

#### 透视相机 PerspectiveCamera

模拟真实人眼看到的相机，即：远大近小

```js
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 60;
```

fov — 摄像机视锥体垂直视野角度
aspect — 摄像机视锥体长宽比
near — 摄像机视锥体近端面
far — 摄像机视锥体远端面

![透视相机图示](https://limengtupian.oss-cn-beijing.aliyuncs.com/%E5%8D%9A%E5%AE%A2BLOG%E4%B8%93%E7%94%A8%E5%9B%BE%E5%BA%93/PerspectiveCameraIntrduce.jpg)

### 光源 light

#### 平行光 DirectionalLight

通常模拟太阳光

```js
new THREE.DirectionalLight(0xffffff, 0.6);
```

color - (可选参数) 16 进制表示光的颜色。 缺省值为 0xffffff (白色)。
intensity - (可选参数) 光照的强度。缺省值为 1。

#### 球形光源 HemisphereLight

固定在场景上方的光源，所以第一个参数是天空颜色，第二个参数是地面颜色，中间会有渐变的光线颜色

```js
THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
```

skyColor - (可选参数) 天空中发出光线的颜色。 缺省值 0xffffff。
groundColor - (可选参数) 地面发出光线的颜色。 缺省值 0xffffff。
intensity - (可选参数) 光照强度。 缺省值 1。

#### 点光源 PointLight

```js
const light = new THREE.PointLight(0xff0000, 1, 100);
light.position.set(50, 50, 50);
```

PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )
color - (可选参数)) 十六进制光照颜色。 缺省值 0xffffff (白色)。
intensity - (可选参数) 光照强度。 缺省值 1。

distance - 这个距离表示从光源到光照强度为 0 的位置。 当设置为 0 时，光永远不会消失(距离无穷大)。缺省值 0.
decay - 沿着光照距离的衰退量。缺省值 1。 在 physically correct 模式中，decay = 2。

### 阴影 shadow

阴影需要投射到一个平面上，并且模型要处于光源和平面之间

1. 开启渲染器的阴影
   ```js
   const renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); //是否执行抗锯齿
   renderer.shadowMap.enabled = true; // 允许添加阴影
   ```
2. 设定一个平面
   ```js
   const plane = new THREE.PlaneGeometry(300, 300); // 生成模型
   let material = new THREE.MeshPhongMaterial({
     // 生成材质
     color: "#d9d9d9",
     shininess: 0,
   });
   let floor = new THREE.Mesh(plane, material); // 赋予模型材质
   floor.rotation.x = -0.5 * Math.PI;
   floor.receiveShadow = true;
   floor.position.y = -15;
   ```
3. 添加光源
   添加平行光，平行光可以产生阴影
   ```js
   const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
   //光源等位置
   dirLight.position.set(-10, 40, 0);
   //可以产生阴影
   dirLight.castShadow = true;
   dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
   ```
4. 添加模型
   ```js
   const textureLoader = new THREE.TextureLoader();
   let sphereGeometry = new THREE.SphereGeometry(15, 32, 16);
   let material = new THREE.MeshBasicMaterial({
     color: 0xffff00,
   });
   const sphere = new THREE.Mesh(sphereGeometry, material);
   sphere.castShadow = true;
   ```
5. 调整光源、模型、平面的相对位置

#### tips

- rotation:

  ```js
  floor.rotation.x = -0.5 * Math.PI; // 沿着x轴顺时针旋转90度

  floor.rotation.x = 0.5 * Math.PI; // 沿着x轴逆时针旋转90度
  ```

- receiveShadow
  是否接受阴影
- castShadow
  对象是否被渲染到阴影贴图中，需要 平行光和模型都 开启 castShadow=true
- 调整位置
  需要考虑四个位置：1、相机位置，2、平行光位置，3、模型位置，4、平面位置
  1. 相机处于 z 轴正方向，并离模型有一定距离
  2. 平行光位于 y 轴上方，朝下投影
  3. 模型在 y 轴方向上处于平行光下面
  4. 平面在 y 轴方向上处于模型下方

### 控制器

Orbit controls（轨道控制器）可以使得相机围绕目标进行轨道运动

```js
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
```

object: （必须）将要被控制的相机。该相机不允许是其他任何对象的子级，除非该对象是场景自身。

domElement: 用于事件监听的 HTML 元素。

renderer.domElement 是 WebGLRenderer 实例化的一个对象，包含了基于 canvas 渲染的元素

#### 控制器属性

1. minDistance（最小距离）
2. maxDistance （最大距离）
3. target.set(0, 0, 60)（控制器焦点位置）

   当旋转整个模型时，需要围绕一个焦点来进行运动，比如：围绕一个房子进行旋转，保持房子在中心位置，则需要将焦点放置到房子的坐标

4. test

### 控制显示精细度

```js
    resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      var width = window.innerWidth;
      var height = window.innerHeight;
      var canvasPixelWidth = canvas.width / window.devicePixelRatio;
      var canvasPixelHeight = canvas.height / window.devicePixelRatio;

      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    },
```

如果 canvas 的宽高不等于设备的实际宽高，则需要重新 setSize 一下

### 组 Group

目的是使得组中对象在语法上的结构更加清晰。

#### 语法

```js
const group = new THREE.Group();
group.add(cubeA);
group.add(cubeB);

scene.add(group);
```

#### 使用场景举例

做一个太阳东升西落的效果，那么需要一个 太阳模型+平行光，而这两个对象都是有一摸一样的轨迹和动作。

此时，可以使用 group 来控制分组

### 自定义事件 EventDispatcher

#### 举例

```js
class Cat extends EventDispatcher {
  start() {
    this.dispatchEvent({
      type: "start",
      message: "lee Test",
    });
  }
}

const littleCat = new Cat();

littleCat.addEventListener("start", (event) => {
  alert(event.message);
});

littleCat.start();
```

littleCat.start()调用 dispatchEvent 触发自定义事件，
找到实例上名称为 start 的自定义事件，显示 alert

### TWEEN.js 入门

#### 安装

```js
npm i @tweenjs/tween.js@^18
```

#### 缓动效果查询网站

[查询网站](https://easings.net/)

#### 如何设计一个连续的动作变化

tween.chain 可以将一个 tween 和另一个 tween 连接起来，从而实现连续的动作，注意：需要从后往前不停叠加 chain。

例如：

```js
let tween1 = createShoesTWEEN({ y: 1.5, z: 60 }, { y: 2.5, z: 60 }, model);
let tween2 = createShoesTWEEN({ y: 0.5, z: 60 }, { y: 1.5, z: 60 }, model);
let tween3 = createShoesTWEEN({ y: 0, z: 60 }, { y: 0.5, z: 60 }, model);
tween2.chain(tween1);
tween3.chain(tween2);
tween3.start();
```

上面的动作会是： 从 y：0 到 0.5 到 1.5 到 2.5

#### 如何设计一个无限循环的动作变化

```js
let tween1 = createShoesTWEEN({ y: 1.5, z: 60 }, { y: 2.5, z: 60 }, model);
let tween2 = createShoesTWEEN({ y: 0.5, z: 60 }, { y: 1.5, z: 60 }, model);
tween1.chain(tween2);
tween2.chain(tween1);
tween2.start();
```

两个 tween 相互调用可以实现无限循环

### GLTF 加载

1. 引入

   ```js
   import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
   ```

2. 实例化

   ```js
   const gltfLoader = new GLTFLoader();
   ```

3. 创建对象

   ```js
   gltfLoader.load(
     "/models/MaterialsVariantsShoe/glTF/MaterialsVariantsShoe.gltf",
     (gltf) => {
       gltf.scene.scale.set(300, 300, 300);
       gltf.scene.position.x = 0;
       gltf.scene.position.y = -20;
       gltf.scene.position.z = 0;
       resolve(gltf.scene);
     }
   );
   ```

4. 场景中添加

   ```js
   scene.add(gltf.scene);
   ```

5. test

### CSS2DRenderer 标签点击事件无效

在 three.js 0.13X 版本后,上面 dom 的 onclick 不会触发，原因是控制器 Controls

#### OrbitControls 改成 canvas 的 renderer

let obtControls = new OrbitControls(camera, renderer.domElement);

#### 将 labelRenderer 改成 none

let labelRenderer = new CSS2DRenderer()

labelRenderer.domElement.style.pointerEvents = "none";

#### 将 CSS2DObject 的 pointerEvents 改成 auto
