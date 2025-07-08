/**
 * 切图狗实验室 - JavaScript实现
 * 包含各种技术实验和沙盒功能
 */

document.addEventListener('DOMContentLoaded', () => {
    // 当页面加载完成后初始化实验
    initExperiments();
    initCodeSandbox();
});

/**
 * 初始化各种技术实验
 */
function initExperiments() {
    // 获取所有实验按钮
    const experimentToggles = document.querySelectorAll('.experiment-toggle');
    
    // 为每个实验按钮添加点击事件
    experimentToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const button = e.target;
            const experimentItem = button.closest('.experiment-item');
            const experimentCanvas = experimentItem.querySelector('.experiment-canvas');
            const experimentId = experimentCanvas.id;
            
            // 切换按钮状态
            if (button.textContent === '启动实验') {
                button.textContent = '停止实验';
                button.classList.add('active');
                
                // 启动对应的实验
                switch (experimentId) {
                    case 'webgl-experiment':
                        startQuantumWaveExperiment(experimentCanvas);
                        break;
                    case 'neural-experiment':
                        startNeuralNetworkExperiment(experimentCanvas);
                        break;
                    case 'hologram-experiment':
                        startHologramExperiment(experimentCanvas);
                        break;
                }
            } else {
                button.textContent = '启动实验';
                button.classList.remove('active');
                
                // 停止对应的实验
                stopExperiment(experimentId);
            }
        });
    });
    
    // 为每个滑块添加事件监听
    const paramSliders = document.querySelectorAll('.param-slider');
    paramSliders.forEach(slider => {
        slider.addEventListener('input', updateExperimentParams);
    });
}

// 存储实验的动画帧请求ID，用于停止动画
const experimentAnimations = {};

/**
 * 启动量子波动实验
 */
