/**
 * 切图狗网站 - 主要JavaScript文件
 * 22世纪科技风格效果实现
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化加载屏幕
    initLoader();
    
    // 初始化导航栏
    initNavigation();
    
    // 初始化背景效果
    initBackground();
    
    // 初始化全息效果
    initHologram();
    
    // 初始化故障文字效果
    initGlitchText();
    
    // 初始化量子波动新闻滑块
    initNewsSlider();
    
    // 初始化虚拟助手
    initAIAssistant();
});

/**
 * 初始化加载屏幕
 */
function initLoader() {
    // 模拟资源加载
    setTimeout(() => {
        const loader = document.querySelector('.loader');
        const body = document.body;
        
        // 淡出加载屏幕
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.8s ease';
        
        // 移除加载屏幕
        setTimeout(() => {
            loader.style.display = 'none';
            body.classList.remove('loading');
            
            // 触发入场动画
            triggerEntranceAnimation();
        }, 800);
    }, 3000); // 3秒后移除加载屏幕
}

/**
 * 触发入场动画
 */
function triggerEntranceAnimation() {
    // 导航栏动画
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
    // 英雄区动画
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelector('.hero-buttons');
    
    heroTitle.style.opacity = '0';
    heroTitle.style.transform = 'translateY(-30px)';
    
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.transform = 'translateY(-20px)';
    
    heroButtons.style.opacity = '0';
    heroButtons.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        heroTitle.style.transition = 'all 0.8s ease';
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0)';
    }, 200);
    
    setTimeout(() => {
        heroSubtitle.style.transition = 'all 0.8s ease';
        heroSubtitle.style.opacity = '1';
        heroSubtitle.style.transform = 'translateY(0)';
    }, 400);
    
    setTimeout(() => {
        heroButtons.style.transition = 'all 0.8s ease';
        heroButtons.style.opacity = '1';
        heroButtons.style.transform = 'translateY(0)';
    }, 600);
}

/**
 * 初始化导航栏
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // 移动端菜单切换
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // 菜单图标动画
            const navIcon = document.querySelector('.nav-icon');
            navIcon.classList.toggle('active');
            
            if (navIcon.classList.contains('active')) {
                navIcon.style.background = 'transparent';
                navIcon.querySelector('::before').style.transform = 'rotate(45deg)';
                navIcon.querySelector('::after').style.transform = 'rotate(-45deg)';
            } else {
                navIcon.style.background = 'var(--color-primary)';
                navIcon.querySelector('::before').style.transform = 'translateY(-10px)';
                navIcon.querySelector('::after').style.transform = 'translateY(10px)';
            }
        });
    }
    
    // 滚动时导航栏效果
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.main-nav');
        
        if (window.scrollY > 50) {
            nav.style.height = '60px';
            nav.style.background = 'rgba(10, 10, 26, 0.95)';
        } else {
            nav.style.height = 'var(--header-height)';
            nav.style.background = 'rgba(10, 10, 26, 0.8)';
        }
    });
}

/**
 * 初始化背景效果
 */
function initBackground() {
    // 检查Three.js是否加载
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Background effects disabled.');
        return;
    }
    
    const canvas = document.getElementById('bg-canvas');
    
    // 创建场景
    const scene = new THREE.Scene();
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 创建神经网络效果
    const particlesCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // 创建材质
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00f2ff,
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });
    
    // 创建点云
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // 创建连接线
    const linePositions = [];
    const lineColors = [];
    const lineGeometry = new THREE.BufferGeometry();
    
    // 连接距离阈值
    const connectionDistance = 10;
    
    // 计算连接线
    for (let i = 0; i < particlesCount; i++) {
        const p1 = {
            x: positions[i * 3],
            y: positions[i * 3 + 1],
            z: positions[i * 3 + 2]
        };
        
        for (let j = i + 1; j < particlesCount; j++) {
            const p2 = {
                x: positions[j * 3],
                y: positions[j * 3 + 1],
                z: positions[j * 3 + 2]
            };
            
            const distance = Math.sqrt(
                Math.pow(p1.x - p2.x, 2) +
                Math.pow(p1.y - p2.y, 2) +
                Math.pow(p1.z - p2.z, 2)
            );
            
            if (distance < connectionDistance) {
                // 添加线段的两个端点
                linePositions.push(p1.x, p1.y, p1.z);
                linePositions.push(p2.x, p2.y, p2.z);
                
                // 根据距离设置颜色透明度
                const alpha = 1 - distance / connectionDistance;
                lineColors.push(0, 0.95, 1, alpha);
                lineColors.push(0, 0.95, 1, alpha);
            }
        }
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 4));
    
    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true
    });
    
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    
    // 动画函数
    function animate() {
        requestAnimationFrame(animate);
        
        // 旋转粒子系统
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.0003;
        
        // 旋转连接线
        lines.rotation.x += 0.0005;
        lines.rotation.y += 0.0003;
        
        // 渲染场景
        renderer.render(scene, camera);
    }
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // 开始动画
    animate();
}

/**
 * 初始化全息效果
 */
function initHologram() {
    // 检查Three.js是否加载
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded. Hologram effects disabled.');
        return;
    }
    
    // 英雄区全息图
    const heroHologram = document.getElementById('hero-hologram');
    
    if (heroHologram) {
        const scene = new THREE.Scene();
        
        // 创建相机
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;
        
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(400, 400);
        heroHologram.appendChild(renderer.domElement);
        
        // 创建几何体 - 复杂的抽象形状
        const geometry = new THREE.IcosahedronGeometry(2, 1);
        
        // 创建材质 - 全息效果
        const material = new THREE.MeshPhongMaterial({
            color: 0x00f2ff,
            emissive: 0x00f2ff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8,
            wireframe: true
        });
        
        // 创建网格
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        // 添加光源
        const light1 = new THREE.PointLight(0x00f2ff, 1, 100);
        light1.position.set(5, 5, 5);
        scene.add(light1);
        
        const light2 = new THREE.PointLight(0xff00e4, 1, 100);
        light2.position.set(-5, -5, 5);
        scene.add(light2);
        
        // 动画函数
        function animateHologram() {
            requestAnimationFrame(animateHologram);
            
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            
            // 脉冲效果
            const time = Date.now() * 0.001;
            mesh.scale.x = 0.8 + Math.sin(time) * 0.2;
            mesh.scale.y = 0.8 + Math.sin(time) * 0.2;
            mesh.scale.z = 0.8 + Math.sin(time) * 0.2;
            
            material.opacity = 0.6 + Math.sin(time * 2) * 0.2;
            
            renderer.render(scene, camera);
        }
        
        // 开始动画
        animateHologram();
    }
    
    // 卡片全息图
    const cardHolograms = document.querySelectorAll('.card-hologram');
    
    // 为每个卡片设置背景图片
    cardHolograms.forEach((hologram, index) => {
        // 设置不同的背景
        switch(index) {
            case 0:
                hologram.style.backgroundImage = "url('images/lab-bg.jpg')";
                break;
            case 1:
                hologram.style.backgroundImage = "url('images/workshop-bg.jpg')";
                break;
            case 2:
                hologram.style.backgroundImage = "url('images/gallery-bg.jpg')";
                break;
            case 3:
                hologram.style.backgroundImage = "url('images/timeline-bg.jpg')";
                break;
            default:
                hologram.style.backgroundImage = "url('images/default-bg.jpg')";
        }
    });
}

/**
 * 初始化故障文字效果
 */
function initGlitchText() {
    const glitchTexts = document.querySelectorAll('.glitch-text');
    
    glitchTexts.forEach(text => {
        const content = text.textContent;
        text.setAttribute('data-text', content);
        
        // 随机故障效果
        setInterval(() => {
            // 随机决定是否触发故障效果
            if (Math.random() > 0.95) {
                // 添加故障类
                text.classList.add('active-glitch');
                
                // 短暂后移除
                setTimeout(() => {
                    text.classList.remove('active-glitch');
                }, 200);
            }
        }, 2000);
    });
}

/**
 * 初始化量子波动新闻滑块
 */
function initNewsSlider() {
    const slider = document.querySelector('.news-slider');
    const items = document.querySelectorAll('.news-item');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.news-prev');
    const nextBtn = document.querySelector('.news-next');
    
    if (!slider || items.length === 0) return;
    
    let currentIndex = 0;
    
    // 更新滑块位置
    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // 更新指示点
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // 上一个
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateSlider();
        });
    }
    
    // 下一个
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateSlider();
        });
    }
    
    // 点击指示点
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });
    
    // 自动轮播
    setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        updateSlider();
    }, 8000);
    
    // 初始化
    updateSlider();
}

/**
 * 初始化虚拟助手
 */
function initAIAssistant() {
    const aiToggle = document.querySelector('.ai-toggle');
    const aiAssistant = document.querySelector('.ai-assistant');
    const aiClose = document.querySelector('.ai-close');
    const aiInput = document.querySelector('.ai-input input');
    const aiSend = document.querySelector('.ai-send');
    const aiMessages = document.querySelector('.ai-messages');
    
    // 切换助手显示
    if (aiToggle) {
        aiToggle.addEventListener('click', () => {
            aiAssistant.classList.add('active');
        });
    }
    
    // 关闭助手
    if (aiClose) {
        aiClose.addEventListener('click', () => {
            aiAssistant.classList.remove('active');
        });
    }
    
    // 发送消息
    function sendMessage() {
        const message = aiInput.value.trim();
        
        if (message) {
            // 添加用户消息
            const userMessage = document.createElement('div');
            userMessage.className = 'ai-message user-message';
            userMessage.innerHTML = `
                <div class="ai-content">${message}</div>
            `;
            aiMessages.appendChild(userMessage);
            
            // 清空输入框
            aiInput.value = '';
            
            // 滚动到底部
            aiMessages.scrollTop = aiMessages.scrollHeight;
            
            // 模拟AI回复
            setTimeout(() => {
                // 生成随机回复
                const responses = [
                    "我是您的量子助手，可以为您提供有关前端技术和设计的信息。",
                    "这是一个很好的问题！在22世纪，我们使用量子计算来处理复杂的设计任务。",
                    "您可以在神经工坊页面找到更多关于AI辅助设计的资源。",
                    "全息投影技术是我们网站的核心特色之一，您可以在实验室页面了解更多。",
                    "我们的量子画廊展示了最前沿的设计作品，欢迎前往探索。"
                ];
                
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                // 添加AI回复
                const aiMessage = document.createElement('div');
                aiMessage.className = 'ai-message';
                aiMessage.innerHTML = `
                    <div class="ai-avatar"></div>
                    <div class="ai-content">${randomResponse}</div>
                `;
                aiMessages.appendChild(aiMessage);
                
                // 滚动到底部
                aiMessages.scrollTop = aiMessages.scrollHeight;
            }, 1000);
        }
    }
    
    // 发送按钮点击
    if (aiSend) {
        aiSend.addEventListener('click', sendMessage);
    }
    
    // 输入框回车
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
} 