function startQuantumWaveExperiment(canvas) {
    // 检查Three.js是否加载
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Experiment disabled.');
        return;
    }
    
    // 创建场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    // 设置相机位置
    camera.position.z = 5;
    
    // 创建着色器材质
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(canvas.width, canvas.height) },
            intensity: { value: 0.5 },
            particleCount: { value: 1000 }
        },
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            uniform float intensity;
            
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                
                // 创建波动效果
                float wave1 = sin(uv.x * 10.0 + time) * 0.5 + 0.5;
                float wave2 = sin(uv.y * 15.0 - time * 0.5) * 0.5 + 0.5;
                float wave = wave1 * wave2 * intensity;
                
                // 添加颜色
                vec3 color = mix(
                    vec3(0.0, 0.95, 1.0), 
                    vec3(1.0, 0.0, 0.9), 
                    wave
                );
                
                // 添加亮度变化
                float brightness = sin(time * 0.2) * 0.2 + 0.8;
                
                gl_FragColor = vec4(color * brightness, wave * 0.8 + 0.2);
            }
        `,
        transparent: true
    });
    
    // 创建平面
    const geometry = new THREE.PlaneGeometry(10, 10);
    const plane = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(plane);
    
    // 动画循环
    let time = 0;
    function animate() {
        experimentAnimations['webgl-experiment'] = requestAnimationFrame(animate);
        
        time += 0.01;
        shaderMaterial.uniforms.time.value = time;
        
        renderer.render(scene, camera);
    }
    
    // 启动动画
    animate();
    
    // 窗口大小调整处理
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        shaderMaterial.uniforms.resolution.value.set(width, height);
    });
}

/**
 * 启动神经网络实验
 */
function startNeuralNetworkExperiment(canvas) {
    // 检查Three.js是否加载
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Experiment disabled.');
        return;
    }
    
    // 创建场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    // 设置相机位置
    camera.position.z = 30;
    
    // 获取网络参数
    const networkDepth = getExperimentParam(canvas, 'network-depth') || 5;
    const connectionStrength = getExperimentParam(canvas, 'connection-strength') || 0.7;
    
    // 创建神经网络节点
    const layers = [];
    const nodeCounts = [8, 12, 16, 12, 8]; // 每层节点数量
    const layerSpacing = 10; // 层之间的间距
    
    // 为每一层创建节点
    for (let l = 0; l < networkDepth; l++) {
        const nodeCount = l < nodeCounts.length ? nodeCounts[l] : 10;
        const layer = [];
        
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(0, 0.95, 1),
            transparent: true,
            opacity: 0.8
        });
        
        // 创建节点并定位
        for (let n = 0; n < nodeCount; n++) {
            const node = new THREE.Mesh(geometry, material);
            
            // 计算节点位置
            node.position.x = l * layerSpacing - (networkDepth * layerSpacing) / 2;
            node.position.y = (n - (nodeCount - 1) / 2) * 2;
            node.position.z = Math.random() * 5 - 2.5;
            
            scene.add(node);
            layer.push(node);
        }
        
        layers.push(layer);
    }
    
    // 创建层之间的连接
    const connections = [];
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f2ff,
        transparent: true,
        opacity: 0.2
    });
    
    // 连接相邻层的节点
    for (let l = 0; l < layers.length - 1; l++) {
        const currentLayer = layers[l];
        const nextLayer = layers[l + 1];
        
        for (let i = 0; i < currentLayer.length; i++) {
            for (let j = 0; j < nextLayer.length; j++) {
                // 根据连接强度决定是否创建连接
                if (Math.random() < connectionStrength) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        currentLayer[i].position,
                        nextLayer[j].position
                    ]);
                    
                    const line = new THREE.Line(geometry, lineMaterial);
                    scene.add(line);
                    connections.push({
                        line: line,
                        start: currentLayer[i],
                        end: nextLayer[j],
                        active: false,
                        delay: Math.random() * 100
                    });
                }
            }
        }
    }
    
    // 创建相机控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 动画循环
    let frame = 0;
    function animate() {
        experimentAnimations['neural-experiment'] = requestAnimationFrame(animate);
        
        frame++;
        
        // 更新节点的脉动效果
        layers.forEach((layer, layerIndex) => {
            layer.forEach((node, nodeIndex) => {
                const pulse = Math.sin(frame * 0.02 + layerIndex * 0.5 + nodeIndex * 0.1) * 0.2 + 0.8;
                node.scale.set(pulse, pulse, pulse);
                
                // 随机激活一些节点
                if (Math.random() < 0.01) {
                    node.material.color.setRGB(1, 0, 0.9);
                    setTimeout(() => {
                        node.material.color.setRGB(0, 0.95, 1);
                    }, 300);
                }
            });
        });
        
        // 更新连接的激活状态
        connections.forEach(conn => {
            if (frame % 120 === conn.delay) {
                conn.active = true;
                conn.progress = 0;
                conn.line.material = new THREE.LineBasicMaterial({
                    color: 0xff00e4,
                    transparent: true,
                    opacity: 0.8
                });
            }
            
            if (conn.active) {
                conn.progress += 0.02;
                if (conn.progress >= 1) {
                    conn.active = false;
                    conn.line.material = lineMaterial;
                }
            }
        });
        
        controls.update();
        renderer.render(scene, camera);
    }
    
    // 启动动画
    animate();
    
    // 窗口大小调整处理
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

/**
 * 启动全息投影实验
 */
function startHologramExperiment(canvas) {
    // 检查Three.js是否加载
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Experiment disabled.');
        return;
    }
    
    // 创建场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    // 设置相机位置
    camera.position.z = 5;
    
    // 获取全息投影参数
    const transparency = getExperimentParam(canvas, 'transparency') || 0.7;
    const scanlinesDensity = getExperimentParam(canvas, 'scanlines-density') || 20;
    
    // 创建全息UI元素
    const geometry = new THREE.BoxGeometry(4, 4, 0.1);
    
    // 创建全息材质
    const hologramMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            transparency: { value: transparency },
            scanlinesDensity: { value: scanlinesDensity }
        },
        vertexShader: `
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float transparency;
            uniform float scanlinesDensity;
            varying vec2 vUv;
            
            void main() {
                // 基础颜色
                vec3 color = vec3(0.0, 0.95, 1.0);
                
                // 扫描线效果
                float scanline = sin(vUv.y * scanlinesDensity + time * 2.0) * 0.5 + 0.5;
                scanline = pow(scanline, 3.0);
                
                // 边缘发光效果
                float edge = max(0.0, 0.8 - 2.0 * abs(vUv.x - 0.5) - 1.5 * abs(vUv.y - 0.5));
                edge = pow(edge, 0.5);
                
                // 闪烁效果
                float flicker = sin(time * 20.0) * 0.03 + 0.97;
                
                // 干扰效果
                float noise = fract(sin(vUv.x * 100.0 + vUv.y * 100.0 + time) * 5000.0);
                noise = smoothstep(0.0, 1.0, noise);
                
                // 计算最终颜色和透明度
                vec3 finalColor = color * (scanline * 0.3 + 0.7) * flicker;
                float alpha = transparency * edge + noise * 0.05;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const hologram = new THREE.Mesh(geometry, hologramMaterial);
    scene.add(hologram);
    
    // 添加一些全息UI元素
    const uiGeometry = new THREE.PlaneGeometry(3, 0.5);
    const uiMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Vector3(1, 0, 0.9) }
        },
        vertexShader: `
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            
            void main() {
                float alpha = 0.0;
                
                // 创建线条效果
                if (vUv.y > 0.4 && vUv.y < 0.6) {
                    alpha = 0.8;
                }
                
                // 创建点状指示器
                float indicator = sin(time * 5.0) * 0.5 + 0.5;
                if (vUv.x > 0.9 - indicator * 0.1) {
                    alpha = 0.9;
                }
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    // 创建多个UI元素
    for (let i = 0; i < 3; i++) {
        const uiElement = new THREE.Mesh(uiGeometry, uiMaterial.clone());
        uiElement.position.y = -i * 0.8 + 1;
        uiElement.position.z = 0.1;
        uiElement.material.uniforms.color.value = new THREE.Vector3(
            i === 0 ? 1 : 0,
            i === 1 ? 1 : 0,
            i === 2 ? 1 : 0.9
        );
        hologram.add(uiElement);
    }
    
    // 动画循环
    let time = 0;
    function animate() {
        experimentAnimations['hologram-experiment'] = requestAnimationFrame(animate);
        
        time += 0.01;
        hologramMaterial.uniforms.time.value = time;
        
        // 更新所有子元素的时间
        hologram.children.forEach(child => {
            child.material.uniforms.time.value = time;
        });
        
        // 旋转全息图
        hologram.rotation.y = Math.sin(time * 0.5) * 0.3;
        
        renderer.render(scene, camera);
    }
    
    // 启动动画
    animate();
    
    // 添加交互
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        hologram.rotation.y = mouseX * 0.5;
        hologram.rotation.x = mouseY * 0.2;
    });
    
    // 窗口大小调整处理
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

/**
 * 获取实验参数值
 */
function getExperimentParam(canvas, paramName) {
    const experimentItem = canvas.closest('.experiment-item');
    const slider = experimentItem.querySelector(`[data-param="${paramName}"]`);
    return slider ? slider.value / 100 : null;
}

/**
 * 更新实验参数
 */
function updateExperimentParams(e) {
    const slider = e.target;
    const experimentItem = slider.closest('.experiment-item');
    const experimentCanvas = experimentItem.querySelector('.experiment-canvas');
    const experimentId = experimentCanvas.id;
    
    // 根据实验类型更新对应参数
    switch (experimentId) {
        case 'webgl-experiment':
            // 更新量子波动实验参数
            break;
        case 'neural-experiment':
            // 更新神经网络参数
            break;
        case 'hologram-experiment':
            // 更新全息投影参数
            break;
    }
}

/**
 * 停止实验
 */
function stopExperiment(experimentId) {
    if (experimentAnimations[experimentId]) {
        cancelAnimationFrame(experimentAnimations[experimentId]);
        delete experimentAnimations[experimentId];
    }
}

/**
 * 初始化代码沙盒
 */
function initCodeSandbox() {
    const sandboxTabs = document.querySelectorAll('.sandbox-tab');
    const runButton = document.getElementById('run-code');
    const resetButton = document.getElementById('reset-code');
    const previewIframe = document.getElementById('preview-iframe');
    
    // HTML、CSS和JS编辑器
    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const jsEditor = document.getElementById('js-editor');
    
    // 设置默认值
    htmlEditor.value = '<!-- 在这里输入您的HTML代码 -->\n<div class="demo">\n  <h1>量子波动实验</h1>\n  <p>未来科技演示</p>\n</div>';
    cssEditor.value = '/* 在这里输入您的CSS代码 */\n.demo {\n  background: linear-gradient(45deg, #00f2ff, #ff00e4);\n  padding: 20px;\n  border-radius: 10px;\n  color: white;\n  text-align: center;\n  box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);\n}';
    jsEditor.value = '// 在这里输入您的JavaScript代码\ndocument.addEventListener("DOMContentLoaded", () => {\n  const title = document.querySelector("h1");\n  title.addEventListener("click", () => {\n    title.style.textShadow = "0 0 10px #fffc00";\n  });\n});';
    
    // 标签切换功能
    sandboxTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活动标签
            sandboxTabs.forEach(t => t.classList.remove('active'));
            // 激活当前标签
            tab.classList.add('active');
            
            // 显示对应的编辑器
            const editorType = tab.getAttribute('data-tab');
            const editors = document.querySelectorAll('.sandbox-editor');
            editors.forEach(editor => {
                editor.classList.remove('active');
                if (editor.getAttribute('data-editor') === editorType) {
                    editor.classList.add('active');
                }
            });
        });
    });
    
    // 运行代码按钮
    runButton.addEventListener('click', () => {
        const html = htmlEditor.value;
        const css = cssEditor.value;
        const js = jsEditor.value;
        
        // 构建预览HTML
        const previewContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    ${css}
                </style>
            </head>
            <body>
                ${html}
                <script>
                    ${js}
                </script>
            </body>
            </html>
        `;
        
        // 更新预览框架
        const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(previewContent);
        iframeDoc.close();
    });
    
    // 重置代码按钮
    resetButton.addEventListener('click', () => {
        if (confirm('确定要重置所有代码吗？')) {
            htmlEditor.value = '<!-- 在这里输入您的HTML代码 -->\n<div class="demo">\n  <h1>量子波动实验</h1>\n  <p>未来科技演示</p>\n</div>';
            cssEditor.value = '/* 在这里输入您的CSS代码 */\n.demo {\n  background: linear-gradient(45deg, #00f2ff, #ff00e4);\n  padding: 20px;\n  border-radius: 10px;\n  color: white;\n  text-align: center;\n  box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);\n}';
            jsEditor.value = '// 在这里输入您的JavaScript代码\ndocument.addEventListener("DOMContentLoaded", () => {\n  const title = document.querySelector("h1");\n  title.addEventListener("click", () => {\n    title.style.textShadow = "0 0 10px #fffc00";\n  });\n});';
            
            // 清空预览
            const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('');
            iframeDoc.close();
        }
    });
    
    // 初始运行一次代码
    setTimeout(() => {
        runButton.click();
    }, 1000);
} 